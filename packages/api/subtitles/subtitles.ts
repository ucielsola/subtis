import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import JSZip from "jszip";
import slugify from "slugify";
import { z } from "zod";
// import { cache } from "hono/cache";
// import timestring from "timestring";

// internals
import { MAX_LIMIT } from "../shared/constants";
import { getResultsWithLength, getSubtitleNormalized, getSubtitlesNormalized } from "../shared/parsers";
import { RESOLUTION_REGEX } from "../shared/resolutions";
import { subtitleSchema, subtitlesQuery } from "../shared/schemas";
import { getSupabaseClient } from "../shared/supabase";
import type { AppVariables } from "../shared/types";

// schema
const subtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: "Subtitles not found for title" })
  .min(1, { message: "Subtitles not found for title" });

const trendingSubtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: "Trending subtitles not found" })
  .min(1, { message: "Trending subtitles not found" });

// core
export const subtitles = new Hono<{ Variables: AppVariables }>()
  .get(
    "/movie/:slug",
    zValidator("param", z.object({ slug: z.string() })),
    async (context) => {
      const { slug } = context.req.valid("param");

      const { data, error } = await getSupabaseClient(context)
        .from("Subtitles")
        .select(subtitlesQuery)
        .order("queried_times", { ascending: false })
        .match({ title_slug: slug });

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Subtitles not found for movie ID" });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const subtitles = subtitlesSchema.safeParse(data);

      if (subtitles.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitles.error.issues[0].message });
      }

      const { title } = subtitles.data[0];
      const subtitlesNormalized = subtitles.data.map((subtitle) => getSubtitlesNormalized(subtitle));
      const { results, total } = getResultsWithLength(subtitlesNormalized);

      return context.json({ total, title, results });
    },
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("2 weeks")}` }),
  )
  .get(
    "/tv-show/:imdbId/:season?/:episode?",
    zValidator(
      "param",
      z.object({ imdbId: z.string(), season: z.string().optional(), episode: z.string().optional() }),
    ),
    async (context) => {
      const { imdbId, season = "1", episode = "1" } = context.req.valid("param");

      const parsedSeason = Number.parseInt(season);

      if (Number.isNaN(parsedSeason) || parsedSeason < 1) {
        context.status(400);
        return context.json({ message: "Invalid Season: it should be a positive integer number" });
      }

      const parsedEpisode = Number.parseInt(episode);

      if (Number.isNaN(parsedEpisode) || parsedEpisode < 1) {
        context.status(400);
        return context.json({ message: "Invalid Episode: it should be a positive integer number" });
      }

      const { data, error } = await getSupabaseClient(context)
        .from("Subtitles")
        .select(subtitlesQuery)
        .order("subtitle_group_id")
        .match({ title_imdb_id: imdbId, current_season: parsedSeason, current_episode: parsedEpisode });

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Subtitles not found for TV Show", error: error.message });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const subtitles = subtitlesSchema.safeParse(data);

      if (subtitles.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitles.error.issues[0].message });
      }

      const { title } = subtitles.data[0];
      const subtitlesNormalized = subtitles.data.map((subtitle) => getSubtitlesNormalized(subtitle));
      const { results, total } = getResultsWithLength(subtitlesNormalized);

      return context.json({ total, title, results });
    },
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("2 weeks")}` }),
  )
  .get(
    "/tv-show/download/metadata/:imdbId/:season",
    zValidator("param", z.object({ imdbId: z.string(), season: z.string() })),
    async (context) => {
      const { imdbId, season } = context.req.valid("param");

      const parsedSeason = Number.parseInt(season);

      if (Number.isNaN(parsedSeason) || parsedSeason < 1) {
        context.status(400);
        return context.json({ message: "Invalid Season: it should be a positive integer number" });
      }

      const { data, error } = await getSupabaseClient(context)
        .from("Subtitles")
        .select(subtitlesQuery)
        .order("subtitle_group_id")
        .match({ title_imdb_id: imdbId, current_season: parsedSeason });

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Subtitles not found for TV Show", error: error.message });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const subtitles = subtitlesSchema.safeParse(data);

      if (subtitles.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitles.error.issues[0].message });
      }

      const parsedData = subtitles.data.reduce<Record<string, [number, string][]>>((accumulator, subtitle) => {
        const { resolution, release_group } = subtitle;
        const map = new Map<number, string>(accumulator[resolution] ?? []);
        map.set(release_group.id, release_group.release_group_name);

        return {
          ...accumulator,
          [resolution]: Array.from(map.entries()),
        };
      }, {});

      return context.json(parsedData);
    },
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("1 week")}` }),
  )
  .get(
    "/tv-show/download/season/:imdbId/:season/:resolution/:releaseGroupId",
    zValidator(
      "param",
      z.object({ imdbId: z.string(), season: z.string(), resolution: z.string(), releaseGroupId: z.string() }),
    ),
    async (context) => {
      const { imdbId, season, resolution, releaseGroupId } = context.req.valid("param");

      const parsedSeason = Number.parseInt(season);

      if (Number.isNaN(parsedSeason) || parsedSeason < 1) {
        context.status(400);
        return context.json({ message: "Invalid Season: it should be a positive integer number" });
      }

      const parsedReleaseGroupId = Number.parseInt(releaseGroupId);

      if (Number.isNaN(parsedReleaseGroupId) || parsedReleaseGroupId < 1) {
        context.status(400);
        return context.json({ message: "Invalid Release Group ID: it should be a positive integer number" });
      }

      if (!resolution.match(RESOLUTION_REGEX)) {
        context.status(400);
        return context.json({ message: "Invalid Resolution: it should be a valid resolution" });
      }

      const { data, error } = await getSupabaseClient(context)
        .from("Subtitles")
        .select(subtitlesQuery)
        .order("subtitle_group_id")
        .match({
          resolution,
          title_imdb_id: imdbId,
          current_season: parsedSeason,
          release_group_id: parsedReleaseGroupId,
        });

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Subtitles not found for TV Show" });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const subtitles = subtitlesSchema.safeParse(data);

      if (subtitles.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitles.error.issues[0].message });
      }

      const zip = new JSZip();

      await Promise.all(
        subtitles.data.map(async (subtitle) => {
          const response = await fetch(subtitle.subtitle_link);
          const text = await response.text();

          zip.file(subtitle.subtitle_file_name, text);
        }),
      );

      const zipContent = await zip.generateAsync({ type: "arraybuffer" });

      const [firstSubtitle] = subtitles.data;
      const zipFileName = slugify(
        `${firstSubtitle.title.title_name}-Temporada-${firstSubtitle.current_season}-${resolution}-${firstSubtitle.release_group.release_group_name}.zip`,
      );

      context.header("Content-Type", "application/zip");
      context.header("Content-Disposition", `attachment; filename="${zipFileName}"`);

      return context.body(zipContent);
    },
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("1 week")}` }),
  )
  .get("/trending/download/:limit", zValidator("param", z.object({ limit: z.string() })), async (context) => {
    const { limit } = context.req.valid("param");

    const parsedLimit = Number.parseInt(limit);

    if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
      context.status(400);
      return context.json({ message: "Invalid ID: it should be a positive integer number" });
    }

    if (parsedLimit > MAX_LIMIT) {
      context.status(400);
      return context.json({ message: `Limit must be less than or equal to ${MAX_LIMIT}` });
    }

    const { data, error } = await getSupabaseClient(context)
      .from("Subtitles")
      .select(subtitlesQuery)
      .order("queried_times", { ascending: false })
      .order("last_queried_at", { ascending: false })
      .limit(parsedLimit);

    if (error && error.code === "PGRST116") {
      context.status(404);
      return context.json({ message: "Trending subtitles not found" });
    }

    if (error) {
      context.status(500);
      return context.json({ message: "An error occurred", error: error.message });
    }

    const trendingSubtitles = trendingSubtitlesSchema.safeParse(data);

    if (trendingSubtitles.error) {
      context.status(500);
      return context.json({ message: "An error occurred", error: trendingSubtitles.error.issues[0].message });
    }

    const trendingSubtitlesNormalized = trendingSubtitles.data.map((subtitle) => getSubtitleNormalized(subtitle));

    return context.json(getResultsWithLength(trendingSubtitlesNormalized));
  });
