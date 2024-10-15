// db
import { supabase } from "@subtis/db";

// shared
import { getIsTvShow } from "@subtis/shared";

// api
import { subtitleSchema } from "@subtis/api/shared/schemas";

// internals
import { apiClient } from "./api";
import { sendEmail } from "./email";
import { indexTitleByFileName } from "./file";

// constants
const MAX_INDEXING_TITLES = 10;
const torrentsIndexing = new Set<string>();

export async function indexNotFoundSubtitlesFromSupabase() {
  supabase
    .channel("table-db-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "SubtitlesNotFound",
      },
      async (payload) => {
        const { new: newSubtitleNotFound } = payload;
        const { title_file_name, bytes, email } = newSubtitleNotFound;
        const isTvShow = getIsTvShow(title_file_name);

        // TODO: Temporarily skipping tv shows
        if (isTvShow) {
          console.log("Skipping tv show", title_file_name);
          return;
        }

        console.log("User was trying to watch:");
        console.table([{ title_file_name, bytes, email }]);

        const isIndexingTitleFileName = torrentsIndexing.has(title_file_name);
        const isIndexingTooManyTitles = torrentsIndexing.size > MAX_INDEXING_TITLES;

        if (isIndexingTitleFileName) {
          console.log(`Already indexing ${title_file_name}, skipping`);
          return;
        }

        if (isIndexingTooManyTitles) {
          console.log(`Too many titles being indexed, skipping ${title_file_name}`);
          return;
        }

        torrentsIndexing.add(title_file_name);

        const { ok } = await indexTitleByFileName({
          indexedBy: "indexer-supabase",
          bytes: bytes,
          titleFileName: title_file_name,
          shouldStoreNotFoundSubtitle: false,
          isDebugging: false,
        });

        if (ok) {
          console.log("Subtitle found for ", title_file_name);
        }

        if (ok === true) {
          if (email) {
            console.log(`sending email to ${email}...`);

            try {
              const response = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
                param: {
                  bytes: String(bytes),
                  fileName: title_file_name,
                },
              });

              const data = await response.json();
              const subtitleByFileName = subtitleSchema.safeParse(data);

              if (!subtitleByFileName.success) {
                throw new Error("Subtitle not found in some way");
              }

              await sendEmail(subtitleByFileName.data, email);
            } catch (error) {
              console.log("\n ~ forawait ~ error 2 after indexation:", error);
            }
          }

          const res = await supabase.from("SubtitlesNotFound").delete().eq("title_file_name", title_file_name);

          if (res.status === 200) {
            console.log("Subtitle removed from SubtitlesNotFound successfully");
          }
        }

        torrentsIndexing.delete(title_file_name);
      },
    )
    .subscribe();
}

// testing
indexNotFoundSubtitlesFromSupabase();
