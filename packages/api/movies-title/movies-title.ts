import type { Context } from "elysia";
import { z } from "zod";

// db
import { moviesRowSchema, supabase } from "@subtis/db";

// internals
import { errorSchema } from "../shared/schemas";

// schemas
const movieSchema = moviesRowSchema.pick({ id: true, name: true, year: true });
const moviesSchema = z.array(movieSchema).min(1);
const responseSchema = z.union([moviesSchema, errorSchema]);

// types
type Response = z.infer<typeof responseSchema>;

// core
export async function getMoviesFromMovieTitle({
	body,
	set,
}: {
	body: { movieTitle: string };
	set: Context["set"];
}): Promise<Response> {
	const { movieTitle } = body;

	const { data } = await supabase.rpc("fuzzy_search_movie", {
		movie_query: movieTitle,
	});

	const movies = moviesSchema.safeParse(data);
	if (!movies.success) {
		set.status = 404;
		return { message: `Movies not found for query ${movieTitle}` };
	}

	return movies.data;
}
