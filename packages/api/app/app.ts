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
	getStremioSubtitleFromFileName,
	getSubtitleFromFileName,
	getSubtitleLink,
	getSubtitleVersionsFromFileName,
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
		.use(rateLimit({ skip: () => process.env.NODE_ENV !== "production" }))
		.group("/v1", (app) => {
			return app
				.group("/subtitles", (app) => {
					return app
						.post("/movie", getSubtitlesFromMovieId, {
							body: t.Object({ movieId: t.Number() }),
						})
						.post("/trending", getTrendingSubtitles, {
							body: t.Object({ limit: t.Number({ min: 1 }) }),
						})
						.group("/file", (app) => {
							return app
								.post("/name", getSubtitleFromFileName, {
									body: t.Object({ bytes: t.String(), fileName: t.String() }),
								})
								.post("/versions", getSubtitleVersionsFromFileName, {
									body: t.Object({ fileName: t.String() }),
								});
						});
				})
				.group("/movies", (app) => {
					return app
						.post("/title", getMoviesFromMovieTitle, {
							body: t.Object({ movieTitle: t.String() }),
						})
						.post("/recent", getRecentMovies, {
							body: t.Object({ limit: t.Number({ min: 1 }) }),
						});
				})
				.group("/integrations", (app) => {
					return app.get("/stremio/:bytes/:fileName", getStremioSubtitleFromFileName, {
						params: t.Object({ bytes: t.String(), fileName: t.String() }),
					});
				})
				.group("/metrics", (app) => {
					return app.post("/download", getDownloadFromFileName, {
						body: t.Object({ fileName: t.String() }),
					});
				});
		})
		.get("/:id", getSubtitleLink, { params: t.Object({ id: t.String() }) })
		.listen(port, (context) => listener(context, displayListenLog));
}

// types
export type App = ReturnType<typeof runApi>;
