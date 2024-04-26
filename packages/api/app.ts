import { Hono } from "hono";
import { cache } from "hono/cache";
import timestring from "timestring";
import { secureHeaders } from "hono/secure-headers";

// internals
import { integrations } from "./integrations";
import { metrics } from "./metrics";
import { movies } from "./movies";
import { shortener } from "./shortener";
import { subtitles } from "./subtitles";


// core
const app = new Hono().basePath("/v1");

// cache & middlewares
app.use(secureHeaders())
app.get('*', cache({ cacheName: 'subtis-api', cacheControl: `s-maxage=${timestring("1 week")}` }));

// routes
const routes = app
	.route("/movies", movies)
	.route("/metrics", metrics)
	.route("/subtitles", subtitles)
	.route("/integrations", integrations)
	.route("/", shortener);

// exports
export default app;
export type AppType = typeof routes;

export * from "./subtitles";
