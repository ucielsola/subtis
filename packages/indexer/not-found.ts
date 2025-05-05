import { confirm } from "@clack/prompts";
import { z } from "zod";

// db
import { publicSubtitlesnotfoundRowSchemaSchema, supabase } from "@subtis/db";

// api
import { subtitleNormalizedSchema } from "@subtis/api/lib/parsers";
import { subtitlesQuery } from "@subtis/api/lib/schemas";

// shared
import { getIsCinemaRecording, getIsTvShow } from "@subtis/shared";

// internals
import { sendEmail } from "./email";
import { indexTitleByFileName } from "./file";

// core
export async function indexNotFoundSubtitles({ ascending = true }: { ascending: boolean }) {
  const pageSize = 100;
  let currentPage = 0;
  let hasMoreRecords = true;

  while (hasMoreRecords) {
    const { data, error } = await supabase
      .from("SubtitlesNotFound")
      .select("*")
      .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1)
      .order("created_at", { ascending });
    // .not("email", "is", null)

    if (error) {
      console.error("Error fetching subtitles:", error);
      break;
    }

    const notFoundSubtitles = z.array(publicSubtitlesnotfoundRowSchemaSchema).safeParse(data);

    if (!notFoundSubtitles.success) {
      console.error("Error parsing subtitles:", notFoundSubtitles.error);
      break;
    }

    if (notFoundSubtitles.data.length === 0) {
      hasMoreRecords = false;
      break;
    }

    for (const notFoundSubtitle of notFoundSubtitles.data) {
      try {
        console.table([notFoundSubtitle]);

        const continueToNextTitle = await confirm({
          message: `¿Desea indexar el siguiente titulo? ${notFoundSubtitle.title_file_name}`,
        });

        if (!continueToNextTitle) {
          continue;
        }

        const isTvShow = getIsTvShow(notFoundSubtitle.title_file_name);
        const isCinemaRecording = getIsCinemaRecording(notFoundSubtitle.title_file_name);

        // TODO: Temporarily skipping tv shows
        if (isTvShow) {
          console.log("Skipping tv show", notFoundSubtitle.title_file_name);
          throw new Error("Skipping tv show");
        }

        if (isCinemaRecording) {
          console.log("Skipping cinema recording", notFoundSubtitle.title_file_name);
          throw new Error("Skipping cinema recording");
        }

        const { data } = await supabase
          .from("Subtitles")
          .select(subtitlesQuery)
          .or(`title_file_name.eq.${notFoundSubtitle.title_file_name},bytes.eq.${String(notFoundSubtitle.bytes)}`)
          .single();

        const subtitleAlreadyExists = subtitleNormalizedSchema.safeParse(data);

        if (subtitleAlreadyExists.success) {
          console.log("subtitle already exists", notFoundSubtitle.title_file_name);

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

          console.log("deleting subtitle not found", notFoundSubtitle.title_file_name);
          await supabase.from("SubtitlesNotFound").delete().eq("title_file_name", notFoundSubtitle.title_file_name);
          console.log("deleted subtitle not found", notFoundSubtitle.title_file_name);

          continue;
        }

        console.log("indexing title by file name", notFoundSubtitle.title_file_name);
        const { ok } = await indexTitleByFileName({
          indexedBy: "indexer-not-found",
          bytes: notFoundSubtitle.bytes,
          titleFileName: notFoundSubtitle.title_file_name,
          shouldStoreNotFoundSubtitle: false,
          isDebugging: false,
          shouldIndexAllTorrents: false,
        });
        console.log("\n ~ indexNotFoundSubtitles ~ ok:", ok);

        if (ok === true) {
          if (notFoundSubtitle.email) {
            console.log(`sending email to ${notFoundSubtitle.email}...`);

            try {
              const { data, error } = await supabase
                .from("Subtitles")
                .select(subtitlesQuery)
                .or(`title_file_name.eq.${notFoundSubtitle.title_file_name},bytes.eq.${String(notFoundSubtitle.bytes)}`)
                .single();

              if (error) {
                console.error("Error fetching subtitle:", error);
                continue;
              }

              const subtitleByFileName = subtitleNormalizedSchema.safeParse(data);

              if (!subtitleByFileName.success) {
                throw new Error("Subtitle not found in some way");
              }

              await sendEmail(subtitleByFileName.data, notFoundSubtitle.email);
            } catch (error) {
              console.log("\n ~ forawait ~ error 2 after indexation:", error);
              continue;
            }
          }

          await supabase.from("SubtitlesNotFound").delete().eq("title_file_name", notFoundSubtitle.title_file_name);
        } else {
          const { run_times } = notFoundSubtitle;

          const response = await supabase
            .from("SubtitlesNotFound")
            .update({ run_times: run_times + 1 })
            .eq("id", notFoundSubtitle.id);
          console.log("\n ~ forawait ~ response 3:", response);
        }
      } catch (error) {
        console.log("\n ~ forawait ~ error 3:", error);
      } finally {
        await supabase.from("SubtitlesNotFound").delete().eq("title_file_name", notFoundSubtitle.title_file_name);
      }
    }

    currentPage++;
  }

  console.log("Finished processing all records.");
}
