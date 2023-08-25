import turl from "turl";
import delay from "delay";
import invariant from "tiny-invariant";
import { intro, outro, spinner } from "@clack/prompts";

import { supabase } from "./supabase";
import { getMovieData } from "./movie";
import { VIDEO_FILE_EXTENSIONS } from "./utils";

async function cli() {
  const loader = spinner();

  try {
    intro("➖ PoneleLosSubs - CLI");

    // 1. Get file name from CLI args
    const args = process.argv;
    const fileName = args.at(-1);

    invariant(fileName, "File name not provided");

    const parsedFileName = fileName.includes("/")
      ? fileName.split("/").at(-1)
      : fileName;

    invariant(parsedFileName, "File name not provided");

    const { name, resolution, releaseGroup } = getMovieData(parsedFileName);
    loader.start(
      `🔎 Searching subtitle for "${name}" in ${resolution} for "${releaseGroup}" release group`,
    );
    await delay(400);

    // 2. Checks if file is a video
    const isVideoFile = VIDEO_FILE_EXTENSIONS.some((videoFileExtension) =>
      parsedFileName.endsWith(videoFileExtension),
    );

    invariant(isVideoFile, `File is not a video: ${parsedFileName}`);

    // 3. Get subtitles from supabase
    const { data: subtitles, statusText } = await supabase
      .from("Subtitles")
      .select("*")
      .eq("fileName", parsedFileName);

    invariant(
      statusText === "OK" && subtitles && subtitles.length > 0,
      `Subtitles not found for file: ${parsedFileName}`,
    );

    // 4. Display subtitle link
    const [subtitle] = subtitles;

    // 5. Short subtitle link
    const subtitleShortLink = await turl.shorten(subtitle.subtitleLink);

    // 6. Stop loader and display subtitle link
    loader.stop(
      `🥳 Click on the following link to download your subtitle: ${subtitleShortLink}`,
    );

    outro("🍿 Enjoy your movie!");
  } catch (error) {
    loader.stop();
    outro(`🔴 ${(error as Error).message.slice(18)}`);
  }
}

cli();
