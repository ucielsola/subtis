import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

// internals
import { subtitle } from "./subtitle";
import { subtitles } from "./subtitles";
import { title } from "./title";
import { titles } from "./titles";

// core
export function runApi() {
  // constants
  const app = new Hono().basePath("/v1");

  // middlewares
  app.use("*", cors());
  app.use(secureHeaders());

  // routes
  const routes = app
    .route("/title", title)
    .route("/titles", titles)
    .route("/subtitle", subtitle)
    .route("/subtitles", subtitles);

  return [app, routes];
}

function defineRoutes() {
  const app = new Hono().basePath("/v1");
  return app
    .route("/title", title)
    .route("/titles", titles)
    .route("/subtitle", subtitle)
    .route("/subtitles", subtitles);
}

// exports
export * from "./subtitles";
export type AppType = ReturnType<typeof defineRoutes>;
