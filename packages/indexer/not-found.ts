import { confirm } from "@clack/prompts";
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
  const pageSize = 100;
  let currentPage = 0;
  let hasMoreRecords = true;

  while (hasMoreRecords) {
    const { data, error } = await supabase
      .from("SubtitlesNotFound")
      .select("*")
      .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching subtitles:", error);
      break;
    }

    const notFoundSubtitles = z.array(subtitlesNotFoundRowSchema).safeParse(data);

    if (!notFoundSubtitles.success) {
      console.error("Error parsing subtitles:", notFoundSubtitles.error);
      break;
    }

    if (notFoundSubtitles.data.length === 0) {
      hasMoreRecords = false;
      break;
    }

    for (const notFoundSubtitle of notFoundSubtitles.data) {
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

      await confirm({
        message: "¿Desea continuar al siguiente titulo?",
      });
    }

    currentPage++;
  }

  console.log("Finished processing all records.");
}

// testing
indexNotFoundSubtitles();
