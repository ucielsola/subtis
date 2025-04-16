import { confirm, intro, outro, select, spinner, text } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { z } from "zod";

// shared
import {
  getAlternativeSubtitle,
  getMessageFromStatusCode,
  getPrimarySubtitle,
  videoFileNameSchema,
} from "@subtis/shared";

// api
import type { SubtitleNormalized } from "@subtis/api/lib/parsers";

// internals
import { apiClient } from "./api";

// schemas
const wsMessageSchema = z.object({
  total: z.number(),
  message: z.string(),
});

const wsOkSchema = z.object({
  ok: z.boolean(),
});

const cliArgumentsSchema = z.object({
  file: z.string().min(1, {
    message: `🤔 El valor de --file debe ser una ruta de archivo válida.\n\nTips:\n\ - Ejemplo completo "subtis search [NOMBRE_DE_ARCHIVO]" \n - Recordá posicionarte en el directorio donde se encuentra el archivo de video.`,
  }),
});

// types
type WsOk = z.infer<typeof wsOkSchema>;

// constants
const INSTRUCTIONS_MEDIA_PLAYERS = {
  stremio: [
    `${chalk.bold("Arrastrá")} el subtítulo hacia la app de Stremio ${chalk.italic("mientras reproducís la película")}`,
    `Te ${chalk.italic("recomendamos")} instalar la extensión de Subtis para Stremio en https://stremio.subt.is`,
  ],
  vlc: [
    `${chalk.bold("Arrastrá")} el subtítulo hacia el reproductor de VLC ${chalk.italic("mientras reproducís la película")}`,
    `O bien podés ${chalk.bold("mover")} el archivo .srt a la carpeta donde se encuentra ${chalk.italic("el archivo de video de tu película")}`,
    `Si el subtítulo no se reproduce, ${chalk.bold("seleccioná")} el subtítulo en ${chalk.italic("Menú -> Subtítulos -> Pista de Subtítulos")}`,
  ],
};

// helpers
async function getSubtitleDownloadInstructions(subtitle: SubtitleNormalized): Promise<void> {
  const {
    title: { title_name, year },
    subtitle: { resolution, subtitle_link, subtitle_file_name },
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
    const result = await fetch(subtitle_link);
    await Bun.write(`./${subtitle_file_name}`, result);

    newLoader.stop("📥 Subtítulo descargado!");
  }

  const mediaPlayer = (await select({
    message: "Seleccioná tu reproductor de video para instrucciones:",
    options: [
      { value: "cancel", label: "Cancelar" },
      { value: "stremio", label: "Stremio" },
      { value: "vlc", label: "VLC" },
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

async function askForEmail(bytes: string, fileName: string) {
  const shouldAskForEmail = await confirm({
    message: "¿Desea que te avisemos cuando esté disponible el subtítulo?",
    active: "Si",
    inactive: "No",
  });

  if (!shouldAskForEmail) {
    await apiClient.v1.subtitle["not-found"].$post({
      json: {
        bytes: Number(bytes),
        titleFileName: fileName,
      },
    });

    outro("⛏ Estaremos buscando el subtítulo para vos!");

    return;
  }

  const email = await text({
    message: "📬 Si queres nos podés dejar tu email para avisarte cuando esté disponible el subtítulo",
    placeholder: "john@doe.com",
    validate(value) {
      if (z.string().email().safeParse(value).success) {
        return;
      }

      return "El email no es válido. Intenta de nuevo.";
    },
  });

  await apiClient.v1.subtitle["not-found"].$post({
    json: {
      bytes: Number(bytes),
      email: email as string,
      titleFileName: fileName,
    },
  });

  outro("🙌 Gracias por tu paciencia! Pronto te avisaremos cuando esté disponible el subtítulo.");
}

// core
async function mod(titleFileName: string): Promise<void> {
  const loader = spinner();

  try {
    intro(`👋 Hola, soy ${chalk.magenta("Subtis")} CLI.`);

    const cliArgumentsResult = cliArgumentsSchema.safeParse({ file: titleFileName });
    if (!cliArgumentsResult.success) {
      return outro(chalk.yellow(cliArgumentsResult.error.errors[0].message));
    }
    const cliArguments = cliArgumentsResult.data;

    const fileNameResult = videoFileNameSchema.safeParse(cliArguments.file);
    if (!fileNameResult.success) {
      return outro(chalk.yellow("🤔 Extensión de video no soportada. Prueba con otro archivo."));
    }
    const fileName = fileNameResult.data;

    loader.start("🔎 Buscando subtítulos");

    const file = Bun.file(fileName);
    const bytes =
      Bun.env.NODE_ENV === "production" ? String(file.size) : String(Math.floor(Math.random() * 10000000) + 1000000);

    if (!file.exists()) {
      loader.stop("🔴 Archivo no encontrado");
      return outro(chalk.red("🤔 Archivo no encontrado. Prueba con otra ruta"));
    }

    const originalSubtitle = await getPrimarySubtitle(apiClient, { bytes, fileName });

    if (originalSubtitle) {
      loader.stop(`🥳 Descarga tu subtítulo en ${chalk.blue(originalSubtitle.subtitle.subtitle_link)}`);
      return await getSubtitleDownloadInstructions(originalSubtitle);
    }

    const websocketData = await new Promise<WsOk>((resolve) => {
      const ws = new WebSocket("https://ws-search.subt.is");

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

    if (websocketData.ok === true) {
      const originalSubtitle = await getPrimarySubtitle(apiClient, { bytes, fileName });

      if (originalSubtitle) {
        loader.stop(`🥳 Descarga tu subtítulo en ${chalk.blue(originalSubtitle.subtitle.subtitle_link)}`);
        return await getSubtitleDownloadInstructions(originalSubtitle);
      }
    }

    loader.message("🔎 Buscando subtítulo alternativo");
    const alternativeSubtitle = await getAlternativeSubtitle(apiClient, { fileName });

    if (alternativeSubtitle) {
      loader.stop(`🥳 Descarga tu subtítulo alternativo en ${chalk.blue(alternativeSubtitle.subtitle.subtitle_link)}`);
      return await getSubtitleDownloadInstructions(alternativeSubtitle);
    }
  } catch (error) {
    if (error instanceof Error && typeof error.cause === "number") {
      const { description, title } = getMessageFromStatusCode(error.cause);

      if (error.cause === 404) {
        loader.stop("🥲 No pudimos encontrar el subtítulo que estás buscando.");

        const file = Bun.file(titleFileName);
        const bytes =
          Bun.env.NODE_ENV === "production"
            ? String(file.size)
            : String(Math.floor(Math.random() * 10000000) + 1000000);

        return await askForEmail(bytes, titleFileName);
      }

      loader.stop(`🥲 ${title}`);
      return outro(`⛏ ${description}`);
    }

    if (error instanceof Error) {
      outro(chalk.red(`🔴 ${error.message}`));
    }
  } finally {
    process.exit();
  }
}

// cli
const program = new Command();

program
  .name("subtis")
  .description("CLI to search for movie subtitles")
  .version("0.6.6")
  .command("search")
  .description("Search a subtitle for a video file")
  .argument("<file>", "Video file")
  .action((file) => mod(file));

program.parse();
