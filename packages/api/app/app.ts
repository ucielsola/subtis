import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { helmet } from "elysia-helmet";
import { rateLimit } from "elysia-rate-limit";

// internals
import {
	getDownloadFromFileName,
	getMoviesFromMovieTitle,
	getRecentMovies,
	getSubtitleFromFileName,
	getSubtitlesFromMovieId,
	getTrendingSubtitles,
	listener,
} from "../index";

// core
export function runApi(displayListenLog = false, port = 8080) {
	return new Elysia()
		.use(cors())
		.use(helmet())
		.use(swagger({ path: "/v1/docs" }))
		.use(rateLimit({ skip: () => Bun.env.NODE_ENV !== "production" }))
		.group("/v1/subtitles", (app) => {
			return app
				.post("/movie", getSubtitlesFromMovieId, {
					body: t.Object({ movieId: t.String() }),
				})
				.post("/trending", getTrendingSubtitles, {
					body: t.Object({ limit: t.Number({ min: 1 }) }),
				})
				.post("/file", getSubtitleFromFileName, {
					body: t.Object({ bytes: t.String(), fileName: t.String() }),
				});
		})
		.group("/v1/movies", (app) => {
			return app
				.post("/title", getMoviesFromMovieTitle, {
					body: t.Object({ movieTitle: t.String() }),
				})
				.post("/recent", getRecentMovies, {
					body: t.Object({ limit: t.Number({ min: 1 }) }),
				});
		})
		.group("/v1/metrics", (app) => {
			return app.post("/download", getDownloadFromFileName, {
				body: t.Object({ fileName: t.String() }),
			});
		})
		.listen(port, (context) => listener(context, displayListenLog));
}

// types
export type App = ReturnType<typeof runApi>;
