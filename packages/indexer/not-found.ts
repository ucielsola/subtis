import { z } from "zod";

// db
import { subtitlesNotFoundRowSchema, supabase } from "@subtis/db";

// internals
import { indexTitleByFileName } from "./file";


async function indexNotFoundSubtitles() {
  const { data } = await supabase.from("SubtitlesNotFound").select("*");
  const notFoundSubtitles = z.array(subtitlesNotFoundRowSchema).safeParse(data);

  if (!notFoundSubtitles.success) {
    throw new Error("No data found");
  }

  for await (const notFoundSubtitle of notFoundSubtitles.data) {
    const { ok } = await indexTitleByFileName(notFoundSubtitle.title_file_name, false);

    if (ok === true) {
      await supabase.from("SubtitlesNotFound").delete().eq("title_file_name", notFoundSubtitle.title_file_name);
    }
  }
}

indexNotFoundSubtitles()
