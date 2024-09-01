import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// db
import { titlesRowSchema } from "@subtis/db/schemas";

// internals
import { MAX_LIMIT } from "../shared/constants";
import { getSupabaseClient } from "../shared/supabase";
import type { AppVariables } from "../shared/types";

// schemas
const searchTitleSchema = titlesRowSchema.pick({ id: true, type: true, title_name: true, year: true, backdrop: true });
const searchTitlesSchema = z.array(searchTitleSchema).min(1);

const recentTitleSchema = titlesRowSchema.pick({
  id: true,
  title_name: true,
  type: true,
  year: true,
  rating: true,
  release_date: true,
});

const recentTitlesSchema = z
  .array(recentTitleSchema, { invalid_type_error: "Recent titles not found" })
  .min(1, { message: "Recent titles not found" });

const trendingTitleSchema = titlesRowSchema.pick({
  id: true,
  title_name: true,
});

const trendingSubtitlesSchema = z
  .array(trendingTitleSchema, { invalid_type_error: "Recent titles not found" })
  .min(1, { message: "Recent titles not found" });

// queries
const recentTitlesQuery = `
  id,
  year,
  type,
  rating,
  title_name,
  release_date
`;

const trendingTitlesQuery = `
  id,
  title_name
`;

// core
export const titles = new Hono<{ Variables: AppVariables }>()
  .get("/search/:query", zValidator("param", z.object({ query: z.string() })), async (context) => {
    const { query } = context.req.valid("param");

    if (query.length < 3) {
      context.status(400);
      return context.json({ message: "Query must be at least 3 characters" });
    }

    const { data, error } = await getSupabaseClient(context).rpc("fuzzy_search_title", { query });

    if (error) {
      context.status(500);
      return context.json({ message: "An error occurred", error });
    }

    const titles = searchTitlesSchema.safeParse(data);
    if (!titles.success) {
      context.status(404);
      return context.json({ message: `Titles not found for query ${query}` });
    }

    return context.json(titles.data);
  })
  .get("/recent/:limit", zValidator("param", z.object({ limit: z.string() })), async (context) => {
    const { limit } = context.req.valid("param");

    const parsedLimit = Number.parseInt(limit);

    if (Number.isNaN(parsedLimit) || parsedLimit < 1) {
      context.status(400);
      return context.json({ message: "Invalid Limit: it should be a positive integer number" });
    }

    if (parsedLimit > MAX_LIMIT) {
      context.status(400);
      return context.json({ message: `Limit must be less than or equal to ${MAX_LIMIT}` });
    }

    const { data } = await getSupabaseClient(context)
      .from("Titles")
      .select(recentTitlesQuery)
      .order("release_date", { ascending: false })
      .limit(parsedLimit);

    const recentSubtitles = recentTitlesSchema.safeParse(data);
    if (!recentSubtitles.success) {
      context.status(404);
      return context.json({ message: "No recent titles found" });
    }

    return context.json(recentSubtitles.data);
  })
  .get("/trending/:limit", zValidator("param", z.object({ limit: z.string() })), async (context) => {
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

    const { data } = await getSupabaseClient(context)
      .from("Titles")
      .select(trendingTitlesQuery)
      .order("queried_times", { ascending: false })
      .order("last_queried_at", { ascending: false })
      .limit(parsedLimit);

    const trendingSubtitles = trendingSubtitlesSchema.safeParse(data);
    if (!trendingSubtitles.success) {
      context.status(404);
      return context.json({ message: trendingSubtitles.error.issues[0].message });
    }

    return context.json(trendingSubtitles.data);
  });
