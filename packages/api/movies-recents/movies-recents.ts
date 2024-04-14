import type { Context } from "elysia";
import { z } from "zod";

// db
import { moviesRowSchema, supabase } from "@subtis/db";

// internals
import { errorSchema } from "../shared";

// schemas
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
const responseSchema = z.union([recentMovieSchema, errorSchema]);

// types
type Response = z.infer<typeof responseSchema>;

// core
export async function getRecentMovies({
	body,
	set,
}: {
	body: { limit: number };
	set: Context["set"];
}): Promise<Response | null> {
	const { limit } = body;

	const { data } = await supabase
		.from("Movies")
		.select("id, name, year, rating, releaseDate")
		.order("releaseDate", { ascending: false })
		.limit(limit);

	const recentSubtitles = recentMovieSchema.safeParse(data);
	if (!recentSubtitles.success) {
		set.status = 404;
		return { message: "No recent movies found" };
	}

	return recentSubtitles.data;
}
