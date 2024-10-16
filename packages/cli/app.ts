import { confirm, intro, outro, select, spinner } from "@clack/prompts";
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

// internals
import { apiClient } from "./api";

// constants
const wsMessageSchema = z.object({
  total: z.number(),
  message: z.string(),
});

const wsOkSchema = z.object({
  ok: z.boolean(),
});

type WsOk = z.infer<typeof wsOkSchema>;

// schemas
const cliArgumentsSchema = z.union(
  [
    z.object({
      f: z.string().min(1, {
        message: "🤔 El valor de -f debe ser una ruta de archivo válida.",
      }),
    }),
    z.object({
      file: z.string().min(1, {
        message: "🤔 El valor de --file debe ser una ruta de archivo válida.",
      }),
    }),
  ],
  {
    errorMap: (_, context) => {
      if (context.defaultError === "Invalid input") {
        return {
          message: "🤔 Debe proporcionar el flag --file [archivo] o bien -f [archivo].",
        };
      }

      return { message: context.defaultError };
    },
  },
);

// constants
const INSTRUCTIONS_MEDIA_PLAYERS = {
  stremio: [
    `${chalk.bold("Arrastra")} el subtítulo hacia la app de Stremio ${chalk.italic("mientras reproducís la película")}`,
    `Te ${chalk.italic("recomendamos")} instalar la extensión de Subtis para Stremio en https://stremio.subt.is`,
  ],
  vlc: [
    `${chalk.bold("Arrastra")} el subtítulo hacia el reproductor de VLC ${chalk.italic("mientras reproducís la película")}`,
    `O bien podes ${chalk.bold("mover")} el archivo .srt a la carpeta donde se encuentra ${chalk.italic("el archivo de video de tu película")}`,
    `Si el subtítulo no se reproduce, ${chalk.bold("selecciona")} el subtitulo en ${chalk.italic("Menú -> Subtítulos -> Pista de Subtítulos")}`,
  ],
};

// helpers
async function getSubtitleDownloadInstructions(subtitle: SubtisSubtitle) {
  const {
    resolution,
    title: { title_name, year },
  } = subtitle;
  outro(`🍿 Disfruta de ${chalk.bold(`${title_name} (${year})`)} en ${chalk.italic(resolution)} subtitulada`);

  const shouldDownloadSubtitle = await confirm({
    message: `¿Desea descargar ${chalk.italic("automáticamente")} el subtítulo?`,
    active: "Si",
    inactive: "No",
  });

  if (shouldDownloadSubtitle) {
    const newLoader = spinner();
    newLoader.start("⏳ Descargando subtítulo");

    await Bun.sleep(600);
    const result = await fetch(subtitle.subtitle_link);
    await Bun.write(`./${subtitle.subtitle_file_name}`, result);

    newLoader.stop("📥 Subtítulo descargado!");
  }

  const mediaPlayer = (await select({
    message: "Selecciona tu reproductor de video para instrucciones:",
    options: [
      { value: "stremio", label: "Stremio" },
      { value: "vlc", label: "VLC" },
      { value: "cancel", label: "Cancelar" },
    ],
  })) as "stremio" | "vlc" | "cancel";

  if (mediaPlayer === "cancel") {
    return outro("👋 Hasta luego!");
  }

  const instructions = INSTRUCTIONS_MEDIA_PLAYERS[mediaPlayer];

  if (!instructions) {
    return;
  }

  instructions.forEach((instruction, index) => {
    console.log(`   ${index + 1}) ${instruction}`);
  });
}

// core
export async function mod(): Promise<void> {
  const loader = spinner();

  try {
    intro(`👋 Hola, soy ${chalk.magenta("Subtis")} CLI.`);

    const parsedArguments = minimist(Bun.argv, { string: ["f", "file"] });
    const cliArgumentsResult = cliArgumentsSchema.safeParse(parsedArguments);
    if (!cliArgumentsResult.success) {
      return outro(chalk.yellow(cliArgumentsResult.error.errors[0].message));
    }
    const cliArguments = cliArgumentsResult.data;

    const fileNameResult = videoFileNameSchema.safeParse("file" in cliArguments ? cliArguments.file : cliArguments.f);
    if (!fileNameResult.success) {
      return outro(chalk.yellow("🤔 Extensión de video no soportada. Prueba con otro archivo."));
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
      const ws = new WebSocket("https://socketdex.subt.is");

      ws.addEventListener("open", () => {
        loader.message("🔎 Buscando subtítulo en tiempo real");

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
            loader.message("No pudimos encontrar el subtítulo en tiempo real.");
            resolve(okSafeParsed.data);
          }

          if (messageSafeParsed.success) {
            loader.message(`${messageSafeParsed.data.total * 100}% ${messageSafeParsed.data.message}`);
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

    loader.message("🔎 Buscando subtítulo alternativo");
    const alternativeSubtitle = await getAlternativeSubtitle(apiClient, { fileName });

    if (alternativeSubtitle) {
      loader.stop(`🥳 Descarga tu subtítulo alternativo en ${chalk.blue(alternativeSubtitle.subtitle_link)}`);
      return await getSubtitleDownloadInstructions(alternativeSubtitle);
    }

    loader.stop("🔴 No se pudo encontrar tu subtítulo. Estamos trabajando en ello.");
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
