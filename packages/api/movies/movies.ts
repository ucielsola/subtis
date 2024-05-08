import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// internals
import { type AppVariables, getSupabaseClient } from "../shared";

// db
import { moviesRowSchema } from "@subtis/db/schemas";

// schemas
const movieSchema = moviesRowSchema.pick({ id: true, name: true, year: true });
const moviesSchema = z.array(movieSchema).min(1);

const movieRecentSchema = moviesRowSchema.pick({
  id: true,
  year: true,
  name: true,
  rating: true,
  release_date: true,
});
const recentMovieSchema = z
  .array(movieRecentSchema, { invalid_type_error: "Recent movies not found" })
  .min(1, { message: "Recent movies not found" });

// queries
const moviesRecentQuery = `
  id,
  name,
  year,
  rating,
  release_date
`;

// core
export const movies = new Hono<{ Variables: AppVariables }>()
  .get("/title/:movieTitle", zValidator("param", z.object({ movieTitle: z.string() })), async (context) => {
    const { movieTitle } = context.req.valid("param");

    const { data } = await getSupabaseClient(context).rpc("fuzzy_search_movie", { movie_query: movieTitle });

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
      .from("Movies")
      .select(moviesRecentQuery)
      .order("release_date", { ascending: false })
      .limit(Number(limit));

    const recentSubtitles = recentMovieSchema.safeParse(data);
    if (!recentSubtitles.success) {
      context.status(404);
      return context.json({ message: "No recent movies found" });
    }

    return context.json(recentSubtitles.data);
  });
