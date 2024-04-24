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
	releaseDate: true,
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
  releaseDate
`;

// core
export const movies = new Hono<{ Variables: AppVariables }>()
	.post("/title", zValidator("json", z.object({ movieTitle: z.string() })), async (context) => {
		const { movieTitle } = context.req.valid("json");

		const { data } = await getSupabaseClient(context).rpc("fuzzy_search_movie", { movie_query: movieTitle });

		const movies = moviesSchema.safeParse(data);
		if (!movies.success) {
			context.status(404);
			return context.json({ message: `Movies not found for query ${movieTitle}` });
		}

		return context.json(movies.data);
	})
	.post("/recent", zValidator("json", z.object({ limit: z.number() })), async (context) => {
		const { limit } = context.req.valid("json");

		const { data } = await getSupabaseClient(context)
			.from("Movies")
			.select(moviesRecentQuery)
			.order("releaseDate", { ascending: false })
			.limit(limit);

		const recentSubtitles = recentMovieSchema.safeParse(data);
		if (!recentSubtitles.success) {
			context.status(404);
			return context.json({ message: "No recent movies found" });
		}

		return context.json(recentSubtitles.data);
	});
