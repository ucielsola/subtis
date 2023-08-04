import "dotenv/config";

import fs from "fs";
import turl from "turl";
import path from "path";
import delay from "delay";
import download from "download";
import extract from "extract-zip";
import { match } from "ts-pattern";
import unrar from "@continuata/unrar";
import invariant from "tiny-invariant";

import { getMovieData } from "./movie";
import { getSupabaseClient } from "./supabase";
import { getSubDivXSubtitleLink } from "./subdivx";
import {
  ReleaseGroupMap,
  ReleaseGroupNames,
  getReleaseGroupsFromDb,
} from "./release-groups";
import {
  SubtitleGroupMap,
  SubtitleGroupNames,
  getSubtitleGroupsFromDb,
} from "./subtitle-groups";
import {
  YtsMxMovie,
  getYtsMxMovieList,
  getYtsMxTotalMoviesAndPages,
} from "./yts-mx";
import {
  getRandomDelay,
  getFileNameHash,
  safeParseTorrent,
  VIDEO_FILE_EXTENSIONS,
} from "./utils";
import { getArgenteamSubtitleLink } from "./argenteam";

// supabase
const supabase = getSupabaseClient();

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
    .exhaustive();

  // 6. Get extracted subtitle files
  const extractedSubtitleFiles = fs.readdirSync(extractedSubtitlePath);

  // 7. Get SRT file name
  const srtFile = extractedSubtitleFiles.find(
    (file) => path.extname(file).toLowerCase() === ".srt",
  );
  invariant(srtFile, "SRT file not found");

  // 8. Get SRT file path
  const extractedSrtFileNamePath = path.resolve(
    `${__dirname}/subs/${subtitleFileNameWithoutExtension}/${srtFile}`,
  );

  // 9. Read SRT file
  const srtFileToUpload = fs.readFileSync(extractedSrtFileNamePath);

  // 10. Upload SRT file to Supabase storage
  await supabase.storage
    .from("subtitles")
    .upload(subtitleSrtFileName, srtFileToUpload);

  // 11. Save SRT to Supabase and get public URL for SRT file
  const {
    data: { publicUrl },
  } = await supabase.storage
    .from("subtitles")
    .getPublicUrl(subtitleSrtFileName);

  // 12. Get movie by ID
  const { data: movieData } = await supabase
    .from("Movies")
    .select("*")
    .eq("id", movie.id);
  invariant(movieData, "Movie not found");

  // 13. Save movie to Supabase if is not yet saved
  if (Array.isArray(movieData) && !movieData.length) {
    await supabase.from("Movies").insert(movie).select();
  }

  // 14. Get release and subtitle group id
  const { id: releaseGroupId } = releaseGroups[releaseGroup];
  const { id: subtitleGroupId } = subtitleGroups[subtitleGroup];

  // 15. Save subtitle to Supabase
  await supabase.from("Subtitles").insert({
    releaseGroupId,
    subtitleGroupId,
    resolution,
    fileNameHash,
    movieId: movie.id,
    subtitleLink: publicUrl,
  });

  // 16. Short Subtitle link
  const subtitleShortLink = await turl.shorten(publicUrl);

  console.table([
    {
      name: movie.name.padEnd(50, "."),
      resolution,
      releaseGroup,
      subtitleGroup,
      subtitleLink: subtitleShortLink,
      imdbLink: `https://www.imdb.com/title/${movie.id}`,
    },
  ]);
}

async function getMovieListFromDb(
  movie: YtsMxMovie,
  releaseGroups: ReleaseGroupMap,
  subtitleGroups: SubtitleGroupMap,
): Promise<void> {
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
      const { files } = safeParseTorrent(torrentFile);

      // 3. Find video file
      const videoFile = files.find((file) => {
        return VIDEO_FILE_EXTENSIONS.some((videoFileExtension) => {
          return file.name.endsWith(videoFileExtension);
        });
      });

      // 4. Return if no video file
      if (!videoFile) continue;

      // 5. Get movie data from video file name
      const { resolution, releaseGroup } = getMovieData(videoFile.name);

      // 6. Hash video file name
      const fileNameHash = getFileNameHash(videoFile.name);

      // 7. Find subtitle metadata from SubDivx and Argenteam
      const subtitles = await Promise.allSettled([
        getSubDivXSubtitleLink(videoFile.name),
        // getArgenteamSubtitleLink(videoFile.name, imdbId),
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
  // 1. Get total YTS-MX pages
  const { totalPagesArray } = await getYtsMxTotalMoviesAndPages();

  // 2. Await for each page to get movies
  for await (const page of totalPagesArray) {
    console.log(`Getting movies for page ${page} 🚨`);

    // 3. Get all the movies (50) for this page
    const movieList = await getYtsMxMovieList(page);

    // 4. Filter movies from movie list which already exists in DB
    const movieListIds = movieList.map(({ imdb_code }) => imdb_code);

    const { data: moviesFromDb } = await supabase
      .from("Movies")
      .select("*")
      .in("id", movieListIds);

    const moviesIdsFromDb = (moviesFromDb ?? []).map(({ id }) => id);
    const movieListNotInDb = movieList.filter(
      ({ imdb_code }) => !moviesIdsFromDb.includes(imdb_code),
    );

    // 5. Run all 50 movies in parallels to get their subtitle and save them to DB and Storage
    const movieListPromises = movieListNotInDb.map((movie) =>
      getMovieListFromDb(movie, releaseGroups, subtitleGroups),
    );
    await Promise.all(movieListPromises);

    // one by one just for testing purposess
    // for await (const movieData of movieList) {
    //   await getMovieListFromDb(movieData, releaseGroups);
    //   // return;
    // }

    console.log(`Finished movies from page ${page} 🥇`);

    // 6. Generate random delays between 2 and 5 seconds
    const { seconds, miliseconds } = getRandomDelay(2, 5);
    console.log(`Delaying next iteration by ${seconds}s to avoid get blocked`);

    // 7. Delay next iteration
    await delay(miliseconds);

    console.log("-------------------------------\n\n\n");
  }

  console.log("All movies saved to DB and Storage! 🎉");
}

async function mod() {
  console.log("ABOUT TO INDEX ALL MOVIES SUBTITLES FROM YTS-MX 🚀");

  // 1. Get release and subtitle groups from DB
  const releaseGroups = await getReleaseGroupsFromDb(supabase);
  const subtitleGroups = await getSubtitleGroupsFromDb(supabase);

  // 2. Run YTS-MX indexer
  indexYtsMxMoviesSubtitles(releaseGroups, subtitleGroups);
}

mod();

// TODO: Add videoFileName, and fileExtension to DB in Subtitles
// TODO: Maybe add imdb full link to DB?
// TODO: Review tables and types with Hugo
// TODO: Ping Nico to work over codebase simplification and scalability
// TODO: Run getSubDivXSubtitleLink, and getArgenteamSubtitleLink, by separate to find bugs
// TODO: Can we get short URL from Supabase without using turl?
// TODO: Add OpenSubtitles source
// TODO: Test rarbg-api node module to get movies https://www.npmjs.com/package/rarbg-api
