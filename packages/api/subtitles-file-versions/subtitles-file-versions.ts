import type { Context } from "elysia";
import { z } from "zod";

// db
import {
	moviesRowSchema,
	releaseGroupsRowSchema,
	subtitleGroupsRowSchema,
	subtitlesRowSchema,
	supabase,
} from "@subtis/db";

// shared
import { getMovieMetadata, videoFileNameSchema } from "@subtis/shared";

// internals
import { errorSchema } from "../shared";

// schemas
const subtitleSchema = z.array(
	subtitlesRowSchema
		.pick({
			id: true,
			fileName: true,
			movieId: true,
			resolution: true,
			subtitleFullLink: true,
			subtitleShortLink: true,
		})
		.extend({
			releaseGroup: releaseGroupsRowSchema.pick({ name: true }),
			subtitleGroup: subtitleGroupsRowSchema.pick({ name: true }),
			movie: moviesRowSchema.pick({ name: true, year: true, poster: true }),
		}),
);
const movieSchema = moviesRowSchema.pick({ id: true, name: true, year: true, poster: true, backdrop: true });
const responseSchema = z.union([subtitleSchema, errorSchema]);

// types
type Response = z.infer<typeof responseSchema>;

// core
export async function getSubtitleVersionsFromFileName({
	body,
	set,
}: {
	body: { fileName: string };
	set: Context["set"];
}): Promise<Response> {
	const { fileName } = body;

	const videoFileName = videoFileNameSchema.safeParse(fileName);
	if (!videoFileName.success) {
		set.status = 415;
		return { message: videoFileName.error.issues[0].message };
	}

	const { name, year } = getMovieMetadata(videoFileName.data);
	const { data: movieData } = await supabase
		.from("Movies")
		.select("id, name, year, poster, backdrop")
		.eq("name", name)
		.eq("year", year)
		.single();

	const movieByNameAndYear = movieSchema.safeParse(movieData);

	if (!movieByNameAndYear.success) {
		set.status = 404;
		return { message: "Movie not found for file" };
	}

	const { data } = await supabase
		.from("Subtitles")
		.select(
			"id, subtitleShortLink, subtitleFullLink, resolution, fileName, bytes, movieId, movie: Movies ( name, year, poster, backdrop ), releaseGroup: ReleaseGroups ( name ), subtitleGroup: SubtitleGroups ( name )",
		)
		.eq("movieId", movieByNameAndYear.data.id);

	const subtitleByFileName = subtitleSchema.safeParse(data);

	if (!subtitleByFileName.success) {
		set.status = 404;
		return { message: "Subtitle not found for file" };
	}

	return subtitleByFileName.data;
}
