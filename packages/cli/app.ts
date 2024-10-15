import { intro, outro, spinner, confirm } from "@clack/prompts";
import chalk from "chalk";
import minimist from "minimist";
import { z } from "zod";

// shared
import {
  getAlternativeSubtitle,
  getMessageFromStatusCode,
  getPrimarySubtitle,
  videoFileNameSchema,
} from "@subtis/shared";

// api
import type { SubtisSubtitle } from "@subtis/api/shared/schemas";

// indexer
import { type WsOk, wsMessageSchema, wsOkSchema } from "@subtis/indexer/file";

// internals
import { apiClient } from "./api";

// schemas
const cliArgumentsSchema = z.union(
  [
    z.object({
      f: z.string().min(1, {
        message: "🤔 El valor de -f debe ser una ruta de archivo válida",
      }),
    }),
    z.object({
      file: z.string().min(1, {
        message: "🤔 El valor de --file debe ser una ruta de archivo válida",
      }),
    }),
  ],
  {
    errorMap: (_, context) => {
      if (context.defaultError === "Invalid input") {
        return {
          message: "🤔 Debe proporcionar el flag --file [archivo] o bien -f [archivo]",
        };
      }

      return { message: context.defaultError };
    },
  },
);

// helpers
async function getSubtitleDownloadInstructions(subtitle: SubtisSubtitle) {
  const {
    resolution,
    title: { title_name, year },
  } = subtitle;
  outro(`🍿 Disfruta de ${chalk.bold(`${title_name} (${year})`)} en ${chalk.italic(resolution)} subtitulada`);

  const shouldDownloadSubtitle = await confirm({
    message: `Desea descargar ${chalk.italic("automáticamente")} el subtítulo?`,
  });

  if (shouldDownloadSubtitle) {
    const newLoader = spinner();
    newLoader.start("⏳ Descargando subtítulo");

    await Bun.sleep(1000);
    const result = await fetch(subtitle.subtitle_link);
    await Bun.write(`./${subtitle.subtitle_file_name}`, result);

    newLoader.stop("📥 Subtítulo descargado!");
  } else {
    console.log(chalk.bold("\nInstrucciones:"));
    console.log(`1) Mueve el archivo descargado a la ${chalk.bold("misma carpeta")} de tu película`);
    console.log(
      `2) Si el subtítulo no se reproduce, ${chalk.bold("selecciona")} el subtitulo en ${chalk.italic(
        "Menú -> Subtítulos -> Pista de Subtítulos",
      )}\n`,
    );
  }
}

// core
export async function mod(): Promise<void> {
  const loader = spinner();

  try {
    intro(`👋 Hola, soy ${chalk.magenta("Subtis")}`);

    const parsedArguments = minimist(Bun.argv, { string: ["f", "file"] });
    const cliArgumentsResult = cliArgumentsSchema.safeParse(parsedArguments);
    if (!cliArgumentsResult.success) {
      return outro(chalk.yellow(cliArgumentsResult.error.errors[0].message));
    }
    const cliArguments = cliArgumentsResult.data;

    const fileNameResult = videoFileNameSchema.safeParse("file" in cliArguments ? cliArguments.file : cliArguments.f);
    if (!fileNameResult.success) {
      return outro(chalk.yellow("🤔 Extensión de video no soportada. Prueba con otro archivo"));
    }
    const fileName = fileNameResult.data;

    loader.start("🔎 Buscando subtitulos");

    const file = Bun.file(fileName);
    const bytes =
      Bun.env.NODE_ENV === "production" ? String(file.size) : String(Math.floor(Math.random() * 10000000) + 1000000);

    if (!file.exists()) {
      loader.stop("🔴 Archivo no encontrado");
      return outro(chalk.red("🤔 Archivo no encontrado. Prueba con otra ruta"));
    }

    const originalSubtitle = await getPrimarySubtitle(apiClient, { bytes, fileName });

    if (originalSubtitle) {
      loader.stop(`🥳 Descarga tu subtítulo en ${chalk.blue(originalSubtitle.subtitle_link)}`);
      return await getSubtitleDownloadInstructions(originalSubtitle);
    }

    const data = await new Promise<WsOk>((resolve) => {
      const url =
        Bun.env.NODE_ENV !== "production"
          ? Bun.env.PUBLIC_WEBSOCKET_BASE_URL_PRODUCTION
          : Bun.env.PUBLIC_WEBSOCKET_BASE_URL_DEVELOPMENT;

      const ws = new WebSocket(url);

      ws.addEventListener("open", () => {
        loader.message("🔎 Indexando subtítulo en tiempo real");

        const message = {
          subtitle: {
            bytes: Number(bytes),
            titleFileName: fileName,
          },
        };

        ws.send(JSON.stringify(message));
      });

      ws.addEventListener(
        "message",
        (messageEvent: {
          data: string;
        }) => {
          const parsedData = JSON.parse(messageEvent.data);

          const okSafeParsed = wsOkSchema.safeParse(parsedData);
          const messageSafeParsed = wsMessageSchema.safeParse(parsedData);

          if (okSafeParsed.success && okSafeParsed.data.ok === true) {
            resolve(okSafeParsed.data);
          }

          if (okSafeParsed.success && okSafeParsed.data.ok === false) {
            loader.message("😔 Subtítulo no indexado ");
            resolve(okSafeParsed.data);
          }

          if (messageSafeParsed.success) {
            loader.message(` - ${messageSafeParsed.data.total * 100}% ${messageSafeParsed.data.message}`);
          }
        },
      );

      ws.addEventListener("error", () => {
        resolve({ ok: false });
      });
    });

    if (data.ok === true) {
      const originalSubtitle = await getPrimarySubtitle(apiClient, { bytes, fileName });

      if (originalSubtitle) {
        loader.stop(`🥳 Descarga tu subtítulo en ${chalk.blue(originalSubtitle.subtitle_link)}`);
        return await getSubtitleDownloadInstructions(originalSubtitle);
      }
    }

    const alternativeSubtitle = await getAlternativeSubtitle(apiClient, { fileName });

    if (alternativeSubtitle) {
      loader.stop(`🥳 Descarga tu subtítulo alternativo en ${chalk.blue(alternativeSubtitle.subtitle_link)}`);
      return await getSubtitleDownloadInstructions(alternativeSubtitle);
    }
  } catch (error) {
    if (error instanceof Error && typeof error.cause === "number") {
      const { description, title } = getMessageFromStatusCode(error.cause);
      loader.stop(`😥 ${title}`);
      return outro(`⛏ ${description}`);
    }

    if (error instanceof Error) {
      outro(chalk.red(`🔴 ${error.message}`));
    }
  } finally {
    process.exit();
  }
}

mod();
