import type { Context } from "elysia";
import { z } from "zod";

// db
import { supabase } from "@subtis/db";

// internals
import { errorSchema } from "../shared";
import { subtitleSchema } from "../subtitles-file";

// schemas
const subtitlesSchema = z
	.array(subtitleSchema, {
		invalid_type_error: "Subtitles not found for movie",
	})
	.min(1, { message: "Subtitles not found for movie" });
const responseSchema = z.union([subtitlesSchema, errorSchema]);

// types
type Response = z.infer<typeof responseSchema>;

// core
export async function getSubtitlesFromMovieId({
	body,
	set,
}: {
	body: { movieId: string };
	set: Context["set"];
}): Promise<Response> {
	const { movieId } = body;

	const { data } = await supabase
		.from("Subtitles")
		.select(
			"id, subtitleLink, resolution, movieFileName, subtitleFileName, bytes, movie: Movies ( name, year, poster, backdrop ), releaseGroup: ReleaseGroups ( name ), subtitleGroup: SubtitleGroups ( name )",
		)
		.eq("movieId", movieId);

	const subtitles = subtitlesSchema.safeParse(data);
	if (!subtitles.success) {
		set.status = 404;
		return { message: subtitles.error.issues[0].message };
	}

	return subtitles.data;
}
