import z from "zod";

// lib
import { titleSchema } from "../../lib/schemas";

// schemas
export const searchTitlesSchema = z
  .array(titleSchema, { invalid_type_error: "Search titles not found" })
  .min(1, { message: "Search titles not found" });

export const searchTitlesResponseSchema = z.object({
  total: z.number(),
  results: searchTitlesSchema,
});

export const recentTitlesSchema = z
  .array(titleSchema, { invalid_type_error: "Recent titles not found" })
  .min(1, { message: "Recent titles not found" });

export const recentTitlesResponseSchema = z.object({
  total: z.number(),
  results: recentTitlesSchema,
});

export const trendingSubtitlesSchema = z
  .array(titleSchema, { invalid_type_error: "Trending titles not found" })
  .min(1, { message: "Trending titles not found" });

export const trendingSubtitlesResponseSchema = z.object({
  total: z.number(),
  results: trendingSubtitlesSchema,
});
