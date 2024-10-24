import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// db
import { titlesRowSchema } from "@subtis/db/schemas";

// internals
import { MAX_LIMIT } from "../shared/constants";
import { getResultsWithLength } from "../shared/results";
import { getSupabaseClient } from "../shared/supabase";
import type { AppVariables } from "../shared/types";

// schemas
const searchTitleSchema = titlesRowSchema.pick({
  imdb_id: true,
  type: true,
  title_name: true,
  year: true,
  backdrop: true,
});
const searchTitlesSchema = z.array(searchTitleSchema).min(1);

const recentTitleSchema = titlesRowSchema.pick({
  imdb_id: true,
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
  imdb_id: true,
  title_name: true,
  queried_times: true,
  searched_times: true,
});

const trendingSubtitlesSchema = z
  .array(trendingTitleSchema, { invalid_type_error: "Recent titles not found" })
  .min(1, { message: "Recent titles not found" });

// queries
const recentTitlesQuery = `
  imdb_id,
  year,
  type,
  rating,
  title_name,
  release_date
`;

const trendingTitlesQuery = `
  imdb_id,
  title_name,
  queried_times,
  searched_times
`;

// core
export const titles = new Hono<{ Variables: AppVariables }>()
  .get("/search/:query", zValidator("param", z.object({ query: z.string() })), async (context) => {
    const { query } = context.req.valid("param");

    if (query.length < 3) {
      context.status(400);
      return context.json({ message: "Query must be at least 3 characters" });
    }

    const { data, error } = await getSupabaseClient(context).rpc("fuzzy_search_title", {
      query,
    });

    if (error) {
      context.status(500);
      return context.json({ message: "An error occurred", error: error.message });
    }

    const titles = searchTitlesSchema.safeParse(data);
    if (!titles.success) {
      context.status(404);
      return context.json({ message: `Titles not found for query ${query}` });
    }

    return context.json(getResultsWithLength(titles.data));
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

    const { data, error } = await getSupabaseClient(context)
      .from("Titles")
      .select(recentTitlesQuery)
      .order("release_date", { ascending: false })
      .limit(parsedLimit);

    if (error && error.code === "PGRST116") {
      context.status(404);
      return context.json({ message: "Recent titles not found" });
    }

    if (error) {
      context.status(500);
      return context.json({ message: "An error occurred", error: error.message });
    }

    const recentSubtitles = recentTitlesSchema.safeParse(data);

    if (recentSubtitles.error) {
      context.status(500);
      return context.json({ message: "An error occurred", error: recentSubtitles.error.issues[0].message });
    }

    return context.json(getResultsWithLength(recentSubtitles.data));
  })
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
      .from("Titles")
      .select(trendingTitlesQuery)
      .order("queried_times", { ascending: false })
      .order("last_queried_at", { ascending: false })
      .limit(parsedLimit);

    if (error && error.code === "PGRST116") {
      context.status(404);
      return context.json({ message: "Recent titles not found" });
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

    return context.json(getResultsWithLength(trendingSubtitles.data));
  })
  .get("/trending/search/:limit", zValidator("param", z.object({ limit: z.string() })), async (context) => {
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
      .from("Titles")
      .select(trendingTitlesQuery)
      .order("searched_times", { ascending: false })
      .order("last_queried_at", { ascending: false })
      .limit(parsedLimit);

    if (error && error.code === "PGRST116") {
      context.status(404);
      return context.json({ message: "Recent titles not found" });
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

    return context.json(getResultsWithLength(trendingSubtitles.data));
  });
