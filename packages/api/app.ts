import "zod-openapi/extend";
import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

// shared internal
import type { AppVariables } from "./lib/types";

// internals
import { providers } from "./controllers/providers/router";
import { stats } from "./controllers/stats/router";
import { subtitle } from "./controllers/subtitle/router";
import { subtitles } from "./controllers/subtitles/router";
import { title } from "./controllers/title/router";
import { titles } from "./controllers/titles/router";

// app
export function runApi() {
  const app = new Hono<{ Variables: AppVariables }>();

  // middlewares
  app.use("*", cors());
  app.use(secureHeaders());

  // routes
  return app
    .basePath("/v1")
    .route("/stats", stats)
    .route("/subtitle", subtitle)
    .route("/subtitles", subtitles)
    .route("/title", title)
    .route("/titles", titles)
    .route("/providers", providers)
    .get(
      "/openapi",
      openAPISpecs(app, {
        documentation: {
          info: {
            version: "0.5.5",
            title: "Subtis API",
            description: "API for subtitles and titles",
          },
          servers: [
            {
              url: "https://api.subt.is",
              description: "Production server",
            },
            {
              url: "http://localhost:58602",
              description: "Local server",
            },
          ],
        },
      }),
    )
    .get(
      "/docs",
      apiReference({
        theme: "saturn",
        spec: { url: "/v1/openapi" },
        metaData: {
          title: "Subtis API",
          description: "API for subtitles and titles",
        },
      }),
    );
}

function defineRoutes() {
  const app = new Hono().basePath("/v1");
  const routes = app
    .route("/stats", stats)
    .route("/title", title)
    .route("/titles", titles)
    .route("/subtitle", subtitle)
    .route("/subtitles", subtitles)
    .route("/providers", providers);

  return routes;
}

export type AppType = ReturnType<typeof defineRoutes>;
