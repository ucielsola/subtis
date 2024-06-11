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
  console.log("\n ~ indexNotFoundSubtitles ~ notFoundSubtitles:", notFoundSubtitles);

  for await (const notFoundSubtitle of notFoundSubtitles.data) {
    console.log("\n ~ forawait ~ notFoundSubtitle:", notFoundSubtitle);

    const subtitleOnSubtitlesTable = await supabase
      .from("Subtitles")
      .select("title_file_name")
      .eq("title_file_name", notFoundSubtitle.title_file_name)
      .single();
    console.log("\n ~ forawait ~ subtitleOnSubtitlesTable:", subtitleOnSubtitlesTable);

    const subtitleAlreadyExists = subtitleOnSubtitlesTable.data;

    if (subtitleAlreadyExists) {
      if (notFoundSubtitle.email) {
        console.log(`sending email to ${notFoundSubtitle.email}...`);
        // TODO: Send email if notFoundSubtitle has exists
      }

      const res = await supabase
        .from("SubtitlesNotFound")
        .delete()
        .eq("title_file_name", notFoundSubtitle.title_file_name);
      console.log("\n ~ forawait ~ res:", res);

      continue;
    }

    const { ok } = await indexTitleByFileName({
      titleFileName: notFoundSubtitle.title_file_name,
      shouldStoreNotFoundSubtitle: false,
      isDebugging: false,
    });

    if (ok === true) {
      if (notFoundSubtitle.email) {
        console.log(`sending email to ${notFoundSubtitle.email}...`);
        // TODO: Send email if notFoundSubtitle has exists
      }

      const res = await supabase
        .from("SubtitlesNotFound")
        .delete()
        .eq("title_file_name", notFoundSubtitle.title_file_name);
      console.log("\n ~ forawait ~ res 2:", res);
    } else {
      const { run_times } = notFoundSubtitle;

      const res = await supabase
        .from("SubtitlesNotFound")
        .update({ run_times: run_times + 1 })
        .eq("id", notFoundSubtitle.id);
      console.log("\n ~ forawait ~ res 3:", res);
    }
  }
}

indexNotFoundSubtitles();

async function populateSubtitlesNotFound() {
  const subtitleNotFounds = [
    // {
    //   title_file_name: "Oppenheimer.2023.1080p.BluRay.DD5.1.x264-GalaxyRG.mkv",
    //   email: "agu.garcia@gmail.com",
    // },
    // {
    //   title_file_name: "shogun.2024.s01e04.1080p.web.h264-successfulcrab.mkv",
    //   email: "lndgalante@gmail.com",
    // },
    // {
    //   title_file_name: "The.Fall.Guy.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv ",
    // },
    {
      title_file_name: "Scenes.From.A.Marriage.1974.1080p.BluRay.x264-[YTS.AM].mp4",
    },
  ];

  for await (const subtitleNotFound of subtitleNotFounds) {
    await supabase.from("SubtitlesNotFound").insert(subtitleNotFound);
  }
}

// populateSubtitlesNotFound()
