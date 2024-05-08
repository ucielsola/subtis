import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { type ContentType, addonBuilder, serveHTTP } from "stremio-addon-sdk";

Sentry.init({
  dsn: "https://abf86ea3d4e91cc437c4297053c13da6@o125974.ingest.us.sentry.io/4507223362633728",
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
    json: { bytes: Number(bytes), fileName },
  });

  const withCacheMaxAge = isProduction ? {} : { cacheMaxAge: 0 };

  return Promise.resolve({ subtitles: [subtitle], ...withCacheMaxAge });
}

// addon
const builder = new addonBuilder({
  id: "org.subtis",
  version: "0.0.1",
  name: "Subtis",
  description: "Subtis es un buscador de subtitulos para tus películas",
  catalogs: [],
  resources: ["subtitles"],
  types: ["movie"],
  logo: "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/assets/stremio.jpg",
});

builder.defineSubtitlesHandler(getMovieSubtitle);

serveHTTP(builder.getInterface(), { port: 8081 });
