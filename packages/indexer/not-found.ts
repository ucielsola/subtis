// import { confirm } from "@clack/prompts";
import { z } from "zod";

// db
import { subtitlesNotFoundRowSchema, supabase } from "@subtis/db";

// api
import { subtitleSchema } from "@subtis/api/shared/schemas";

// shared
import { apiClient, getIsTvShow } from "@subtis/shared";

// internals
import { sendEmail } from "./email";
import { indexTitleByFileName } from "./file";

// core
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

      const isTvShow = getIsTvShow(notFoundSubtitle.title_file_name);

      // TODO: Temporarily skipping tv shows
      if (isTvShow) {
        console.log("Skipping tv show", notFoundSubtitle.title_file_name);
        continue;
      }

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
        indexedBy: "indexer-not-found",
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

      // await confirm({
      //   message: "¿Desea continuar al siguiente titulo?",
      // });
    }

    currentPage++;
  }

  console.log("Finished processing all records.");
}

// testing
indexNotFoundSubtitles();
