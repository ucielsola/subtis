import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { type ContentType, addonBuilder, serveHTTP } from "stremio-addon-sdk";

// internals
import project from "./package.json";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// internals
import { apiClient } from "./api";
import { getSubtitleUrl, isProduction } from "./utils";

// types
type Args = {
  type: ContentType;
  id: string;
  extra: {
    videoHash: string;
    videoSize: string;
  };
};

type ExtraArgs = Args["extra"] & { filename: string };

// core
async function getMovieSubtitle(args: Args) {
  if (args.type !== "movie") {
    return Promise.resolve({ subtitles: [] });
  }

  const { videoSize: bytes, filename: fileName } = args.extra as ExtraArgs;

  const subtitle = {
    lang: "spa",
    id: ": Subtis | Subtitulo en Español",
    url: getSubtitleUrl({ bytes, fileName }),
  };

  apiClient.v1.metrics.download.$post({
    json: { bytes: Number(bytes), titleFileName: fileName },
  });

  const withCacheMaxAge = isProduction ? {} : { cacheMaxAge: 0 };

  return Promise.resolve({ subtitles: [subtitle], ...withCacheMaxAge });
}

// addon
const builder = new addonBuilder({
  name: "Subtis",
  id: "org.subtis",
  version: project.version,
  description: "Subtis es tu buscador de subtitulos para tus películas y series favoritas",
  catalogs: [],
  resources: ["subtitles"],
  types: ["movie"],
  logo: "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/assets/stremio.jpg",
});

builder.defineSubtitlesHandler(getMovieSubtitle);

serveHTTP(builder.getInterface(), { port: Number(process.env.PORT || 8081) });
