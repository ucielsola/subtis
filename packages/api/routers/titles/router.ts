import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { cache } from "hono/cache";
import timestring from "timestring";
import z from "zod";

// lib
import { MAX_LIMIT } from "../../lib/constants";
import { getResultsWithLength } from "../../lib/parsers";
import { titlesQuery } from "../../lib/schemas";
import { getSupabaseClient } from "../../lib/supabase";
import type { AppVariables } from "../../lib/types";

// internals
import {
  recentTitlesResponseSchema,
  recentTitlesSchema,
  searchTitlesResponseSchema,
  searchTitlesSchema,
  trendingSubtitlesResponseSchema,
  trendingSubtitlesSchema,
} from "./schemas";

// router
export const titles = new Hono<{ Variables: AppVariables }>()
  .get(
    "/search/:query",
    describeRoute({
      tags: ["Titles (4)"],
      description: "Search titles by query",
      responses: {
        200: {
          description: "Successful titles search response",
          content: {
            "application/json": {
              schema: resolver(searchTitlesResponseSchema),
            },
          },
        },
        400: {
          description: "Invalid query",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        404: {
          description: "Titles not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        500: {
          description: "An error occurred",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string(), error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator("param", z.object({ query: z.string().openapi({ example: "batman" }) })),
    async (context) => {
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
        return context.json({ message: "Titles not found", error: titles.error.issues[0].message });
      }

      const finalResponse = searchTitlesResponseSchema.safeParse(getResultsWithLength(titles.data));

      if (!finalResponse.success) {
        context.status(500);
        return context.json({ message: "An error occurred", error: finalResponse.error.message });
      }

      return context.json(finalResponse.data);
    },
  )
  .get(
    "/recent/:limit",
    describeRoute({
      tags: ["Titles (4)"],
      description: "Get recent titles",
      responses: {
        200: {
          description: "Successful recent titles response",
          content: {
            "application/json": {
              schema: resolver(recentTitlesResponseSchema),
            },
          },
        },
        400: {
          description: "Invalid limit",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        404: {
          description: "Recent titles not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        500: {
          description: "An error occurred",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string(), error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator(
      "param",
      z.object({
        limit: z.string().openapi({
          example: "10",
          maximum: MAX_LIMIT,
          description: "Limit of titles to return",
        }),
      }),
    ),
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

      const finalResponse = recentTitlesResponseSchema.safeParse(getResultsWithLength(recentSubtitles.data));

      if (!finalResponse.success) {
        context.status(500);
        return context.json({ message: "An error occurred", error: finalResponse.error.message });
      }
      return context.json(finalResponse.data);
    },
    cache({ cacheName: "subtis-api-titles", cacheControl: `max-age=${timestring("1 day")}` }),
  )
  .get(
    "/trending/search/:limit",
    describeRoute({
      tags: ["Titles (4)"],
      description: "Get trending searched titles",
      responses: {
        200: {
          description: "Successful trending searched titles response",
          content: {
            "application/json": {
              schema: resolver(trendingSubtitlesResponseSchema),
            },
          },
        },
        400: {
          description: "Invalid limit",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        404: {
          description: "Trending titles not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        500: {
          description: "An error occurred",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string(), error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator("param", z.object({ limit: z.string().openapi({ example: "10" }) })),
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

      const finalResponse = trendingSubtitlesResponseSchema.safeParse(getResultsWithLength(trendingSubtitles.data));

      if (!finalResponse.success) {
        context.status(500);
        return context.json({ message: "An error occurred", error: finalResponse.error.message });
      }

      return context.json(finalResponse.data);
    },
    cache({ cacheName: "subtis-api-titles", cacheControl: `max-age=${timestring("1 day")}` }),
  )
  .get(
    "/trending/download/:limit",
    describeRoute({
      tags: ["Titles (4)"],
      description: "Get trending downloaded titles",
      responses: {
        200: {
          description: "Successful trending downloaded titles response",
          content: {
            "application/json": {
              schema: resolver(trendingSubtitlesResponseSchema),
            },
          },
        },
        400: {
          description: "Invalid limit",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        404: {
          description: "Trending titles not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        500: {
          description: "An error occurred",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string(), error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator("param", z.object({ limit: z.string().openapi({ example: "10" }) })),
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
        .order("last_queried_at", { ascending: false })
        .order("queried_times", { ascending: false })
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

      const finalResponse = trendingSubtitlesResponseSchema.safeParse(getResultsWithLength(trendingSubtitles.data));

      if (!finalResponse.success) {
        context.status(500);
        return context.json({ message: "An error occurred", error: finalResponse.error.message });
      }

      return context.json(finalResponse.data);
    },
    cache({ cacheName: "subtis-api-titles", cacheControl: `max-age=${timestring("1 day")}` }),
  );
