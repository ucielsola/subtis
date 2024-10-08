import { type ContentType, type Subtitle, addonBuilder, serveHTTP } from "stremio-addon-sdk";

// internals
import { apiClient } from "./api";

// api
import { subtitleSchema } from "@subtis/api/shared/schemas";

// types
type Extra = { videoHash: string; videoSize: string };
type Args = { id: string; extra: Extra; type: ContentType };
type ExtraArgs = Args["extra"] & { filename: string };

// helpers
async function getPrimarySubtitle({
  bytes,
  fileName,
}: {
  bytes: string;
  fileName: string;
}) {
  const response = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
    param: { bytes, fileName },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch original subtitle");
  }

  const data = await response.json();
  const subtitleByFileName = subtitleSchema.parse(data);

  const subtitle = {
    lang: "spa",
    id: String(subtitleByFileName.id),
    url: subtitleByFileName.subtitle_link,
  };

  await apiClient.v1.subtitle.metrics.download.$patch({
    json: { bytes: subtitleByFileName.bytes, titleFileName: subtitleByFileName.title_file_name },
  });

  return { subtitles: [subtitle] };
}

async function getAlternativeSubtitle({
  fileName,
}: {
  fileName: string;
}) {
  const response = await apiClient.v1.subtitle.file.alternative[":fileName"].$get({
    param: { fileName },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch alternative subtitle");
  }

  const data = await response.json();
  const subtitleByFileName = subtitleSchema.parse(data);

  const subtitle = {
    lang: "spa",
    id: String(subtitleByFileName.id),
    url: subtitleByFileName.subtitle_link,
  };

  await apiClient.v1.subtitle.metrics.download.$patch({
    json: { bytes: subtitleByFileName.bytes, titleFileName: subtitleByFileName.title_file_name },
  });

  return { subtitles: [subtitle] };
}

// constants
const CACHE_SETTINGS = {
  staleError: 0,
  cacheMaxAge: 0,
  staleRevalidate: 0,
};

// core
async function getTitleSubtitle(args: Args): Promise<{ subtitles: Subtitle[] }> {
  try {
    const { videoSize: bytes, filename: fileName } = args.extra as ExtraArgs;

    const originalSubtitle = await getPrimarySubtitle({ bytes, fileName });

    if (originalSubtitle === null) {
      const alternativeSubtitle = await getAlternativeSubtitle({ fileName });
      return Promise.resolve({ ...alternativeSubtitle, ...CACHE_SETTINGS });
    }

    return Promise.resolve({ ...originalSubtitle, ...CACHE_SETTINGS });
  } catch (error) {
    return Promise.resolve({ subtitles: [], ...CACHE_SETTINGS });
  }
}

// addon
const builder = new addonBuilder({
  name: "Subtis (Version Alpha)",
  id: "org.subtis",
  version: "0.1.5",
  description:
    "Subtis es tu fuente de subtitulos para tus películas y series favoritas. (Ten en cuenta que esto es una versión de prueba y el proyecto se lanza a fines de 2024)",
  catalogs: [],
  resources: ["subtitles"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  logo: "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/assets/stremio.jpg",
});

builder.defineSubtitlesHandler(getTitleSubtitle);
serveHTTP(builder.getInterface(), { port: Number(process.env.PORT || 8081) });
