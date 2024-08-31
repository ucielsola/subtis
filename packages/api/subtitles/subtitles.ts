import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// internals
import { MAX_LIMIT } from "../shared/constants";
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
  .get("/movie/:id", zValidator("param", z.object({ id: z.string() })), async (context) => {
    const { id } = context.req.valid("param");

    if (Number(id) < 1) {
      context.status(400);
      return context.json({ message: "Invalid ID: it should be a positive integer number" });
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

      if (Number(id) < 1) {
        context.status(400);
        return context.json({ message: "Invalid ID: it should be a positive integer number" });
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
  .get("/trending/:limit", zValidator("param", z.object({ limit: z.string() })), async (context) => {
    const { limit } = context.req.valid("param");

    const parsedLimit = Number.parseInt(limit);

    if (parsedLimit < 1) {
      context.status(400);
      return context.json({ message: "Invalid ID: it should be a positive integer number" });
    }

    if (parsedLimit > MAX_LIMIT) {
      context.status(400);
      return context.json({ message: `Limit must be less than or equal to ${MAX_LIMIT}` });
    }

    const { data } = await getSupabaseClient(context)
      .from("Subtitles")
      .select(subtitlesQuery)
      .order("queried_times", { ascending: false })
      .order("last_queried_at", { ascending: false })
      .limit(parsedLimit);

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
