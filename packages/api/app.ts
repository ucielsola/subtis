import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";

// internals
import { cli } from "./cli";
import { integrations } from "./integrations";
import { metrics } from "./metrics";
import { movies } from "./movies";
import { shortener } from "./shortener";
import { subtitles } from "./subtitles";

// core
const app = new Hono().basePath("/v1");

// middlewares
app.use(secureHeaders());

// routes
const routes = app
	.route("/cli", cli)
	.route("/movies", movies)
	.route("/metrics", metrics)
	.route("/subtitles", subtitles)
	.route("/integrations", integrations)
	.route("/", shortener);

// exports
export default app;
export type AppType = typeof routes;

export * from "./subtitles";
