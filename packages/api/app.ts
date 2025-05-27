import "zod-openapi/extend";
import { DurableObjectStore } from "@hono-rate-limiter/cloudflare";
import { Scalar } from "@scalar/hono-api-reference";
import { type Context, Hono, type Next } from "hono";
import { openAPISpecs } from "hono-openapi";
import { rateLimiter } from "hono-rate-limiter";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

// shared internal
import type { HonoAppType } from "./lib/types";

// internals
import { health } from "./routers/health/router";
import { providers } from "./routers/providers/router";
import { qa } from "./routers/qa/router";
import { stats } from "./routers/stats/router";
import { subtitle } from "./routers/subtitle/router";
import { subtitles } from "./routers/subtitles/router";
import { title } from "./routers/title/router";
import { titles } from "./routers/titles/router";

// app
export function runApi() {
  const app = new Hono<HonoAppType>();

  // middlewares
  app.use("*", cors());
  app.use(secureHeaders());
  app.use((c: Context, next: Next) =>
    rateLimiter<HonoAppType>({
      limit: 1000,
      windowMs: 15 * 60 * 1000,
      standardHeaders: "draft-6",
      store: new DurableObjectStore({ namespace: c.env.CACHE }),
      keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
    })(c, next),
  );

  // routes
  return app
    .basePath("/v1")
    .route("/qa", qa)
    .route("/stats", stats)
    .route("/health", health)
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
            version: "0.7.6",
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
      Scalar({
        theme: "saturn",
        url: "/v1/openapi",
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
    .route("/qa", qa)
    .route("/stats", stats)
    .route("/title", title)
    .route("/titles", titles)
    .route("/subtitle", subtitle)
    .route("/subtitles", subtitles)
    .route("/providers", providers);

  return routes;
}

export type AppType = ReturnType<typeof defineRoutes>;
