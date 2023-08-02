import "dotenv/config";

import fs from "fs";
import path from "path";
import delay from "delay";
import download from "download";
import extract from "extract-zip";
import unrar from "@continuata/unrar";
import parseTorrent from "parse-torrent-updated";

import { getMovieData } from "./movie";
import { getSupabaseClient } from "./supabase";
import { getSubDivXSubtitleLink } from "./subdivx";
import {
  ReleaseGroupMap,
  ReleaseGroupNames,
  getReleaseGroupsFromDb,
  saveReleaseGroupsToDb,
} from "./release-groups";
import {
  SUBTITLE_GROUPS,
  SubtitleGroupMap,
  SubtitleGroupNames,
  getSubtitleGroupsFromDb,
  saveSubtitleGroupsToDb,
} from "./subtitle-groups";
import {
  YtsMxMovie,
  getYtsMxMovieList,
  getYtsMxTotalMoviesAndPages,
} from "./yts-mx";
import {
  getRandomDelay,
  getFileNameHash,
  getNumbersArray,
  VIDEO_FILE_EXTENSIONS,
} from "./utils";
import { getArgenteamSubtitleLink } from "./argenteam";

// supabase
const supabase = getSupabaseClient();

// db indexer
type File = {
  path: string;
  name: string;
  length: number;
  offset: number;
};

async function setMovieSubtitlesToDatabase({
  subtitle,
  movie,
  resolution,
  fileNameHash,
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
    fileExtension: "rar" | "zip";
  };
  movie: {
    id: string;
    name: string;
    year: number;
    rating: number;
  };
  resolution: string;
  fileNameHash: string;
  releaseGroup: ReleaseGroupNames;
  subtitleGroup: SubtitleGroupNames;
  releaseGroups: ReleaseGroupMap;
  subtitleGroups: SubtitleGroupMap;
}) {
  const {
    subtitleLink,
    subtitleSrtFileName,
    subtitleCompressedFileName,
    subtitleFileNameWithoutExtension,
    fileExtension,
  } = subtitle;

  // 8. Download subtitle to fs
  await download(subtitleLink, "subtitles", {
    filename: subtitleCompressedFileName,
  });

  // 9. Create path to downloaded subtitles
  const subtitleAbsolutePath = path.resolve(
    `${__dirname}/subtitles/${subtitleCompressedFileName}`,
  );

  // 10. Create path to extracted subtitles
  const extractedSubtitlePath = path.resolve(
    `${__dirname}/subs/${subtitleFileNameWithoutExtension}`,
  );

  // 11. Handle compressed rar files
  if (fileExtension === "rar") {
    fs.mkdir(extractedSubtitlePath, { recursive: true }, (error) => null);

    await unrar.uncompress({
      command: "e",
      switches: ["-o+", "-idcd"],
      src: subtitleAbsolutePath,
      dest: extractedSubtitlePath,
    });
  }

  // 12. Handle compressed zip files
  if (fileExtension === "zip") {
    await extract(subtitleAbsolutePath, { dir: extractedSubtitlePath });
  }

  // 13. Get extracted subtitle files
  const extractedSubtitleFiles = fs.readdirSync(extractedSubtitlePath);

  // 14. Get SRT file name
  const srtFile = extractedSubtitleFiles.find(
    (file) => path.extname(file).toLowerCase() === ".srt",
  );

  // 15. Get SRT file path
  const extractedSrtFileNamePath = path.resolve(
    `${__dirname}/subs/${subtitleFileNameWithoutExtension}/${srtFile}`,
  );

  // 16. Read SRT file
  const srtFileToUpload = fs.readFileSync(extractedSrtFileNamePath);

  // 17. Upload SRT file to Supabase storage
  const uploaded = await supabase.storage
    .from("subtitles")
    .upload(subtitleSrtFileName, srtFileToUpload);

  // 18. Save SRT to Supabase and get public URL for SRT file
  const {
    data: { publicUrl },
  } = await supabase.storage
    .from("subtitles")
    .getPublicUrl(subtitleSrtFileName);

  // 19. Get movie id by imdbId
  const { data: movieData } = await supabase
    .from("Movies")
    .select("*")
    .eq("id", movie.id);

  // 20. Save movie to Supabase if is not yet saved
  if (Array.isArray(movieData) && !movieData.length) {
    await supabase.from("Movies").insert(movie).select();
  }

  // 21. Get release and subtitle group id
  const releaseGroupId = releaseGroups[releaseGroup].id;
  const subtitleGroupId = subtitleGroups[subtitleGroup].id;

  // 22. Save subtitle to Supabase
  await supabase.from("Subtitles").insert({
    releaseGroupId,
    subtitleGroupId,
    movieId: movie.id,
    resolution,
    fileNameHash,
    subtitleLink: publicUrl,
  });

  console.table([
    { name: movie.name, resolution, releaseGroup, subtitleGroup },
  ]);
}

async function getMovieListFromDb(
  movie: YtsMxMovie,
  releaseGroups: ReleaseGroupMap,
  subtitleGroups: SubtitleGroupMap,
) {
  const { title, rating, year, torrents, imdb_code: imdbId } = movie;

  for await (const torrent of torrents) {
    const { url, hash } = torrent;

    try {
      // 1. Download torrent
      const torrentFilename = hash;
      await download(url, "torrents", { filename: torrentFilename });

      // 2. Read torrent file
      const torrentFile = fs.readFileSync(
        `${__dirname}/torrents/${torrentFilename}`,
      );
      const { files } = parseTorrent(torrentFile) as { files: File[] };

      // 3. Find video file
      const videoFile = files.find((file) => {
        return VIDEO_FILE_EXTENSIONS.some((videoFileExtension) => {
          return file.name.endsWith(videoFileExtension);
        });
      });

      // 4. Return if no video file (should return?)
      if (!videoFile) continue;

      // 5. Get movie data from video file
      const { resolution, releaseGroup } = getMovieData(videoFile.name);

      // 6. Hash video file name
      const fileNameHash = getFileNameHash(videoFile.name);

      // 7. Find subtitle metadata from SubDivx
      const subtitles = await Promise.allSettled([
        getSubDivXSubtitleLink(videoFile.name),
        getArgenteamSubtitleLink(videoFile.name, imdbId),
      ]);

      const resolvedSubtitles = subtitles.filter(
        (subtitle) => subtitle.status === "fulfilled",
      );

      resolvedSubtitles.forEach(({ value: subtitle }) => {
        const { subtitleGroup } = subtitle;

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
          fileNameHash,
          releaseGroup,
          releaseGroups,
          subtitleGroups,
        });
      });
    } catch (error) {
      console.log("\n ~ forawait ~ error:", error.message);
    }
  }
}

async function ytsMxIndexer(): Promise<void> {
  // 0. Get release and subtitle groups from DB
  const releaseGroups = await getReleaseGroupsFromDb(supabase);
  const subtitleGroups = await getSubtitleGroupsFromDb(supabase);

  // 1. Get total YTS-MX pages
  const { totalPages } = await getYtsMxTotalMoviesAndPages();

  // 2. Create array of pages (from 1 to totalPages)
  const totalPagesArray = getNumbersArray(totalPages);

  // 3. Await for each page to get movies
  for await (const page of totalPagesArray) {
    console.log(`Getting movies for page ${page} 🚨`);

    // 4. Get all the movies (50) for this page
    const movieList = await getYtsMxMovieList(page);

    // 5. Filter movies from movie list which already exists in DB
    const { data: moviesFromDb } = await supabase
      .from("Movies")
      .select("*")
      .in(
        "id",
        movieList.map((movie) => movie.imdb_code),
      );

    const moviesIdsFromDb = (moviesFromDb ?? []).map((movie) => movie.id);
    const movieListNotInDb = movieList.filter(
      (movie) => !moviesIdsFromDb.includes(movie.imdb_code),
    );

    // 6. Run all 50 movies in parallels to get their subtitle and save them to DB and Storage
    const movieListPromises = movieListNotInDb.map(async (movie) =>
      getMovieListFromDb(movie, releaseGroups, subtitleGroups),
    );
    await Promise.all(movieListPromises);

    // one by one just for testing purposess
    // for await (const movieData of movieList) {
    //   await getMovieListFromDb(movieData, releaseGroups);
    //   // return;
    // }

    console.log(`Finished movies from page ${page} 🥇`);

    // 7. Generate random delays between 5 and 15 seconds
    const { seconds, miliseconds } = getRandomDelay(5, 10);
    console.log(`Delaying next iteration by ${seconds}s to avoid get blocked`);

    // 8. Delay next iteration
    await delay(miliseconds);
  }

  console.log("All movies saved to DB and Storage! 🎉");
}

ytsMxIndexer();

// saveReleaseGroupsToDb(supabase);
// saveSubtitleGroupsToDb(supabase);

// TODO: Add support table in Notion for QA
// TODO: Add ts-reset
// TODO: Try bun for dev at least
