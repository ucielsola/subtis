import { type ContentType, type Subtitle, addonBuilder, serveHTTP } from "stremio-addon-sdk";

// internals
import { apiClient } from "./api";
import project from "./package.json";

// api
import { subtitleSchema } from "@subtis/api/shared/schemas";

// helpers
import { detailMessageSchema, finalMessageSchema } from "@subtis/indexer/ws-schemas";

// types
type Extra = { videoHash: string; videoSize: string };
type Args = { id: string; extra: Extra; type: ContentType };

type ExtraArgs = Args["extra"] & { filename: string };

// core
function getTitleSubtitle(args: Args): Promise<{ subtitles: Subtitle[] }> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve) => {
    const { videoSize: bytes, filename: fileName } = args.extra as ExtraArgs;

    const response = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
      param: { bytes, fileName },
    });
    const data = await response.json();

    const subtitleByFileName = subtitleSchema.safeParse(data);

    if (subtitleByFileName.success) {
      const subtitle = {
        lang: "spa",
        id: String(subtitleByFileName.data.id),
        url: subtitleByFileName.data.subtitle_link,
      };

      await apiClient.v1.subtitle.metrics.download.$post({
        json: { bytes: Number(bytes), titleFileName: fileName },
      });

      return resolve({ subtitles: [subtitle] });
    }

    const socket = new WebSocket("ws://localhost:3000");

    const wsInitialMessage = {
      subtitle: { bytes: Number(bytes), titleFileName: fileName },
    };

    // message is received
    socket.addEventListener("message", async (event) => {
      if (typeof event.data !== "string") {
        return;
      }

      const parsedMessage = JSON.parse(event.data);
      const subtitleMessage = detailMessageSchema.safeParse(parsedMessage);

      if (subtitleMessage.success) {
        console.log(`Vamos un ${subtitleMessage.data.total * 100}% completado`);
        console.log(`Detalle: ${subtitleMessage.data.message} \n`);
      }

      const finalMessage = finalMessageSchema.safeParse(parsedMessage);

      if (finalMessage.success) {
        if (finalMessage.data.ok === false) {
          console.log("No pudimos encontrar el subtitulo para este archivo desde el indexador");

          console.log("Buscando el subtitulo por nombre de archivo");
          const response = await apiClient.v1.subtitle.file.alternative[":fileName"].$get({
            param: { fileName },
          });
          const data = await response.json();

          const subtitleByFileName = subtitleSchema.safeParse(data);

          if (subtitleByFileName.success) {
            const subtitle = {
              lang: "spa",
              id: String(subtitleByFileName.data.id),
              url: subtitleByFileName.data.subtitle_link,
            };

            await apiClient.v1.subtitle.metrics.download.$post({
              json: { bytes: Number(bytes), titleFileName: fileName },
            });

            return resolve({ subtitles: [subtitle] });
          }

          return resolve({ subtitles: [] });
        }

        console.log(`Finalizado con éxito: ${finalMessage.data.ok}`);
        console.log(
          `Redireccionando a pagina /${wsInitialMessage.subtitle.bytes}/${wsInitialMessage.subtitle.titleFileName}`,
        );

        const response = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
          param: { bytes, fileName },
        });
        const data = await response.json();

        const subtitleByFileName = subtitleSchema.safeParse(data);

        if (subtitleByFileName.success) {
          const subtitle = {
            lang: "spa",
            id: String(subtitleByFileName.data.id),
            url: subtitleByFileName.data.subtitle_link,
          };

          await apiClient.v1.subtitle.metrics.download.$post({
            json: { bytes: Number(bytes), titleFileName: fileName },
          });

          return resolve({ subtitles: [subtitle] });
        }
      }

      return resolve({ subtitles: [] });
    });

    // socket opened
    socket.addEventListener("open", (_event) => {
      socket.send(JSON.stringify(wsInitialMessage));
    });

    // socket closed
    socket.addEventListener("close", (event) => {
      // console.log("\n ~ event:", event.type);
      console.log("\n ~ event close in:", event.reason);
      // resolve({ subtitles: [] });
    });

    // error handler
    socket.addEventListener("error", (event) => {
      console.log("\n ~ event error in:", event.type);
      resolve({ subtitles: [] });
    });
  });
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
