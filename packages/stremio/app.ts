import { type ContentType, type Subtitle, addonBuilder, serveHTTP } from "stremio-addon-sdk";

// internals
import { apiClient } from "./api";
import project from "./package.json";

// api
import { subtitleSchema } from "@subtis/api/subtitles/schemas";

// types
type Extra = { videoHash: string; videoSize: string };
type Args = { id: string; extra: Extra; type: ContentType };

type ExtraArgs = Args["extra"] & { filename: string };

// core
async function getTitleSubtitle(args: Args): Promise<{ subtitles: Subtitle[] }> {
  const { videoSize: bytes, filename: fileName } = args.extra as ExtraArgs;

  const response = await apiClient.v1.subtitles.file.name[":bytes"][":fileName"].$get({
    param: { bytes, fileName },
  });
  const data = await response.json();

  const subtitleByFileName = subtitleSchema.safeParse(data);
  if (!subtitleByFileName.success) {
    return Promise.resolve({ subtitles: [] });
  }

  const subtitle = {
    lang: "spa",
    id: String(subtitleByFileName.data.id),
    url: subtitleByFileName.data.subtitle_link,
  };

  await apiClient.v1.metrics.download.$post({
    json: { bytes: Number(bytes), titleFileName: fileName },
  });

  return Promise.resolve({ subtitles: [subtitle] });
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
