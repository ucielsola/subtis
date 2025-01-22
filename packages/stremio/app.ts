import { type ContentType, type Subtitle as StremioSubtitle, addonBuilder, serveHTTP } from "stremio-addon-sdk";

// shared
import { getAlternativeSubtitle, getIsTvShow, getPrimarySubtitle } from "@subtis/shared";

// api
import type { SubtisSubtitleNormalized } from "@subtis/api/shared/parsers";

// internals
import { apiClient } from "./api";

// types
type Extra = { videoHash: string; videoSize: string };
type Args = { id: string; extra: Extra; type: ContentType };
type ExtraArgs = Args["extra"] & { filename: string };

// constants
const CACHE_SETTINGS = {
  staleError: 0,
  cacheMaxAge: 0,
  staleRevalidate: 0,
};

// helpers
function getSubtitleMetadata(subtitle: SubtisSubtitleNormalized): StremioSubtitle {
  return {
    lang: "spa",
    id: String(subtitle.subtitle.id),
    url: subtitle.subtitle.subtitle_link,
  };
}

// core
async function getTitleSubtitle(args: Args): Promise<{ subtitles: StremioSubtitle[] }> {
  try {
    const { videoSize: bytes, filename: fileName } = args.extra as ExtraArgs;

    const isTvShow = getIsTvShow(fileName);

    if (isTvShow) {
      return Promise.resolve({ subtitles: [], ...CACHE_SETTINGS });
    }

    const originalSubtitle = await getPrimarySubtitle(apiClient, { bytes, fileName });

    if (originalSubtitle) {
      const subtitleMetadata = getSubtitleMetadata(originalSubtitle);
      return Promise.resolve({ subtitles: [subtitleMetadata], ...CACHE_SETTINGS });
    }

    const alternativeSubtitle = await getAlternativeSubtitle(apiClient, { fileName });
    const alternativeSubtitleMetadata = getSubtitleMetadata(alternativeSubtitle);

    return Promise.resolve({ subtitles: [alternativeSubtitleMetadata], ...CACHE_SETTINGS });
  } catch (error) {
    return Promise.resolve({ subtitles: [], ...CACHE_SETTINGS });
  }
}

// addon
const builder = new addonBuilder({
  name: "Subtis (Version Pre-Beta)",
  id: "org.subtis",
  version: "0.4.9",
  description:
    "Subtis es tu fuente de subtitulos para tus películas y series favoritas. Esta es una versión de prueba interna, solo para desarrolladores.",
  catalogs: [],
  resources: ["subtitles"],
  types: ["movie"],
  idPrefixes: ["tt"],
  logo: "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/assets/stremio.jpg",
});

builder.defineSubtitlesHandler(getTitleSubtitle);
serveHTTP(builder.getInterface(), { port: Number(process.env.PORT || 8081) });
