import { Hono } from "hono";
import { cache } from "hono/cache";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import timestring from "timestring";

// internals
import { subtitles } from "./subtitles";
import { titles } from "./titles";

export function runApi() {
  // core
  const app = new Hono().basePath("/v1");

  // middlewares
  app.use("*", cors());
  app.use(secureHeaders());

  // cache
  if (process.env.NODE_ENV === "production") {
    app.get("*", cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("1 day")}` }));
  }

  // routes
  const routes = app.route("/titles", titles).route("/subtitles", subtitles);

  return [app, routes];
}

// exports
function defineRoutes() {
  const app = new Hono().basePath("/v1");
  return app.route("/titles", titles).route("/subtitles", subtitles);
}

export * from "./subtitles";
export type AppType = ReturnType<typeof defineRoutes>;
