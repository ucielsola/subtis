import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// internals
import { getSupabaseClient } from "../shared";

// db
import {
	moviesRowSchema,
	releaseGroupsRowSchema,
	subtitleGroupsRowSchema,
	subtitlesRowSchema,
} from "@subtis/db/schemas";

// shared
import { getMovieMetadata, videoFileNameSchema } from "@subtis/shared";

// schemas
const releaseGroupSchema = releaseGroupsRowSchema.pick({ name: true });
const subtitleGroupSchema = subtitleGroupsRowSchema.pick({ name: true });
const movieSchema = moviesRowSchema.pick({ id: true, year: true, name: true, poster: true, backdrop: true });

export const subtitleSchema = subtitlesRowSchema
	.pick({
		id: true,
		resolution: true,
		subtitleLink: true,
		movieFileName: true,
		subtitleFileName: true,
	})
	.extend({
		movie: movieSchema,
		releaseGroup: releaseGroupSchema,
		subtitleGroup: subtitleGroupSchema,
	});

const subtitlesSchema = z
	.array(subtitleSchema, { invalid_type_error: "Subtitles not found for movie" })
	.min(1, { message: "Subtitles not found for movie" });

const trendingSubtitlesSchema = z
	.array(subtitleSchema, { invalid_type_error: "Trending subtitles not found" })
	.min(1, { message: "Trending subtitles not found" });

const alternativeSubtitlesSchema = z
	.array(subtitleSchema, { invalid_type_error: "Alternative subtitles not found for file" })
	.min(1, { message: "Alternative subtitles not found for file" });

// core
export const subtitles = new Hono()
	.post("/movie", zValidator("json", z.object({ movieId: z.number() })), async (context) => {
		const { movieId } = context.req.valid("json");

		const { data } = await getSupabaseClient(context)
			.from("Subtitles")
			.select(
				"id, subtitleLink, resolution, movieFileName, subtitleFileName, bytes, movie: Movies ( id, name, year, poster, backdrop ), releaseGroup: ReleaseGroups ( name ), subtitleGroup: SubtitleGroups ( name )",
			)
			.eq("movieId", movieId);

		const subtitles = subtitlesSchema.safeParse(data);
		if (!subtitles.success) {
			context.status(404);
			return context.json({ message: subtitles.error.issues[0].message });
		}

		return context.json(data);
	})
	.post("/trending", zValidator("json", z.object({ limit: z.number() })), async (context) => {
		const { limit } = context.req.valid("json");

		const { data } = await getSupabaseClient(context)
			.from("Subtitles")
			.select(
				"id, subtitleLink, resolution, movieFileName, subtitleFileName, movie: Movies ( id, name, year, poster, backdrop ), releaseGroup: ReleaseGroups ( name ), subtitleGroup: SubtitleGroups ( name )",
			)
			.order("queriedTimes", { ascending: false })
			.order("lastQueriedAt", { ascending: false })
			.limit(limit);

		const trendingSubtitles = trendingSubtitlesSchema.safeParse(data);
		if (!trendingSubtitles.success) {
			context.status(404);
			return context.json({ message: trendingSubtitles.error.issues[0].message });
		}

		return context.json(trendingSubtitles.data);
	})
	.post("/file/name", zValidator("json", z.object({ bytes: z.string(), fileName: z.string() })), async (context) => {
		const { bytes, fileName } = context.req.valid("json");

		const videoFileName = videoFileNameSchema.safeParse(fileName);
		if (!videoFileName.success) {
			context.status(415);
			return context.json({ message: videoFileName.error.issues[0].message });
		}

		const supabase = getSupabaseClient(context);

		const { data } = await supabase
			.from("Subtitles")
			.select(
				"id, subtitleLink, resolution, movieFileName, subtitleFileName, movie: Movies ( id, name, year, poster, backdrop ), releaseGroup: ReleaseGroups ( name ), subtitleGroup: SubtitleGroups ( name )",
			)
			.eq("movieFileName", videoFileName.data)
			.single();

		const subtitleByFileName = subtitleSchema.safeParse(data);

		if (!subtitleByFileName.success) {
			await supabase.rpc("insert_subtitle_not_found", { file_name: videoFileName.data });

			const { data } = await supabase
				.from("Subtitles")
				.select(
					"id, subtitleLink, resolution, movieFileName, subtitleFileName, movie: Movies ( id, name, year, poster, backdrop ), releaseGroup: ReleaseGroups ( name ), subtitleGroup: SubtitleGroups ( name )",
				)
				.eq("bytes", bytes)
				.single();

			const subtitleByBytes = subtitleSchema.safeParse(data);

			if (!subtitleByBytes.success) {
				context.status(404);
				return context.json({ message: "Subtitle not found for file" });
			}

			return context.json(subtitleByBytes.data);
		}

		return context.json(subtitleByFileName.data);
	})
	.post("/file/versions", zValidator("json", z.object({ fileName: z.string() })), async (context) => {
		const { fileName } = context.req.valid("json");

		const videoFileName = videoFileNameSchema.safeParse(fileName);
		if (!videoFileName.success) {
			context.status(415);
			return context.json({ message: videoFileName.error.issues[0].message });
		}

		const supabase = getSupabaseClient(context);
		const { name, year } = getMovieMetadata(videoFileName.data);

		const { data: movieData } = await supabase
			.from("Movies")
			.select("id, name, year, poster, backdrop")
			.eq("name", name)
			.eq("year", year)
			.single();

		const movieByNameAndYear = movieSchema.safeParse(movieData);

		if (!movieByNameAndYear.success) {
			context.status(404);
			return context.json({ message: "Movie not found for file" });
		}

		const { data } = await supabase
			.from("Subtitles")
			.select(
				"id, subtitleLink, resolution, movieFileName, subtitleFileName, bytes, movieId, movie: Movies ( id, name, year, poster, backdrop ), releaseGroup: ReleaseGroups ( name ), subtitleGroup: SubtitleGroups ( name )",
			)
			.eq("movieId", movieByNameAndYear.data.id);

		const subtitleByFileName = alternativeSubtitlesSchema.safeParse(data);

		if (!subtitleByFileName.success) {
			context.status(404);
			return context.json({ message: "Subtitle not found for file" });
		}

		return context.json(subtitleByFileName.data);
	});
