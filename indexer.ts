import fs from "fs";
import path from "path";
import delay from "delay";
import sound from "sound-play";
import { rimraf } from "rimraf";
import download from "download";
import extract from "extract-zip";
import { match } from "ts-pattern";
import unrar from "@continuata/unrar";
import invariant from "tiny-invariant";
import { confirm } from "@clack/prompts";

import { supabase } from "./supabase";
import { getImdbLink } from "./imdb";
import { getMovieData } from "./movie";
import {
  ReleaseGroupMap,
  ReleaseGroupNames,
  getReleaseGroups,
} from "./release-groups";
import {
  SubtitleGroupMap,
  SubtitleGroupNames,
  getSubtitleGroups,
} from "./subtitle-groups";
import {
  YtsMxMovieList,
  getYtsMxMovieList,
  getYtsMxTotalMoviesAndPages,
} from "./yts-mx";
import {
  getRandomDelay,
  getFileNameHash,
  safeParseTorrent,
  getMovieFileNameExtension,
  VIDEO_FILE_EXTENSIONS,
} from "./utils";

// providers
import { getSubDivXSubtitle } from "./subdivx";
import { getArgenteamSubtitle } from "./argenteam";
import { getOpenSubtitlesSubtitle } from "./opensubtitles";

// utils
async function setMovieSubtitlesToDatabase({
  subtitle,
  movie,
  fileName,
  resolution,
  fileNameHash,
  fileNameExtension,
  releaseGroup,
  subtitleGroup,
  releaseGroups,
  subtitleGroups,
}: {
  subtitle: {
    subtitleLink: string;
    subtitleSrtFileName: string;
    subtitleCompressedFileName: string;
    subtitleFileNameWithoutExtension: string;
    fileExtension: "rar" | "zip" | "srt";
  };
  movie: {
    id: number;
    name: string;
    year: number;
    rating: number;
  };
  fileName: string;
  resolution: string;
  fileNameHash: string;
  fileNameExtension: string;
  releaseGroup: ReleaseGroupNames;
  subtitleGroup: SubtitleGroupNames;
  releaseGroups: ReleaseGroupMap;
  subtitleGroups: SubtitleGroupMap;
}): Promise<void> {
  const {
    subtitleLink,
    subtitleSrtFileName,
    subtitleCompressedFileName,
    subtitleFileNameWithoutExtension,
    fileExtension,
  } = subtitle;

  // 1. Download subtitle to fs
  await download(subtitleLink, "subtitles", {
    filename: subtitleCompressedFileName,
  });

  // 2. Create path to downloaded subtitles
  const subtitleAbsolutePath = path.resolve(
    `${__dirname}/subtitles/${subtitleCompressedFileName}`,
  );

  // 3. Create path to extracted subtitles
  const extractedSubtitlePath = path.resolve(
    `${__dirname}/subs/${subtitleFileNameWithoutExtension}`,
  );

  // 4. Handle compressed zip/rar files
  await match(fileExtension)
    .with("rar", async () => {
      fs.mkdir(extractedSubtitlePath, { recursive: true }, (_error) => null);

      await unrar.uncompress({
        command: "e",
        switches: ["-o+", "-idcd"],
        src: subtitleAbsolutePath,
        dest: extractedSubtitlePath,
      });
    })
    .with("zip", async () => {
      await extract(subtitleAbsolutePath, { dir: extractedSubtitlePath });
    })
    .with("srt", async () => {
      await download(subtitleLink, "subs", {
        filename: subtitleSrtFileName,
      });
    })
    .exhaustive();

  let srtFileToUpload;

  if (["zip", "rar"].includes(fileExtension)) {
    const extractedSubtitleFiles = fs.readdirSync(extractedSubtitlePath);

    const srtFile = extractedSubtitleFiles.find(
      (file) => path.extname(file).toLowerCase() === ".srt",
    );
    invariant(srtFile, "SRT file not found");

    const extractedSrtFileNamePath = path.resolve(
      `${__dirname}/subs/${subtitleFileNameWithoutExtension}/${srtFile}`,
    );

    srtFileToUpload = fs.readFileSync(extractedSrtFileNamePath);
  }

  if (fileExtension === "srt") {
    const srtFileNamePath = path.resolve(
      `${__dirname}/subs/${subtitleSrtFileName}`,
    );

    srtFileToUpload = fs.readFileSync(srtFileNamePath);
  }

  // 10. Upload SRT file to Supabase storage
  await supabase.storage
    .from("subtitles")
    .upload(subtitleSrtFileName, srtFileToUpload as Buffer);

  // 11. Remove files and folders from fs to avoid collition with others subtitle groups
  await rimraf([subtitleAbsolutePath, extractedSubtitlePath]);

  // 12. Save SRT to Supabase and get public URL for SRT file
  const {
    data: { publicUrl },
  } = await supabase.storage
    .from("subtitles")
    .getPublicUrl(subtitleSrtFileName, { download: true });

  // 13. Get movie by ID
  const { data: movieData } = await supabase
    .from("Movies")
    .select("*")
    .eq("id", movie.id);
  invariant(movieData, "Movie not found");

  // 14. Save movie to Supabase if is not yet saved
  if (Array.isArray(movieData) && !movieData.length) {
    await supabase.from("Movies").insert(movie).select();
  }

  // 15. Get release and subtitle group id
  const { id: releaseGroupId } = releaseGroups[releaseGroup];
  const { id: subtitleGroupId } = subtitleGroups[subtitleGroup];

  // 16. Save subtitle to Supabase
  await supabase.from("Subtitles").insert({
    resolution,
    releaseGroupId,
    subtitleGroupId,
    movieId: movie.id,
    subtitleLink: publicUrl,
    fileName,
    fileNameHash,
    fileExtension: fileNameExtension,
  });

  // 17. Short Subtitle link (ONLY USED FOR DEVELOPMENT)
  // const subtitleShortLink = await turl.shorten(publicUrl);

  console.table([
    {
      name: movie.name.padEnd(50, "."),
      resolution,
      releaseGroup,
      subtitleGroup,
      imdbLink: getImdbLink(movie.id),
      subtitleLink: `${subtitleLink.slice(0, 20)}...`,
    },
  ]);
}

async function getMovieListFromDb(
  movie: YtsMxMovieList,
  releaseGroups: ReleaseGroupMap,
  subtitleGroups: SubtitleGroupMap,
): Promise<void> {
  const { title, rating, year, torrents, imdbId } = movie;

  for await (const torrent of torrents) {
    const { url, hash } = torrent;

    try {
      // 1. Download torrent
      const torrentFilename = hash;
      await download(url, "torrents", { filename: torrentFilename });

      // 2. Read torrent file
      const torrentPath = `${__dirname}/torrents/${torrentFilename}`;
      const torrentFile = fs.readFileSync(torrentPath);
      const { files } = safeParseTorrent(torrentFile);

      // 3. Remove torrent from fs
      await rimraf(torrentPath);

      // 3. Find video file
      const videoFile = files.find((file) => {
        return VIDEO_FILE_EXTENSIONS.some((videoFileExtension) => {
          return file.name.endsWith(videoFileExtension);
        });
      });

      // 4. Return if no video file
      if (!videoFile) continue;

      // 5. Get movie data from video file name
      const fileName = videoFile.name;
      const fileNameExtension = getMovieFileNameExtension(fileName);

      const movieData = getMovieData(fileName);
      const { resolution, releaseGroup } = movieData;

      // 6. Hash video file name
      const fileNameHash = getFileNameHash(fileName);

      // 7. Find subtitle metadata from SubDivx and Argenteam
      const subtitles = await Promise.allSettled([
        getSubDivXSubtitle(movieData),
        getArgenteamSubtitle(movieData, imdbId),
        getOpenSubtitlesSubtitle(movieData, imdbId),
      ]);

      // 8. Filter fulfilled only promises
      const resolvedSubtitles = subtitles.filter(
        (subtitle) => subtitle.status === "fulfilled",
      ) as PromiseFulfilledResult<{
        subtitleLink: string;
        subtitleGroup: SubtitleGroupNames;
        subtitleSrtFileName: string;
        subtitleCompressedFileName: string;
        subtitleFileNameWithoutExtension: string;
        fileExtension: "zip" | "rar";
      }>[];

      // 9. Save whole subtitles data to DB
      resolvedSubtitles.forEach(({ value: subtitle }) => {
        const { subtitleGroup } = subtitle;

        // play sound when a subtitle was found
        sound.play("./success_short_high.wav");

        setMovieSubtitlesToDatabase({
          subtitle,
          subtitleGroup,
          movie: {
            id: imdbId,
            name: title,
            year,
            rating,
          },
          resolution,
          fileName,
          fileNameHash,
          fileNameExtension,
          releaseGroup,
          releaseGroups,
          subtitleGroups,
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log("\n ~ forawait ~ error:", error.message);
      }
    }
  }
}

async function indexYtsMxMoviesSubtitles(
  releaseGroups: ReleaseGroupMap,
  subtitleGroups: SubtitleGroupMap,
): Promise<void> {
  console.log("ABOUT TO INDEX ALL MOVIES SUBTITLES FROM YTS-MX 🚀");

  // 1. Get total YTS-MX pages
  const { totalPagesArray } = await getYtsMxTotalMoviesAndPages();

  // 2. Await for each page to get movies
  for await (const page of totalPagesArray) {
    console.log(`Getting movies for page ${page} 🚨`);

    // 3. Get all the movies (50) for this page
    const movieList = await getYtsMxMovieList(page);

    // 4. Filter movies from movie list which already exists in DB
    const movieListIds = movieList.map(({ imdbId }) => imdbId);

    const { data: moviesFromDb } = await supabase
      .from("Movies")
      .select("*")
      .in("id", movieListIds);

    const moviesIdsFromDb = (moviesFromDb ?? []).map(({ id }) => id);
    const movieListNotInDb = movieList.filter(
      ({ imdbId }) => !moviesIdsFromDb.includes(imdbId),
    );

    // 5. Run all 50 movies in parallels to get their subtitle and save them to DB and Storage
    // const movieListPromises = movieListNotInDb.map((movie) =>
    //   getMovieListFromDb(movie, releaseGroups, subtitleGroups),
    // );
    // await Promise.all(movieListPromises);

    // 6. Optional: or one by one just for testing purposess
    for await (const movie of movieListNotInDb) {
      console.log(`Movie to find: ${movie.title} (${movie.year})`);

      await getMovieListFromDb(movie, releaseGroups, subtitleGroups);

      const shouldContinue = await confirm({
        message: "Do you want to continue?",
      });

      if (!shouldContinue) break;
    }

    console.log(`Finished movies from page ${page} 🥇`);

    // 6. Generate random delays between 4 and 6 seconds
    const { seconds, miliseconds } = getRandomDelay(4, 6);
    console.log(`Delaying next iteration by ${seconds}s to avoid get blocked`);

    // 7. Delay next iteration
    await delay(miliseconds);

    console.log("-------------------------------\n\n\n");
  }

  console.log("All movies saved to DB and Storage! 🎉");
}

// main
async function mainIndexer(): Promise<void> {
  try {
    // 1. Get release and subtitle groups from DB
    const releaseGroups = await getReleaseGroups(supabase);
    const subtitleGroups = await getSubtitleGroups(supabase);

    // 2. Run YTS-MX indexer
    indexYtsMxMoviesSubtitles(releaseGroups, subtitleGroups);
  } catch (error) {
    console.log("\n ~ mainIndexer ~ error:", error);
  }
}

mainIndexer();

// TODO: Add custom error types for each provider
// TODO: Reach 100% coverage
// TODO: Add support for series
// TODO: Review tables and types with Hugo
// TODO: Ping Nico to showcase codebase
// TODO: Run getSubDivXSubtitle, and getArgenteamSubtitle, getOpenSubtitleLink by separate to find bugs
// TODO: Test rarbg-api node module to get movies https://www.npmjs.com/package/rarbg-api
// TODO: Upload SRT file to Supabase with original movie file name (not supported?, it needs to be uploaded as a compressed file?)
// TODO: Can we download movie and check with a script if the subtitle matches the audio?
