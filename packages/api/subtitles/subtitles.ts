import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cache } from "hono/cache";
import timestring from "timestring";
import { z } from "zod";

// internals
import { type AppVariables, getSupabaseClient } from "../shared";

// db
import { moviesRowSchema, releaseGroupsRowSchema, subtitlesRowSchema } from "@subtis/db/schemas";

// shared
import { getMovieMetadata, videoFileNameSchema } from "@subtis/shared";

// schemas
const releaseGroupSchema = releaseGroupsRowSchema.pick({ name: true });
const movieSchema = moviesRowSchema.pick({ name: true, year: true, poster: true, backdrop: true });

export const subtitleSchema = subtitlesRowSchema
	.pick({
		id: true,
		resolution: true,
		subtitleLink: true,
		subtitleFileName: true,
	})
	.extend({
		movie: movieSchema,
		releaseGroup: releaseGroupSchema,
	});

const subtitlesQuery = `
  id,
  resolution,
  subtitleLink,
  subtitleFileName,
  releaseGroup: ReleaseGroups ( name ),
  movie: Movies ( name, year, poster, backdrop )
`;

const subtitlesSchema = z
	.array(subtitleSchema, { invalid_type_error: "Subtitles not found for movie" })
	.min(1, { message: "Subtitles not found for movie" });

const trendingSubtitlesSchema = z
	.array(subtitleSchema, { invalid_type_error: "Trending subtitles not found" })
	.min(1, { message: "Trending subtitles not found" });

const alternativeSubtitlesSchema = z
	.array(subtitleSchema, { invalid_type_error: "Alternative subtitles not found for file" })
	.min(1, { message: "Alternative subtitles not found for file" });

// constants
const ONE_WEEK_SECONDS = timestring("1 week");

// core
export const subtitles = new Hono<{ Variables: AppVariables }>()
	.get(
		"/movie/:movieId",
		zValidator("param", z.object({ movieId: z.string() })),
		cache({ cacheName: "api", cacheControl: `s-maxage=${ONE_WEEK_SECONDS}` }),
		async (context) => {
			const { movieId } = context.req.valid("param");

			const { data } = await getSupabaseClient(context).from("Subtitles").select(subtitlesQuery).match({ movieId });

			const subtitles = subtitlesSchema.safeParse(data);
			if (!subtitles.success) {
				context.status(404);
				return context.json({ message: subtitles.error.issues[0].message });
			}

			return context.json(data);
		},
	)
	.get(
		"/file/name/:bytes/:fileName",
		zValidator("param", z.object({ bytes: z.string(), fileName: z.string() })),
		cache({ cacheName: "api", cacheControl: `s-maxage=${ONE_WEEK_SECONDS}` }),
		async (context) => {
			const { bytes, fileName } = context.req.valid("param");

			const videoFileName = videoFileNameSchema.safeParse(fileName);
			if (!videoFileName.success) {
				context.status(415);
				return context.json({ message: videoFileName.error.issues[0].message });
			}

			const supabase = getSupabaseClient(context);

			const { data } = await supabase
				.from("Subtitles")
				.select(subtitlesQuery)
				.match({ movieFileName: videoFileName.data })
				.single();

			const subtitleByFileName = subtitleSchema.safeParse(data);

			if (!subtitleByFileName.success) {
				await supabase.rpc("insert_subtitle_not_found", { file_name: videoFileName.data });

				const { data } = await supabase.from("Subtitles").select(subtitlesQuery).match({ bytes }).single();

				const subtitleByBytes = subtitleSchema.safeParse(data);

				if (!subtitleByBytes.success) {
					context.status(404);
					return context.json({ message: "Subtitle not found for file" });
				}

				return context.json(subtitleByBytes.data);
			}

			return context.json(subtitleByFileName.data);
		},
	)
	.get(
		"/file/versions/:fileName",
		zValidator("param", z.object({ fileName: z.string() })),
		cache({ cacheName: "api", cacheControl: `s-maxage=${ONE_WEEK_SECONDS}` }),
		async (context) => {
			const { fileName } = context.req.valid("param");

			const videoFileName = videoFileNameSchema.safeParse(fileName);
			if (!videoFileName.success) {
				context.status(415);
				return context.json({ message: videoFileName.error.issues[0].message });
			}

			const supabase = getSupabaseClient(context);
			const { name, year } = getMovieMetadata(videoFileName.data);

			const { data: movieData } = await supabase.from("Movies").select("id").match({ name, year }).single();

			const movieByNameAndYear = moviesRowSchema.pick({ id: true }).safeParse(movieData);

			if (!movieByNameAndYear.success) {
				context.status(404);
				return context.json({ message: "Movie not found for file" });
			}

			const { data } = await supabase
				.from("Subtitles")
				.select(subtitlesQuery)
				.match({ movieId: movieByNameAndYear.data.id });

			const subtitleByFileName = alternativeSubtitlesSchema.safeParse(data);

			if (!subtitleByFileName.success) {
				context.status(404);
				return context.json({ message: "Subtitle not found for file" });
			}

			return context.json(subtitleByFileName.data);
		},
	)
	.get("/trending/:limit", zValidator("param", z.object({ limit: z.string() })), async (context) => {
		const { limit } = context.req.valid("param");

		const { data } = await getSupabaseClient(context)
			.from("Subtitles")
			.select(subtitlesQuery)
			.order("queriedTimes", { ascending: false })
			.order("lastQueriedAt", { ascending: false })
			.limit(Number(limit));

		const trendingSubtitles = trendingSubtitlesSchema.safeParse(data);
		if (!trendingSubtitles.success) {
			context.status(404);
			return context.json({ message: trendingSubtitles.error.issues[0].message });
		}

		return context.json(trendingSubtitles.data);
	});
