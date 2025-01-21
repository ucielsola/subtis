import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
// import { cache } from "hono/cache";
// import timestring from "timestring";

// internals
import { MAX_LIMIT } from "../shared/constants";
import { getResultsWithLength } from "../shared/parsers";
import { titleSchema, titlesQuery } from "../shared/schemas";
import { getSupabaseClient } from "../shared/supabase";
import type { AppVariables } from "../shared/types";

// schemas
const searchTitlesSchema = z
  .array(titleSchema, { invalid_type_error: "Search titles not found" })
  .min(1, { message: "Search titles not found" });

const recentTitlesSchema = z
  .array(titleSchema, { invalid_type_error: "Recent titles not found" })
  .min(1, { message: "Recent titles not found" });

const trendingSubtitlesSchema = z
  .array(titleSchema, { invalid_type_error: "Trending titles not found" })
  .min(1, { message: "Trending titles not found" });

// core
export const titles = new Hono<{ Variables: AppVariables }>()
  .get("/search/:query", zValidator("param", z.object({ query: z.string() })), async (context) => {
    const { query } = context.req.valid("param");

    if (query.length < 2) {
      context.status(400);
      return context.json({ message: "Query must be at least 2 characters" });
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
  .get(
    "/recent/:limit",
    zValidator("param", z.object({ limit: z.string() })),
    async (context) => {
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
        .select(titlesQuery)
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
    },
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("1 week")}` }),
  )
  .get(
    "/trending/download/:limit",
    zValidator("param", z.object({ limit: z.string() })),
    async (context) => {
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
        .select(titlesQuery)
        .order("queried_times", { ascending: false })
        .order("last_queried_at", { ascending: false })
        .limit(parsedLimit);

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Trending titles not found" });
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
    },
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("1 week")}` }),
  )
  .get(
    "/trending/search/:limit",
    zValidator("param", z.object({ limit: z.string() })),
    async (context) => {
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
        .select(titlesQuery)
        .order("searched_times", { ascending: false })
        .order("last_queried_at", { ascending: false })
        .limit(parsedLimit);

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Search titles not found" });
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
    },
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("1 day")}` }),
  );
