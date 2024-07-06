import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// shared
import { getTitleFileNameMetadata, videoFileNameSchema } from "@subtis/shared";

// internals
import { MAX_LIMIT } from "../shared/constants";
import { alternativeTitlesSchema, subtitleSchema, subtitlesQuery } from "../shared/schemas";
import { type AppVariables, getSupabaseClient } from "../shared/supabase";

const subtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: "Subtitles not found for title" })
  .min(1, { message: "Subtitles not found for title" });

const trendingSubtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: "Trending subtitles not found" })
  .min(1, { message: "Trending subtitles not found" });

const alternativeSubtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: "Alternative subtitles not found for file" })
  .min(1, { message: "Alternative subtitles not found for file" });

// core
export const subtitles = new Hono<{ Variables: AppVariables }>()
  .get("/movie/:id", zValidator("param", z.object({ id: z.string() })), async (context) => {
    const { id } = context.req.valid("param");

    if (Number.isNaN(Number(id))) {
      context.status(400);
      return context.json({ message: "Invalid ID: it should be a number" });
    }

    const { data } = await getSupabaseClient(context)
      .from("Subtitles")
      .select(subtitlesQuery)
      .order("subtitle_group_id")
      .match({ title_id: Number(id) });

    const subtitles = subtitlesSchema.safeParse(data);
    if (!subtitles.success) {
      context.status(404);
      return context.json({ message: subtitles.error.issues[0].message });
    }

    return context.json(subtitles.data);
  })
  .get(
    "/tv-show/:id/:season?/:episode?",
    zValidator("param", z.object({ id: z.string(), season: z.string().optional(), episode: z.string().optional() })),
    async (context) => {
      const { id, season = 1, episode = 1 } = context.req.valid("param");

      if (Number.isNaN(Number(id))) {
        context.status(400);
        return context.json({ message: "Invalid ID: it should be a number" });
      }

      const { data } = await getSupabaseClient(context)
        .from("Subtitles")
        .select(subtitlesQuery)
        .order("subtitle_group_id")
        .match({ title_id: Number(id), current_season: season, current_episode: episode });

      const subtitles = subtitlesSchema.safeParse(data);
      if (!subtitles.success) {
        context.status(404);
        return context.json({ message: subtitles.error.issues[0].message });
      }

      return context.json(subtitles.data);
    },
  )
  .get("/file/alternatives/:fileName", zValidator("param", z.object({ fileName: z.string() })), async (context) => {
    const { fileName } = context.req.valid("param");

    const videoFileName = videoFileNameSchema.safeParse(fileName);
    if (!videoFileName.success) {
      context.status(415);
      return context.json({ message: videoFileName.error.issues[0].message });
    }

    const supabase = getSupabaseClient(context);
    const { name, year, releaseGroup, resolution } = getTitleFileNameMetadata({
      titleFileName: videoFileName.data,
    });
    const { data: titleData } = await supabase
      .from("Titles")
      .select("id")
      .or(`title_name_without_special_chars.ilike.%${name}%`)
      .match({ year })
      .single();
    const titleByNameAndYear = alternativeTitlesSchema.safeParse(titleData);

    if (!titleByNameAndYear.success) {
      context.status(404);
      return context.json({ message: "Subtitle not found for file" });
    }

    const { data } = await supabase
      .from("Subtitles")
      .select(subtitlesQuery)
      .order("subtitle_group_id")
      .order("queried_times", { ascending: false })
      .match({ title_id: titleByNameAndYear.data.id });

    const subtitleByFileName = alternativeSubtitlesSchema.safeParse(data);

    if (!subtitleByFileName.success) {
      context.status(404);
      return context.json({ message: "Subtitle not found for file" });
    }

    const filteredSubtitlesByResolution = subtitleByFileName.data
      .filter((subtitle) => subtitle.resolution === resolution)
      .sort((a, b) => (a.releaseGroup.release_group_name < b.releaseGroup.release_group_name ? 1 : -1))
      .sort((a, b) => ((a.queried_times || 0) < (b.queried_times || 0) ? 1 : -1));

    if (filteredSubtitlesByResolution.length > 0) {
      return context.json(filteredSubtitlesByResolution);
    }

    if (releaseGroup) {
      const filteredSubtitles = subtitleByFileName.data
        .filter(
          (subtitle) =>
            subtitle.releaseGroup.release_group_name === releaseGroup.release_group_name ||
            subtitle.resolution === resolution,
        )
        .sort((a, b) => (a.releaseGroup.release_group_name < b.releaseGroup.release_group_name ? 1 : -1))
        .sort((a, b) => ((a.queried_times || 0) < (b.queried_times || 0) ? 1 : -1));

      if (filteredSubtitles.length > 0) {
        return context.json(filteredSubtitles);
      }
    }

    return context.json(subtitleByFileName.data);
  })
  .get("/trending/:limit", zValidator("param", z.object({ limit: z.string() })), async (context) => {
    const { limit } = context.req.valid("param");

    if (Number.isNaN(Number(limit))) {
      context.status(400);
      return context.json({ message: "Invalid ID: it should be a number" });
    }

    if (Number(limit) > MAX_LIMIT) {
      context.status(400);
      return context.json({ message: `Limit must be less than or equal to ${MAX_LIMIT}` });
    }

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

    const subtitlesWithoutDuplicates = trendingSubtitles.data.filter(
      (subtitle, index, self) =>
        index === self.slice(index).findIndex((s) => s.title.title_name === subtitle.title.title_name),
    );

    return context.json(subtitlesWithoutDuplicates);
  });
