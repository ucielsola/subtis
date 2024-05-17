import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cache } from "hono/cache";
import timestring from "timestring";
import { z } from "zod";

// internals
import { type AppVariables, getSupabaseClient } from "../shared";

// shared
import { getTitleFileNameMetadata, videoFileNameSchema } from "@subtis/shared";

// schemas
import { moviesVersionSchema, subtitleSchema } from "./schemas";

const subtitlesQuery = `
  id,
  resolution,
  subtitle_link,
  subtitle_file_name,
  releaseGroup: ReleaseGroups ( name ),
  movie: Movies ( name, year, poster, backdrop )
`;

const subtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: "Subtitles not found for movie" })
  .min(1, { message: "Subtitles not found for movie" });

const trendingSubtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: "Trending subtitles not found" })
  .min(1, { message: "Trending subtitles not found" });

const alternativeSubtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: "Alternative subtitles not found for file" })
  .min(1, { message: "Alternative subtitles not found for file" });

// constants
const ONE_WEEK_SECONDS = timestring("1 week");

// core
export const subtitles = new Hono<{ Variables: AppVariables }>()
  .get(
    "/movie/:movieId",
    zValidator("param", z.object({ movieId: z.string() })),
    cache({ cacheName: "subtitles-movie", cacheControl: `s-maxage=${ONE_WEEK_SECONDS}` }),
    async (context) => {
      const { movieId } = context.req.valid("param");

      const { data } = await getSupabaseClient(context)
        .from("Subtitles")
        .select(subtitlesQuery)
        .match({ movie_id: movieId });

      const subtitles = subtitlesSchema.safeParse(data);
      if (!subtitles.success) {
        context.status(404);
        return context.json({ message: subtitles.error.issues[0].message });
      }

      return context.json(subtitles.data);
    },
  )
  .get(
    "/file/name/:bytes/:fileName",
    zValidator("param", z.object({ bytes: z.string(), fileName: z.string() })),
    cache({ cacheName: "subtitle-file", cacheControl: `s-maxage=${ONE_WEEK_SECONDS}` }),
    async (context) => {
      const { bytes, fileName } = context.req.valid("param");

      const videoFileName = videoFileNameSchema.safeParse(fileName);
      if (!videoFileName.success) {
        context.status(415);
        return context.json({ message: videoFileName.error.issues[0].message });
      }

      const supabase = getSupabaseClient(context);

      const { data } = await supabase
        .from("Subtitles")
        .select(subtitlesQuery)
        .match({ movie_file_name: videoFileName.data })
        .single();
      const subtitleByFileName = subtitleSchema.safeParse(data);

      if (!subtitleByFileName.success) {
        await supabase.rpc("insert_subtitle_not_found", { file_name: videoFileName.data });

        const { data } = await supabase.from("Subtitles").select(subtitlesQuery).match({ bytes }).single();

        const subtitleByBytes = subtitleSchema.safeParse(data);

        if (!subtitleByBytes.success) {
          context.status(404);
          return context.json({ message: "Subtitle not found for file" });
        }

        return context.json(subtitleByBytes.data);
      }

      return context.json(subtitleByFileName.data);
    },
  )
  .get(
    "/file/versions/:fileName",
    zValidator("param", z.object({ fileName: z.string() })),
    cache({ cacheName: "subtitle-versions", cacheControl: `s-maxage=${ONE_WEEK_SECONDS}` }),
    async (context) => {
      const { fileName } = context.req.valid("param");

      const videoFileName = videoFileNameSchema.safeParse(fileName);
      if (!videoFileName.success) {
        context.status(415);
        return context.json({ message: videoFileName.error.issues[0].message });
      }

      const supabase = getSupabaseClient(context);
      const { name, year } = getTitleFileNameMetadata({
        titleFileName: videoFileName.data,
      });

      const { data: movieData } = await supabase.from("Titles").select("id").match({ name, year }).single();

      const movieByNameAndYear = moviesVersionSchema.safeParse(movieData);

      if (!movieByNameAndYear.success) {
        context.status(404);
        return context.json({ message: "Movie not found for file" });
      }

      const { data } = await supabase
        .from("Subtitles")
        .select(subtitlesQuery)
        .match({ movie_id: movieByNameAndYear.data.id });

      const subtitleByFileName = alternativeSubtitlesSchema.safeParse(data);

      if (!subtitleByFileName.success) {
        context.status(404);
        return context.json({ message: "Subtitle not found for file" });
      }

      return context.json(subtitleByFileName.data);
    },
  )
  .get("/trending/:limit", zValidator("param", z.object({ limit: z.string() })), async (context) => {
    const { limit } = context.req.valid("param");

    // TODO: Avoid getting more than one subtitle from the same movie
    const { data } = await getSupabaseClient(context)
      .from("Subtitles")
      .select(subtitlesQuery)
      .order("queried_times", { ascending: false })
      .order("last_queried_at", { ascending: false })
      .limit(Number(limit));

    const trendingSubtitles = trendingSubtitlesSchema.safeParse(data);
    if (!trendingSubtitles.success) {
      context.status(404);
      return context.json({ message: trendingSubtitles.error.issues[0].message });
    }

    return context.json(trendingSubtitles.data);
  });
