import { type ContentType, addonBuilder, serveHTTP } from "stremio-addon-sdk";

// internals
import project from "./package.json";

// internals
import { subtitleSchema } from "@subtis/api/subtitles/schemas";
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
async function getTitleSubtitle(args: Args) {
  const { videoSize: bytes, filename: fileName } = args.extra as ExtraArgs;

  const response = await apiClient.v1.subtitles.file.name[":bytes"][":fileName"].$get({
    param: { bytes, fileName },
  });
  const data = await response.json();

  const subtitleByFileName = subtitleSchema.safeParse(data);
  if (!subtitleByFileName.success) {
    // Trigger error to sentry
    return Promise.resolve({ subtitles: [] });
  }

  const subtitle = {
    lang: "spa",
    id: subtitleByFileName.data.id,
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
  types: ["movie", "series"],
  logo: "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/assets/stremio.jpg",
});

builder.defineSubtitlesHandler(getTitleSubtitle);

serveHTTP(builder.getInterface(), { port: Number(process.env.PORT || 8081) });
