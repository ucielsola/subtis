import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// internals
import { type AppVariables, getSupabaseClient } from "../shared";

// db
import { titlesRowSchema } from "@subtis/db/schemas";

// schemas
const movieSchema = titlesRowSchema.pick({ id: true, title_name: true, year: true });
const moviesSchema = z.array(movieSchema).min(1);

const movieRecentSchema = titlesRowSchema.pick({
  id: true,
  title_name: true,
  year: true,
  rating: true,
  release_date: true,
});
const recentMovieSchema = z
  .array(movieRecentSchema, { invalid_type_error: "Recent movies not found" })
  .min(1, { message: "Recent movies not found" });

// queries
const recentTitlesQuery = `
  id,
  year,
  rating,
  title_name,
  release_date
`;

// core
export const movies = new Hono<{ Variables: AppVariables }>()
  .get("/title/:movieTitle", zValidator("param", z.object({ movieTitle: z.string() })), async (context) => {
    const { movieTitle } = context.req.valid("param");

    const { data } = await getSupabaseClient(context).rpc("fuzzy_search_movie", { title_query: movieTitle });

    const movies = moviesSchema.safeParse(data);
    if (!movies.success) {
      context.status(404);
      return context.json({ message: `Movies not found for query ${movieTitle}` });
    }

    return context.json(movies.data);
  })
  .get("/recent/:limit", zValidator("param", z.object({ limit: z.string() })), async (context) => {
    const { limit } = context.req.valid("param");

    const { data } = await getSupabaseClient(context)
      .from("Titles")
      .select(recentTitlesQuery)
      .order("release_date", { ascending: false })
      .limit(Number(limit));

    const recentSubtitles = recentMovieSchema.safeParse(data);
    if (!recentSubtitles.success) {
      context.status(404);
      return context.json({ message: "No recent movies found" });
    }

    return context.json(recentSubtitles.data);
  });
