import { Resend } from "resend";
import { z } from "zod";

// db
import { subtitlesNotFoundRowSchema, supabase } from "@subtis/db";

// api
import { subtitleSchema } from "@subtis/api/shared/schemas";

// internals
import { apiClient } from "./api-client";
import { indexTitleByFileName } from "./file";

// constants
const resend = new Resend(Bun.env.RESEND_API_KEY);

// types
type Subtitle = z.infer<typeof subtitleSchema>;

// helpers
async function sendEmail(subtitle: Subtitle, email: string) {
  const isMovie = subtitle.title.type === "movie";
  const isTvShow = subtitle.title.type === "tv-show";

  const type = isMovie ? "pelicula" : "serie";
  const season = isTvShow
    ? ` - Temporada: ${subtitle.current_season} - Episodio: ${subtitle.current_episode}`
    : ` - ${subtitle.title.year}`;

  try {
    const data = await resend.emails.send({
      from: "soporte@subt.is",
      to: email,
      subject: "Subtis | Encontramos tu subtítulo! 🎉",
      html: `<div>
        <p>Encontramos el subtitulo para tu ${type}: ${subtitle.title.title_name}${season}</p>
        <p>Ya contamos con la versión para la resolución ${subtitle.resolution} y publicador ${subtitle.releaseGroup.release_group_name}</p>

        <p>Descarga tu subtitulo desde el siguiente <a href="${subtitle.subtitle_link}" target="_blank" rel="noreferrer">link</a></p>

        <img src="${subtitle.title.poster}" alt="${subtitle.title.title_name}" width="384px" />
      </div>`,
    });

    if (data.error) {
      throw new Error("Email not sent");
    }

    console.log("\n ~ forawait ~ data:", data);
  } catch (error) {
    console.log("\n ~ forawait ~ error:", error);
  }
}

export async function indexNotFoundSubtitles() {
  const { data } = await supabase.from("SubtitlesNotFound").select("*");
  const notFoundSubtitles = z.array(subtitlesNotFoundRowSchema).safeParse(data);

  if (!notFoundSubtitles.success) {
    throw new Error("We couldn't find any subtitle not found");
  }

  for await (const notFoundSubtitle of notFoundSubtitles.data) {
    console.table([notFoundSubtitle]);

    const response = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
      param: {
        bytes: String(notFoundSubtitle.bytes),
        fileName: notFoundSubtitle.title_file_name,
      },
    });
    const data = await response.json();

    const subtitleAlreadyExists = subtitleSchema.safeParse(data);

    if (subtitleAlreadyExists.success) {
      if (notFoundSubtitle.email) {
        console.log(`Sending email to ${notFoundSubtitle.email}...`);

        try {
          const emailSent = await sendEmail(subtitleAlreadyExists.data, notFoundSubtitle.email);
          console.log("\n ~ forawait ~ emailSent:", emailSent);
        } catch (error) {
          console.log("\n ~ forawait ~ error 1 before indexation:", error);
          continue;
        }
      }

      const response = await supabase
        .from("SubtitlesNotFound")
        .delete()
        .eq("title_file_name", notFoundSubtitle.title_file_name);
      console.log("\n ~ forawait ~ response:", response);

      continue;
    }

    const { ok } = await indexTitleByFileName({
      bytes: notFoundSubtitle.bytes,
      titleFileName: notFoundSubtitle.title_file_name,
      shouldStoreNotFoundSubtitle: false,
      isDebugging: false,
    });

    if (ok === true) {
      if (notFoundSubtitle.email) {
        console.log(`sending email to ${notFoundSubtitle.email}...`);

        try {
          const response = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
            param: {
              bytes: String(notFoundSubtitle.bytes),
              fileName: notFoundSubtitle.title_file_name,
            },
          });

          const data = await response.json();
          const subtitleByFileName = subtitleSchema.safeParse(data);

          if (!subtitleByFileName.success) {
            throw new Error("Subtitle not found in some way");
          }

          await sendEmail(subtitleByFileName.data, notFoundSubtitle.email);
        } catch (error) {
          console.log("\n ~ forawait ~ error 2 after indexation:", error);
          continue;
        }
      }

      const res = await supabase
        .from("SubtitlesNotFound")
        .delete()
        .eq("title_file_name", notFoundSubtitle.title_file_name);
      console.log("\n ~ forawait ~ res 2:", res);
    } else {
      const { run_times } = notFoundSubtitle;

      const response = await supabase
        .from("SubtitlesNotFound")
        .update({ run_times: run_times + 1 })
        .eq("id", notFoundSubtitle.id);
      console.log("\n ~ forawait ~ response 3:", response);
    }

    await Bun.sleep(4000);
  }
}

// testing
// indexNotFoundSubtitles();

// populate db

// async function populateSubtitlesNotFound() {
//   const subtitleNotFounds = [
//     // {
//     //   bytes: 0,
//     //   email: "lndgalante@gmail.com",
//     //   title_file_name: "the.boys.s04e01.1080p.web.h264-successfulcrab.mkv",
//     // },
//     {
//       bytes: 1,
//       email: "agustingarcia.inf@gmail.com",
//       title_file_name: "shogun.2024.s01e04.1080p.web.h264-successfulcrab.mkv",
//     },
//     {
//       bytes: 2,
//       email: "integraldieteticaonline@gmail.com",
//       title_file_name: "The.Fall.Guy.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv ",
//     },
//     {
//       bytes: 3,
//       email: "lndgalante@gmail.com",
//       title_file_name: "Oppenheimer.2023.1080p.BluRay.DD5.1.x264-GalaxyRG.mkv",
//     },
//     {
//       bytes: 4,
//       email: "lndgalante@gmail.com",
//       title_file_name: "Avengers.Infinity.War.2018.1080p.WEBRip.x264-[YTS.AM].mp4",
//     },
//     {
//       bytes: 5,
//       email: "agustingarcia.inf@gmail.com",
//       title_file_name: "Poor.Things.2023.1080p.WEBRip.1600MB.DD5.1.x264-GalaxyRG.mkv",
//     },
//     {
//       bytes: 6,
//       email: "agustingarcia.inf@gmail.com",
//       title_file_name: "Avengers.Endgame.2019.1080p.WEBRip.x264-[YTS.LT].mp4 ",
//     },
//   ];

//   for await (const subtitleNotFound of subtitleNotFounds) {
//     await supabase.from("SubtitlesNotFound").upsert(subtitleNotFound);
//   }
// }

// populateSubtitlesNotFound();
