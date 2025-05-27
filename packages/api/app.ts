import "zod-openapi/extend";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

// shared internal
import type { AppBindings, AppVariables } from "./lib/types";

// internals
import { health } from "./routers/health/router";
import { providers } from "./routers/providers/router";
import { qa } from "./routers/qa/router";
import { stats } from "./routers/stats/router";
import { subtitle } from "./routers/subtitle/router";
import { subtitles } from "./routers/subtitles/router";
import { title } from "./routers/title/router";
import { titles } from "./routers/titles/router";

// types
type HonoAppType = {
  Variables: AppVariables;
  Bindings: AppBindings;
};

// app
export function runApi() {
  const app = new Hono<HonoAppType>();

  // middlewares
  app.use("*", cors());
  app.use(secureHeaders());
  app.use(
    cloudflareRateLimiter<HonoAppType>({
      rateLimitBinding: (c) => {
        const rateLimit = c.env.RATE_LIMITER;

        if (!rateLimit) {
          throw new Error("RATE_LIMITER is not defined");
        }

        return rateLimit;
      },
      keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
    }),
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
            version: "0.7.5",
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
