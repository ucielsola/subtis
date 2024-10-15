import { type ContentType, type Subtitle, addonBuilder, serveHTTP } from "stremio-addon-sdk";

// api
import { getAlternativeSubtitle, getPrimarySubtitle } from "@subtis/shared";

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
  name: "Subtis (Version Pre-Alpha)",
  id: "org.subtis",
  version: "0.1.8",
  description:
    "Subtis es tu fuente de subtitulos para tus películas y series favoritas. Esta es una versión de prueba interna, solo para desarrolladores.",
  catalogs: [],
  resources: ["subtitles"],
  types: ["movie"],
  idPrefixes: ["tt"],
  background: "https://placehold.co/1920x1080/FFF/FFF",
  logo: "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/assets/stremio.jpg",
});

builder.defineSubtitlesHandler(getTitleSubtitle);
serveHTTP(builder.getInterface(), { port: Number(process.env.PORT || 8081) });
