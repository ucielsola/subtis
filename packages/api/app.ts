import { Hono } from "hono";

// internals
import { integrations } from "./integrations";
import { metrics } from "./metrics";
import { movies } from "./movies";
import { shortener } from "./shortener";
import { subtitles } from "./subtitles";

// core
const app = new Hono().basePath("/v1");

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
