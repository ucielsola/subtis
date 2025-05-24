import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import { confirm } from "@clack/prompts";
import download from "download";
import extract from "extract-zip";
import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";
import filesizeParser from "filesize-parser";
import { decode } from "iconv-lite";
import jschardet from "jschardet";
import ms from "ms";
import prettyBytes from "pretty-bytes";
import srtParser2 from "srt-parser-2";
import srtValidator from "srt-validator";
import invariant from "tiny-invariant";
import TorrentSearchApi from "torrent-search-api";
import torrentStream, { type File } from "torrent-stream";
import { match } from "ts-pattern";
import { unrar } from "unrar-promise";
import { decode as decodeWindows1252 } from "windows-1252";
import { z } from "zod";

// internals
import tg from "./torrent-grabber";

// db
import { type Title, supabase } from "@subtis/db";

// shared
import {
  RESOLUTION_REGEX,
  RIP_TYPES_REGEX,
  type TitleFileNameMetadata,
  VIDEO_FILE_EXTENSIONS,
  getIsCinemaRecording,
  getSeasonAndEpisode,
  getStringWithoutSpecialCharacters,
  getTitleFileNameExtension,
  getTitleFileNameMetadata,
  getTitleFileNameWithoutExtension,
} from "@subtis/shared";

// internals
import { getImdbLink } from "./imdb";
import {
  type OpenSubtitlesSubtitles,
  filterOpenSubtitleSubtitlesForTorrent,
  getSubtitlesFromOpenSubtitlesForTitle,
} from "./opensubtitles";
import type { ReleaseGroupMap, ReleaseGroupNames } from "./release-groups";
import { type SubDivXSubtitles, filterSubDivXSubtitlesForTorrent, getSubtitlesFromSubDivXForTitle } from "./subdivx";
import { type SubdlSubtitles, filterSubdlSubtitlesForTorrent, getSubtitlesFromSubdl } from "./subdl";
import type { SubtitleGroupMap, SubtitleGroupNames } from "./subtitle-groups";
import type { TmdbTitle, TmdbTvShow } from "./tmdb";
import type { IndexedBy, SubtitleData } from "./types";
import { YTS_TRACKERS, getYtsTorrents } from "./yts";

// utils
import { executeWithOptionalTryCatch, getSubtitleAuthor } from "./utils";
import { getQueryForTorrentProvider } from "./utils/query";
import { getTitleSlugifiedName } from "./utils/slugify-title";
import { encodeImageToThumbhash } from "./utils/thumbhash";
import { generateIdFromMagnet } from "./utils/torrent";

// types
type TmdbTvShowEpisode = TmdbTvShow & { episode: string };
type TmdbMovie = TmdbTitle & {
  episode: null;
  totalSeasons: null;
  totalEpisodes: null;
};

export type CurrentTitle = TmdbMovie | TmdbTvShowEpisode;

// enum
export enum TitleTypes {
  movie = "movie",
  tvShow = "tv-show",
}

type TitleFile = {
  bytes: number;
  fileName: string;
  fileNameExtension: string;
};

type TitleWithEpisode = Pick<
  Title,
  | "imdb_id"
  | "title_name"
  | "title_name_spa"
  | "title_name_ja"
  | "overview"
  | "rating"
  | "release_date"
  | "year"
  | "poster"
  | "backdrop"
  | "type"
  | "total_seasons"
  | "total_episodes"
  | "logo"
  | "runtime"
  | "certification"
> & {
  episode: string | null;
};

type SubtitleWithResolutionAndTorrentId = SubtitleData & {
  resolution: string;
  torrentId: number;
  ripType: string | null;
};

// constants
const MAX_TORRENTS = 10;
const MAX_TIMEOUT = ms("40s");
const MIN_BYTES = filesizeParser("500MB");

const COMPRESSED_SUBTITLES_FOLDER_NAME = "compressed-subtitles";
const UNCOMPRESSED_SUBTITLES_FOLDER_NAME = "uncompressed-subtitles";

// helpers
async function downloadSubtitle(subtitle: SubtitleWithResolutionAndTorrentId): Promise<void> {
  const { fileExtension, subtitleCompressedFileName, subtitleLink } = subtitle;

  const subtitlesFolderAbsolutePath = path.join(__dirname, "..", "indexer", COMPRESSED_SUBTITLES_FOLDER_NAME);

  if (["rar", "zip"].includes(fileExtension)) {
    await download(subtitleLink, subtitlesFolderAbsolutePath, {
      filename: subtitleCompressedFileName,
    });
  }
}

function getSubtitleAbsolutePaths(subtitle: SubtitleWithResolutionAndTorrentId): {
  subtitleCompressedAbsolutePath: string;
  extractedSubtitlePath: string;
} {
  const { subtitleCompressedFileName, subtitleFileNameWithoutExtension } = subtitle;

  const subtitleCompressedAbsolutePath = path.join(
    __dirname,
    "..",
    "indexer",
    COMPRESSED_SUBTITLES_FOLDER_NAME,
    subtitleCompressedFileName,
  );
  const extractedSubtitlePath = path.join(
    __dirname,
    "..",
    "indexer",
    UNCOMPRESSED_SUBTITLES_FOLDER_NAME,
    subtitleFileNameWithoutExtension,
  );

  return { subtitleCompressedAbsolutePath, extractedSubtitlePath };
}

async function uncompressSubtitle({
  subtitle,
  fromRoute,
  toRoute,
}: {
  subtitle: SubtitleWithResolutionAndTorrentId;
  fromRoute: string;
  toRoute: string;
}): Promise<void> {
  const { fileExtension, subtitleLink, subtitleSrtFileName } = subtitle;

  fs.mkdirSync(toRoute, { recursive: true });

  await match(fileExtension)
    .with("rar", async () => {
      await unrar(fromRoute, toRoute);
    })
    .with("zip", async () => {
      await extract(fromRoute, { dir: toRoute });
    })
    .with("srt", async () => {
      await download(subtitleLink, toRoute, {
        filename: subtitleSrtFileName,
      });
    })
    .exhaustive();
}

const uploadSupabaseSchema = z.object({
  fullPath: z.string(),
});

function getSubtitleInitialPath({
  subtitle,
  extractedSubtitlePath,
}: {
  subtitle: SubtitleWithResolutionAndTorrentId;
  extractedSubtitlePath: string;
}): string {
  const { fileExtension, subtitleFileNameWithoutExtension, subtitleSrtFileName } = subtitle;

  const files = fs.readdirSync(extractedSubtitlePath, { withFileTypes: true });
  const hasFolders = files.some((file) => file.isDirectory());

  if (hasFolders) {
    const moveFilesToRoot = (dir: string) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      items.forEach((item) => {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          moveFilesToRoot(fullPath);
          fs.rmdirSync(fullPath);
        } else {
          const newPath = path.join(extractedSubtitlePath, item.name);
          if (fullPath !== newPath) {
            fs.renameSync(fullPath, newPath);
          }
        }
      });
    };

    moveFilesToRoot(extractedSubtitlePath);
  }

  if (["rar", "zip"].includes(fileExtension)) {
    const extractedSubtitleFiles = fs.readdirSync(extractedSubtitlePath);

    const srtFilesBySize = extractedSubtitleFiles.sort((a, b) => {
      const aSize = fs.statSync(path.join(extractedSubtitlePath, a)).size;
      const bSize = fs.statSync(path.join(extractedSubtitlePath, b)).size;

      return bSize - aSize;
    });

    const srtFile = srtFilesBySize.find((file) => path.extname(file).toLowerCase() === ".srt");
    invariant(srtFile, "SRT file not found");

    const extractedSrtFileNamePath = path.join(
      __dirname,
      "..",
      "indexer",
      UNCOMPRESSED_SUBTITLES_FOLDER_NAME,
      subtitleFileNameWithoutExtension,
      srtFile,
    );

    return extractedSrtFileNamePath;
  }

  if (fileExtension === "srt") {
    const srtFileNamePath = path.join(
      __dirname,
      "..",
      "indexer",
      UNCOMPRESSED_SUBTITLES_FOLDER_NAME,
      subtitleFileNameWithoutExtension,
      subtitleSrtFileName,
    );

    return srtFileNamePath;
  }

  throw new Error("No se encontró el archivo de subtítulo");
}

function readSubtitleFile(path: string): Buffer {
  const subtitleFileToUpload = fs.readFileSync(path);

  const bufferSchema = z.instanceof(Buffer);
  const subtitleFileToUploadBuffer = bufferSchema.parse(subtitleFileToUpload);

  return subtitleFileToUploadBuffer;
}

async function storeSubtitleInSupabaseStorage({
  subtitle,
  subtitleFileToUpload,
}: {
  subtitle: SubtitleWithResolutionAndTorrentId;
  subtitleFileToUpload: Buffer;
}): Promise<string> {
  const { subtitleSrtFileName } = subtitle;

  const { data } = await supabase.storage.from("subtitles").upload(subtitleSrtFileName, subtitleFileToUpload, {
    upsert: true,
    cacheControl: "31536000",
    contentType: "text/plain; charset=UTF-8",
  });

  const { fullPath } = uploadSupabaseSchema.parse(data);

  return fullPath;
}

function getSupabaseSubtitleLink({
  fullPath,
  subtitle,
}: {
  fullPath: string;
  subtitle: SubtitleWithResolutionAndTorrentId;
}): string {
  const { downloadFileName } = subtitle;
  const publicUrlGenerated = `${process.env.SUPABASE_BASE_URL}/storage/v1/object/public/${fullPath}?download=`;

  return `${publicUrlGenerated}${downloadFileName}`;
}

async function storeTitleInSupabaseTable(title: TitleWithEpisode): Promise<number> {
  const { episode, ...rest } = title;

  const { data } = await supabase.from("Titles").select("id").match({ imdb_id: title.imdb_id }).single();

  if (data) {
    await supabase.from("Titles").upsert({
      ...rest,
      id: data.id,
      slug: getTitleSlugifiedName(title.title_name, title.year),
      title_name_without_special_chars: getStringWithoutSpecialCharacters(title.title_name),
    });

    return data.id;
  }

  const [posterThumbhash, backdropThumbhash] = await Promise.all([
    title.poster ? encodeImageToThumbhash(title.poster) : null,
    title.backdrop ? encodeImageToThumbhash(title.backdrop) : null,
  ]);

  const { data: titleData } = await supabase
    .from("Titles")
    .upsert({
      ...rest,
      optimized_logo: title.logo,
      optimized_poster: title.poster,
      optimized_backdrop: title.backdrop,
      poster_thumbhash: posterThumbhash,
      backdrop_thumbhash: backdropThumbhash,
      slug: getTitleSlugifiedName(title.title_name, title.year),
      title_name_without_special_chars: getStringWithoutSpecialCharacters(title.title_name),
    })
    .select("id")
    .single();

  return titleData?.id ?? 0;
}

async function storeTitleGenresInSupabaseTable(titleId: number, genres: number[]): Promise<void> {
  for await (const genreId of genres) {
    const { data } = await supabase
      .from("TitleGenres")
      .select("id")
      .match({
        title_id: titleId,
        genre_id: genreId,
      })
      .single();

    if (data?.id) {
      continue;
    }

    await supabase.from("TitleGenres").insert({
      title_id: titleId,
      genre_id: genreId,
    });
  }
}

async function storeSubtitleInSupabaseTable({
  indexedBy,
  title,
  titleFile,
  subtitle,
  isValid,
  author,
  subtitleLink,
  subtitleGroups,
  releaseGroups,
  subtitleGroupName,
  releaseGroupName,
  bytesFromNotFoundSubtitle,
  titleFileNameFromNotFoundSubtitle,
}: {
  indexedBy: IndexedBy;
  title: TitleWithEpisode;
  titleFile: TitleFile;
  subtitle: SubtitleWithResolutionAndTorrentId;
  isValid: boolean;
  author: string | null;
  subtitleLink: string;
  subtitleGroups: SubtitleGroupMap;
  releaseGroups: ReleaseGroupMap;
  subtitleGroupName: SubtitleGroupNames;
  releaseGroupName: ReleaseGroupNames;
  bytesFromNotFoundSubtitle?: number;
  titleFileNameFromNotFoundSubtitle?: string;
}): Promise<void> {
  const { lang, downloadFileName, resolution, torrentId, ripType, externalId } = subtitle;

  const { id: subtitleGroupId } = subtitleGroups[subtitleGroupName];
  const { id: releaseGroupId } = releaseGroups[releaseGroupName];

  const { bytes, fileName, fileNameExtension } = titleFile;
  const { current_season, current_episode } = getSeasonAndEpisode(title.episode);

  const { subtitleSrtFileName } = subtitle;

  // Remove existing subtitle from database if it exists
  const { data: existingSubtitle } = await supabase
    .from("Subtitles")
    .select("id, release_group_id")
    .match({ title_file_name: fileName })
    .single();

  if (existingSubtitle?.id && existingSubtitle.release_group_id !== releaseGroupId) {
    await supabase.from("Subtitles").delete().match({ id: existingSubtitle.id });

    console.log(`Removed existing subtitle with ID ${existingSubtitle.id} for ${fileName}`);

    // Remove existing subtitle file from storage if it exists
    if (subtitleSrtFileName) {
      const { error: storageError } = await supabase.storage.from("subtitles").remove([subtitleSrtFileName]);

      if (!storageError) {
        console.log(`Removed existing subtitle file: ${subtitleSrtFileName}`);
      }
    }
  }

  const { error } = await supabase.from("Subtitles").insert({
    lang,
    author,
    title_slug: getTitleSlugifiedName(title.title_name, title.year),
    rip_type: ripType,
    is_valid: isValid,
    reviewed: true,
    uploaded_by: indexedBy,
    bytes,
    torrent_id: torrentId,
    external_id: externalId,
    file_extension: fileNameExtension,
    title_file_name: fileName,
    subtitle_file_name: downloadFileName,
    release_group_id: releaseGroupId,
    resolution,
    subtitle_group_id: subtitleGroupId,
    subtitle_link: subtitleLink,
    current_season,
    current_episode,
  });

  if (
    titleFileNameFromNotFoundSubtitle &&
    typeof bytesFromNotFoundSubtitle === "number" &&
    fileName !== titleFileNameFromNotFoundSubtitle
  ) {
    const { error } = await supabase.from("Subtitles").insert({
      lang,
      author,
      rip_type: ripType,
      is_valid: isValid,
      reviewed: true,
      uploaded_by: indexedBy,
      bytes: bytesFromNotFoundSubtitle,
      title_slug: getTitleSlugifiedName(title.title_name, title.year),
      torrent_id: torrentId,
      external_id: externalId,
      file_extension: fileNameExtension,
      title_file_name: titleFileNameFromNotFoundSubtitle,
      subtitle_file_name: downloadFileName,
      release_group_id: releaseGroupId,
      resolution,
      subtitle_group_id: subtitleGroupId,
      subtitle_link: subtitleLink,
      current_season,
      current_episode,
    });

    if (error) {
      console.log("\n Error al guardar el subtítulo en la base de datos", error);
      throw error;
    }
  }

  if (error) {
    console.log("\n Error al guardar el subtítulo en la base de datos", error);
    throw error;
  }
}

function parseTorrentTrackerId(trackerId: string): string {
  return trackerId.slice(0, 60).toLowerCase();
}

async function storeTorrentInSupabaseTable(torrent: TorrentFoundWithId): Promise<void> {
  const { id, title, formattedBytes, bytes, seeds, tracker, trackerId } = torrent;

  const { error } = await supabase.from("Torrents").upsert({
    id,
    torrent_name: title,
    torrent_bytes: bytes,
    torrent_size: formattedBytes,
    torrent_seeds: seeds,
    torrent_tracker: tracker,
    torrent_link: parseTorrentTrackerId(trackerId),
  });

  if (error) {
    console.log("\n Error al guardar el torrent en la base de datos", error);
    throw error;
  }
}

function removeSubtitlesFromFileSystem(paths: string[]): void {
  for (const path of paths) {
    fs.promises.rm(path, { recursive: true, force: true });
  }
}

function modifySecondsInTimestamp(timestamp: string, secondsToModify: number): string {
  const [time] = timestamp.split(",");
  let [hours, minutes, seconds] = time.split(":").map(Number);

  seconds += secondsToModify;

  if (seconds < 0) {
    const totalMinutes = Math.ceil(Math.abs(seconds) / 60);
    minutes -= totalMinutes;
    seconds += totalMinutes * 60;
  }

  if (seconds >= 60) {
    minutes += Math.floor(seconds / 60);
    seconds %= 60;
  }

  if (minutes < 0) {
    const totalHours = Math.ceil(Math.abs(minutes) / 60);
    hours -= totalHours;
    minutes += totalHours * 60;
  }

  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes %= 60;
  }

  if (hours < 0) {
    hours = (hours + 24) % 24;
  }

  if (hours >= 24) {
    hours %= 24;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},000`;
}

async function addWatermarkToSubtitle({
  path,
  titleType,
  subtitleId,
  subtitleGroupName,
}: {
  path: string;
  subtitleId: string | null;
  titleType: TitleTypes;
  subtitleGroupName: SubtitleGroupNames;
}): Promise<void> {
  const subtitleBuffer = await fs.promises.readFile(path);

  const { encoding } = jschardet.detect(subtitleBuffer);
  const encodingLowerCased = encoding.toLowerCase();

  let parsedEncoding = ["windows-1251", "windows-1252"].includes(encodingLowerCased)
    ? "iso-8859-1"
    : encodingLowerCased;

  let subtitleText = "";
  let providerSubtitleLink = "";

  if (subtitleGroupName === "SubDivX") {
    providerSubtitleLink = `https://www.subdivx.com/${subtitleId}`;
  }

  if (subtitleGroupName === "SUBDL") {
    providerSubtitleLink = `https://subdl.com/s/info/${subtitleId}`;
  }

  if (subtitleGroupName === "OpenSubtitles") {
    providerSubtitleLink = `https://www.opensubtitles.com/en/subtitles/legacy/${subtitleId}`;
  }

  if (["utf-16le"].includes(parsedEncoding)) {
    parsedEncoding = "utf-16";
  }

  try {
    if (parsedEncoding === "koi8-r") {
      subtitleText = decodeWindows1252(subtitleBuffer);
    } else {
      subtitleText = new TextDecoder(parsedEncoding).decode(subtitleBuffer);
    }
  } catch (error) {
    subtitleText = decode(subtitleBuffer, parsedEncoding);
    console.log("\n ~ addWatermarkToSubtitle ~ error:", error);
  }

  const splitter = match(subtitleGroupName)
    .with("SubDivX", () => /\r\n\r\n/)
    .with("SUBDL", () => /\n\n/)
    .with("OpenSubtitles", () => /\n\n/)
    .run();

  const subtitleSplitted = subtitleText.trimEnd().split(splitter);

  const subtitleTextWithWatermark = match(titleType)
    .with(TitleTypes.movie, () => {
      const firstSubtitle = subtitleSplitted.at(0) as string;
      const lastSubtitle = subtitleSplitted.at(-1) as string;

      const [_firstSubtitleId, firstTimestamp] = firstSubtitle.split("\n");
      const firstSubtitleTimestamp = firstTimestamp.split(" ").at(0) as string;

      const [lastId, lastTimestamp] = lastSubtitle.split("\n");

      const lastSubtitleId = Number(lastId);
      const watermarkNextId = lastSubtitleId + 1;

      const lastSubtitleTimestamp = lastTimestamp.split(" ").at(-1) as string;
      const extraWatermarkTimestamp = modifySecondsInTimestamp(lastSubtitleTimestamp, 6);

      const MAX_WATERMARK_TIME = "00:00:24,000";

      const [firstHours, firstMinutes, firstSecondsAndMs] = firstSubtitleTimestamp.split(":");
      const [firstSeconds, firstMs] = firstSecondsAndMs.split(",");

      const [maxHours, maxMinutes, maxSecondsAndMs] = MAX_WATERMARK_TIME.split(":");
      const [maxSeconds, maxMs] = maxSecondsAndMs.split(",");

      const firstTimestampMs =
        Number(firstHours) * 3600000 + Number(firstMinutes) * 60000 + Number(firstSeconds) * 1000 + Number(firstMs);

      const maxTimestampMs =
        Number(maxHours) * 3600000 + Number(maxMinutes) * 60000 + Number(maxSeconds) * 1000 + Number(maxMs);

      const watermarkStartTimestamp = firstTimestampMs > maxTimestampMs ? MAX_WATERMARK_TIME : firstSubtitleTimestamp;

      return `0
00:00:00,000 --> ${watermarkStartTimestamp}
Subtitulos por <b>Subtis</b> - <i>@subt_is</i>
Encontranos en la web https://subtis.io

${subtitleText}

${watermarkNextId}
${lastSubtitleTimestamp} --> ${extraWatermarkTimestamp}
Fuente del subtítulo: ${subtitleGroupName}
${subtitleId ? `Link: ${providerSubtitleLink}` : ""}
ID: ${subtitleId}
`;
    })
    .with(TitleTypes.tvShow, () => {
      let lastSubtitle = subtitleSplitted.at(-1) as string;

      if (lastSubtitle.includes("9999") || lastSubtitle.includes("www.subdivx.com")) {
        lastSubtitle = subtitleSplitted.at(-2) as string;
      }

      const [id, timestamp] = lastSubtitle.split("\n");

      const lastSubtitleId = Number(id);
      const lastSubtitleTimestamp = timestamp.split(" ").at(-1) as string;

      const watermarkNextId = lastSubtitleId + 1;

      const firstTimestamp = modifySecondsInTimestamp(lastSubtitleTimestamp, 2);
      const secondTimestamp = modifySecondsInTimestamp(lastSubtitleTimestamp, 4);
      const thirdTimestamp = modifySecondsInTimestamp(secondTimestamp, 6);

      return `${subtitleText}
${watermarkNextId}
${firstTimestamp} --> ${secondTimestamp}
Subtitulos por <b>Subtis</b> - <i>@subt_is</i>
Encontranos en la web https://subtis.io

${watermarkNextId + 1}
${secondTimestamp} --> ${thirdTimestamp}
Fuente del subtítulo: ${subtitleGroupName}
Link: ${providerSubtitleLink}
ID: ${subtitleId}
`;
    })
    .run();

  await fs.promises.writeFile(path, subtitleTextWithWatermark, "utf-8");
}

function isValidSrt(srt: string): boolean {
  const srtValidatorErrors = srtValidator(srt);
  return srtValidatorErrors.length === 0;
}

async function generateSpecValidSrt(srt: string, path: string): Promise<boolean> {
  const parser = new srtParser2();
  const srtArray = parser.fromSrt(srt);

  const parsedSrtArray = srtArray.map((item, index) => ({
    ...item,
    id: index === 0 || index === 1 ? String(Number(item.id) + 1) : String(Number(item.id) + 2),
  }));
  const srtString = parser.toSrt(parsedSrtArray);

  await fs.promises.writeFile(path, srtString, "utf-8");

  return isValidSrt(srtString);
}

// async function purgeCloudflareCache(files: string[]) {
//   const zoneId = process.env.CLOUDFLARE_ZONE_ID;
//   const apiToken = process.env.CLOUDFLARE_API_TOKEN;

//   const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${apiToken}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ files }),
//   });
//   console.log("\n ~ purgeCloudflareCache ~ response:", response.status);

//   if (!response.ok) {
//     const errorData = await response.json();
//     console.error("Failed to purge cache:", errorData);
//     // throw new Error("Cache purge failed");
//   }

//   console.log("Cache purged successfully!");
// }

type TitleGenres = number[];

export async function downloadAndStoreTitleAndSubtitle(data: {
  indexedBy: IndexedBy;
  titleFile: TitleFile;
  titleType: TitleTypes;
  titleGenres: TitleGenres;
  title: TitleWithEpisode;
  torrent: TorrentFoundWithId;
  releaseGroups: ReleaseGroupMap;
  subtitleGroups: SubtitleGroupMap;
  subtitle: SubtitleWithResolutionAndTorrentId;
  releaseGroupName: ReleaseGroupNames;
  subtitleGroupName: SubtitleGroupNames;
  bytesFromNotFoundSubtitle?: number;
  titleFileNameFromNotFoundSubtitle?: string;
}): Promise<void> {
  try {
    const {
      indexedBy,
      title,
      titleGenres,
      titleType,
      titleFile,
      subtitle,
      torrent,
      releaseGroups,
      subtitleGroups,
      releaseGroupName,
      subtitleGroupName,
      bytesFromNotFoundSubtitle,
      titleFileNameFromNotFoundSubtitle,
    } = data;

    await downloadSubtitle(subtitle);

    const { subtitleCompressedAbsolutePath, extractedSubtitlePath } = getSubtitleAbsolutePaths(subtitle);
    await uncompressSubtitle({
      subtitle,
      fromRoute: subtitleCompressedAbsolutePath,
      toRoute: extractedSubtitlePath,
    });

    const path = getSubtitleInitialPath({ subtitle, extractedSubtitlePath });
    await addWatermarkToSubtitle({
      path,
      subtitleGroupName,
      subtitleId: subtitle.externalId,
      titleType,
    });

    const subtitleFileToUpload = readSubtitleFile(path);
    const author = getSubtitleAuthor(subtitleFileToUpload);

    const srtOriginalString = subtitleFileToUpload.toString();
    const isValid = await generateSpecValidSrt(srtOriginalString, path);
    const validSrtFileToUpload = readSubtitleFile(path);

    const fullPath = await storeSubtitleInSupabaseStorage({
      subtitle,
      subtitleFileToUpload: validSrtFileToUpload,
    });
    removeSubtitlesFromFileSystem([subtitleCompressedAbsolutePath, extractedSubtitlePath]);
    const subtitleLink = getSupabaseSubtitleLink({ fullPath, subtitle });

    await storeTorrentInSupabaseTable(torrent);
    const titleId = await storeTitleInSupabaseTable(title);
    await storeTitleGenresInSupabaseTable(titleId, titleGenres);

    await storeSubtitleInSupabaseTable({
      indexedBy,
      title,
      titleFile,
      subtitle,
      isValid,
      author,
      subtitleLink,
      subtitleGroups,
      releaseGroups,
      subtitleGroupName,
      releaseGroupName,
      bytesFromNotFoundSubtitle,
      titleFileNameFromNotFoundSubtitle,
    });

    // const { current_season, current_episode } = getSeasonAndEpisode(title.episode);

    // if (titleType === TitleTypes.movie) {
    //   await purgeCloudflareCache([`https://api.subt.is/v1/subtitles/movie/${title.imdb_id}`]);
    // }

    // if (titleType === TitleTypes.tvShow) {
    //   await purgeCloudflareCache([
    //     `https://api.subt.is/v1/subtitles/tv-show/${title.imdb_id}`,
    //     `https://api.subt.is/v1/subtitles/tv-show/${title.imdb_id}/${current_season}/${current_episode}`,
    //     `https://api.subt.is/v1/subtitles/tv-show/download/metadata/${title.imdb_id}/${current_season}`,
    //     `https://api.subt.is/v1/subtitles/tv-show/download/season/${title.imdb_id}/${current_season}/${subtitle.resolution}/${releaseGroups[releaseGroupName].id}`,
    //   ]);
    // }

    console.log("\n✅ Subtítulo guardado en la base de datos!\n");

    console.table([
      {
        imdbLink: getImdbLink(title.imdb_id),
        name: title.title_name,
        releaseGroupName,
        resolution: subtitle.resolution,
        subtitleGroupName,
        subtitleLink: `${subtitle.subtitleLink.slice(0, 100)}...`,
      },
    ]);
  } catch (error) {
    console.log("\n ~ error:", error);
    console.log("\n ~ error message:", error instanceof Error ? error.message : "");
  }
}

// -------------------------------------------------------------------------------------------------------------------------------

// helpers
function createInitialFolders(): void {
  const FOLDERS = [UNCOMPRESSED_SUBTITLES_FOLDER_NAME, COMPRESSED_SUBTITLES_FOLDER_NAME];

  for (const folder of FOLDERS) {
    const folderPath = path.join(__dirname, "..", "indexer", folder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  }
}

export type TorrentFound = {
  tracker: string;
  title: string;
  size: string | number;
  trackerId: string;
  seeds: number;
  isBytesFormatted: boolean;
};
export type TorrentFoundWithVideoFile = TorrentFound & {
  videoFile: VideoFile | undefined;
};
export type TorrentFoundWithId = TorrentFound & {
  id: number;
  formattedBytes: string;
  bytes: number;
};
export type TorrentFoundWithVideoFileAndId = TorrentFoundWithVideoFile & {
  id: number;
  formattedBytes: string;
  bytes: number;
};

export async function getFileTitleTorrents(
  query: string,
  titleType: TitleTypes,
  imdbId: string,
): Promise<TorrentFound[]> {
  await tg.activate("ThePirateBay");
  TorrentSearchApi.enableProvider("1337x");

  let ytsTorrents: TorrentFound[] = [];
  if (query.includes("YTS")) {
    try {
      ytsTorrents = await getYtsTorrents(imdbId);
    } catch (error) {
      console.log("Error on getTitleTorrents using YTS API");
      console.log(error);
    }
  }

  let thePirateBayTorrents: TorrentFound[] = [];
  try {
    const thePirateBayResult = await tg.search(query, {
      groupByTracker: false,
    });
    const thePirateBayTorrentsRaw =
      thePirateBayResult instanceof Map
        ? thePirateBayResult.get("ThePirateBay")
        : Array.isArray(thePirateBayResult)
          ? thePirateBayResult
          : [];

    // @ts-ignore
    thePirateBayTorrents = thePirateBayTorrentsRaw.map((torrent) => ({
      ...torrent,
      isBytesFormatted: false,
    })) as TorrentFound[];
  } catch (error) {
    const parsedError = error as Error;
    if (!parsedError.message.includes("arr[0].tracker")) {
      console.log("Error on getTitleTorrents using tg.search interface");
      console.log(error);
    }
  }

  const torrentSearchApiCategory = titleType === TitleTypes.tvShow ? "TV" : "Movies";
  let torrents1337xWithMagnet: TorrentFound[] = [];

  try {
    const torrents1337x = await TorrentSearchApi.search(query, torrentSearchApiCategory, 15);
    type TorrentSearchApiExteneded = TorrentSearchApi.Torrent & {
      seeds: number;
    };

    torrents1337xWithMagnet = await Promise.all(
      torrents1337x.map(async (torrent) => {
        const torrent1337x = torrent as TorrentSearchApiExteneded;
        const trackerId = await TorrentSearchApi.getMagnet(torrent);
        return {
          tracker: torrent1337x.provider,
          title: torrent1337x.title,
          size: torrent1337x.size,
          seeds: torrent1337x.seeds,
          trackerId,
          isBytesFormatted: true,
        };
      }),
    );
  } catch (error) {
    console.log("Error on getTitleTorrents using TorrentSearchApi.search interface");
    console.log(error);
  }

  return [...torrents1337xWithMagnet, ...thePirateBayTorrents, ...ytsTorrents].flat();
}

export async function getTitleTorrents(query: string, titleType: TitleTypes, imdbId: string): Promise<TorrentFound[]> {
  await tg.activate("ThePirateBay");
  TorrentSearchApi.enableProvider("1337x");

  let thePirateBayTorrents: TorrentFound[] = [];

  try {
    const thePirateBayResult = await tg.search(query, {
      groupByTracker: false,
    });
    const thePirateBayTorrentsRaw =
      thePirateBayResult instanceof Map
        ? thePirateBayResult.get("ThePirateBay")
        : Array.isArray(thePirateBayResult)
          ? thePirateBayResult
          : [];

    // @ts-ignore
    thePirateBayTorrents = thePirateBayTorrentsRaw.map((torrent) => ({
      ...torrent,
      isBytesFormatted: false,
    })) as TorrentFound[];
  } catch (error) {
    const parsedError = error as Error;
    if (!parsedError.message.includes("arr[0].tracker")) {
      console.log("Error on getTitleTorrents using tg.search interface");
      console.log(error);
    }
  }
  const torrentSearchApiCategory = titleType === TitleTypes.tvShow ? "TV" : "Movies";

  let torrents1337xWithMagnet: TorrentFound[] = [];

  try {
    const torrents1337x = await TorrentSearchApi.search(query, torrentSearchApiCategory, 15);
    type TorrentSearchApiExteneded = TorrentSearchApi.Torrent & {
      seeds: number;
    };

    torrents1337xWithMagnet = await Promise.all(
      torrents1337x.map(async (torrent) => {
        const torrent1337x = torrent as TorrentSearchApiExteneded;
        const trackerId = await TorrentSearchApi.getMagnet(torrent);
        return {
          tracker: torrent1337x.provider,
          title: torrent1337x.title,
          size: torrent1337x.size,
          seeds: torrent1337x.seeds,
          trackerId,
          isBytesFormatted: true,
        };
      }),
    );
  } catch (error) {
    console.log("Error on getTitleTorrents using TorrentSearchApi.search interface");
    console.log(error);
  }

  if (titleType === TitleTypes.tvShow) {
    return [...torrents1337xWithMagnet, ...thePirateBayTorrents];
  }

  let ytsTorrents: TorrentFound[] = [];

  try {
    ytsTorrents = await getYtsTorrents(imdbId);
  } catch (error) {
    console.log("Error on getTitleTorrents using YTS API");
    console.log(error);
  }

  return [...ytsTorrents, ...torrents1337xWithMagnet, ...thePirateBayTorrents].flat();
}

function getFilteredTorrents(
  torrents: TorrentFound[],
  name: string,
  maxTorrents: number,
  shouldSort: boolean,
): TorrentFoundWithId[] {
  const MIN_SEEDS = 8;
  // const seenSizes = new Set<string | number>();

  const result = torrents
    .slice(0, maxTorrents)
    .sort((torrentA, torrentB) => torrentB.seeds - torrentA.seeds)
    .filter((torrent) => {
      const parsedTorrentTitle = getStringWithoutSpecialCharacters(torrent.title);
      const parsedName = getStringWithoutSpecialCharacters(name);

      return parsedTorrentTitle.startsWith(parsedName);
    })
    .filter((torrent) => !getIsCinemaRecording(torrent.title))
    .filter(({ seeds }) => seeds >= MIN_SEEDS)
    .filter(({ size, isBytesFormatted }) => {
      const bytes = isBytesFormatted ? filesizeParser((size as string).replaceAll(",", "")) : (size as number);

      return bytes > MIN_BYTES;
    })
    // .filter((torrent) => {
    //   if (seenSizes.has(torrent.size)) {
    //     return false;
    //   }

    //   seenSizes.add(torrent.size);

    //   return true;
    // })
    .filter((torrent) => {
      const pornRegex = /\b(xxx|porn|adult|sex|erotic|brazzers|bangbros|naughty|playboy)\b/i;
      const isPorn = pornRegex.test(torrent.title);

      const WHITELISTED_MOVIES_TITLES = [
        "xXx: Return of Xander Cage (2017) [720p] [YTS] [YIFY]",
        "xXx: Return of Xander Cage (2017) [1080p] [YTS] [YIFY]",
        "xXx (2002) 720p BrRip x264 - YIFY",
        "xXx (2002) 1080p BrRip x264 - YIFY",
        "xXx (2002) [1080p] [x264] [5.1] YTS",
      ];
      const isWhitelisted = WHITELISTED_MOVIES_TITLES.includes(torrent.title);

      if (isWhitelisted) {
        console.log("\n Torrent whitelisted:", torrent.title);
        return true;
      }

      if (isPorn) {
        console.log("Porn torrent found!", torrent.title);
      }

      return !isPorn;
    })
    .map((torrent) => {
      const bytes = torrent.isBytesFormatted
        ? filesizeParser((torrent.size as string).replaceAll(",", ""))
        : (torrent.size as number);

      const formattedBytes = prettyBytes(bytes);

      return {
        ...torrent,
        id: generateIdFromMagnet(torrent.trackerId),
        bytes,
        formattedBytes,
      };
    });

  return shouldSort
    ? result.toSorted((torrentA, torrentB) => {
        if (torrentA.tracker === "YTS" && torrentB.tracker !== "YTS") return -1;
        if (torrentA.tracker !== "YTS" && torrentB.tracker === "YTS") return 1;

        return torrentB.seeds - torrentA.seeds;
      })
    : result;
}

function getSpecificTorrents(
  torrents: TorrentFoundWithId[],
  titleName: string,
  titleFileNameFromNotFoundSubtitle: string | undefined,
): TorrentFoundWithId[] {
  const parsedTitleName = getStringWithoutSpecialCharacters(titleName).trim();

  const torrentsForTitle = torrents.filter((torrent) => {
    const { title } = torrent;
    const lowerCaseTitle = title.toLowerCase();
    const parsedTorrentTitle = /\s/.test(lowerCaseTitle) ? lowerCaseTitle : lowerCaseTitle.replaceAll(".", " ");

    const [firstPart] = parsedTorrentTitle.split("(")[0].trim();

    return (
      parsedTorrentTitle.includes(parsedTitleName) ||
      parsedTorrentTitle.startsWith(titleName.toLowerCase()) ||
      parsedTitleName.startsWith(firstPart)
    );
  });

  const torrentsForTitleFileName = torrentsForTitle.filter((torrent) => {
    if (titleFileNameFromNotFoundSubtitle) {
      const torrentTitle = torrent.title.toLowerCase();
      const fileNameWithoutExtension = getTitleFileNameWithoutExtension(titleFileNameFromNotFoundSubtitle);

      return (
        torrentTitle === titleFileNameFromNotFoundSubtitle.toLowerCase() ||
        torrentTitle === fileNameWithoutExtension.toLowerCase()
      );
    }

    return true;
  });

  if (torrentsForTitleFileName.length > 0) {
    return torrentsForTitleFileName
      .toSorted((torrentA, torrentB) => {
        return torrentB.seeds - torrentA.seeds;
      })
      .slice(0, MAX_TORRENTS);
  }

  return torrentsForTitle
    .toSorted((torrentA, torrentB) => {
      return torrentB.seeds - torrentA.seeds;
    })
    .slice(0, MAX_TORRENTS);
}

type VideoFile = {
  name: string;
  length: number;
  resolution: string | null;
};

export async function getTorrentVideoFileMetadata(torrent: TorrentFound): Promise<VideoFile> {
  const trackers = match(torrent.tracker)
    .with("1337x", () => [])
    .with("ThePirateBay", () => [])
    .with("YTS", () => YTS_TRACKERS)
    .run();

  const parsedTrackerId = encodeURI(
    decodeURI(torrent.trackerId)
      .split("&")
      .filter((url) => {
        const port = Number(url.match(/(?<=:)\d+(?=\/)/)?.[0] ?? "1");
        return port > 0 && port < 65536;
      })
      .join("&"),
  );

  const engine = torrentStream(parsedTrackerId, {
    trackers,
  });

  const videoFile = await new Promise<VideoFile>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      engine.destroy();
      reject(
        new Error(
          `Timeout: Tardo más de ${MAX_TIMEOUT / 1000} segundos, puede ser por falta de seeds. Seeds totales: ${torrent.seeds}`,
        ),
      );
    }, MAX_TIMEOUT);

    engine.on("ready", async () => {
      const videoFile = getVideoFromFiles((engine as unknown as { files: File[] }).files);

      if (videoFile && !videoFile.name.match(RESOLUTION_REGEX)) {
        const FOUR_MEGABYTES = 4 * 1024 * 1024;

        const stream = videoFile.createReadStream({
          start: 0,
          end: FOUR_MEGABYTES,
        });

        const tempFilePath = path.join(__dirname, "..", "indexer", `temp-${videoFile.name}`);
        const writeStream = fs.createWriteStream(tempFilePath);

        stream.pipe(writeStream);

        await new Promise(() => {
          stream.on("end", async () => {
            try {
              const info = await ffprobe(tempFilePath, {
                path: ffprobeStatic.path,
              });
              const [firstStream] = info.streams;

              let resolution = "";

              if (firstStream.width === 854 || firstStream.height === 480) {
                resolution = "480";
              }

              if (firstStream.width === 720 || firstStream.height === 720) {
                resolution = "720";
              }

              if (firstStream.width === 1920 || firstStream.height === 1080) {
                resolution = "1080";
              }

              if (firstStream.width === 2560 || firstStream.height === 1440) {
                resolution = "1440";
              }

              if (firstStream.width === 3840 || firstStream.width === 4096 || firstStream.height === 1440) {
                resolution = "2160";
              }

              await fs.promises.rm(tempFilePath, {
                recursive: true,
                force: true,
              });

              clearTimeout(timeoutId);
              resolve({
                name: videoFile.name,
                length: videoFile.length,
                resolution,
              });
            } catch (error) {
              reject(error);
            } finally {
              await fs.promises.rm(tempFilePath, {
                recursive: true,
                force: true,
              });
            }
          });
        });
      }

      if (videoFile) {
        clearTimeout(timeoutId);
        resolve({
          name: videoFile.name,
          length: videoFile.length,
          resolution: null,
        });
      }
    });
  });

  engine.destroy();

  return videoFile;
}

export function getVideoFromFiles(files: File[]): File | undefined {
  return files
    .toSorted((fileA, fileB) => fileB.length - fileA.length)
    .find((file) => {
      return VIDEO_FILE_EXTENSIONS.some((videoFileExtension) => {
        return file.name.endsWith(videoFileExtension);
      });
    });
}

async function hasSubDivXSubtitleInDatabase(title_file_name: string): Promise<boolean> {
  const { data: subtitle } = await supabase
    .from("Subtitles")
    .select("id")
    .match({
      title_file_name,
      subtitle_group_id: 1,
    })
    .single();

  return Boolean(subtitle);
}

async function hasSubDlSubtitleInDatabase(title_file_name: string): Promise<boolean> {
  const { data: subtitle } = await supabase
    .from("Subtitles")
    .select("id")
    .match({
      title_file_name,
      subtitle_group_id: 2,
    })
    .single();

  return Boolean(subtitle);
}

type SubtitleProvider = "subdivx" | "subdl" | "openSubtitles";

async function getAllSubtitlesFromProviders({
  imdbId,
  titleType,
  providers,
  currentSeason,
  currentEpisode,
  subdivxToken,
  subdivxCookie,
  subdivxParameter,
  titleProviderQuery,
}: {
  imdbId: string;
  titleType: TitleTypes;
  currentSeason: number | null;
  currentEpisode: number | null;
  subdivxToken: string;
  subdivxCookie: string | null;
  subdivxParameter: string;
  providers: SubtitleProvider[];
  titleProviderQuery: string;
}) {
  const providersGetters = [
    { getSubtitles: getSubtitlesFromSubDivXForTitle, provider: "subdivx" },
    { getSubtitles: getSubtitlesFromSubdl, provider: "subdl" },
    {
      getSubtitles: getSubtitlesFromOpenSubtitlesForTitle,
      provider: "openSubtitles",
    },
  ] as const;

  const filteredProviders = providersGetters.filter(({ provider }) => providers.includes(provider));

  const subtitles = await Promise.all(
    filteredProviders.map(async ({ getSubtitles, provider }) => {
      if (provider === "subdivx") {
        const results = await getSubtitles({
          imdbId,
          subdivxToken,
          subdivxCookie,
          subdivxParameter,
          titleProviderQuery,
        });

        return { provider, results };
      }

      if (provider === "subdl") {
        const results = await getSubtitles({
          imdbId,
          titleType,
          currentSeason,
          currentEpisode,
        });

        return { provider, results };
      }

      if (provider === "openSubtitles") {
        const results = await getSubtitles({
          imdbId,
          titleType,
          currentSeason,
          currentEpisode,
        });

        return { provider, results };
      }
    }),
  );

  return subtitles.reduce<{
    subdivx: SubDivXSubtitles | null;
    subdl: SubdlSubtitles | null;
    openSubtitles: OpenSubtitlesSubtitles | null;
  }>(
    (accumulator, subtitle) => {
      if (!subtitle) {
        return accumulator;
      }

      return { ...accumulator, [subtitle.provider]: subtitle.results };
    },
    { subdivx: null, subdl: null, openSubtitles: null },
  );
}

// core
export async function getSubtitlesForTitle({
  index,
  initialTorrents,
  currentTitle,
  releaseGroups,
  subtitleGroups,
  isDebugging,
  bytesFromNotFoundSubtitle,
  titleFileNameFromNotFoundSubtitle,
  shouldUseTryCatch,
  fromWebSocket,
  subdivxToken,
  subdivxCookie,
  indexedBy,
  subdivxParameter,
}: {
  index: string;
  initialTorrents?: TorrentFound[];
  currentTitle: CurrentTitle;
  releaseGroups: ReleaseGroupMap;
  subtitleGroups: SubtitleGroupMap;
  isDebugging: boolean;
  shouldUseTryCatch: boolean;
  bytesFromNotFoundSubtitle?: number;
  titleFileNameFromNotFoundSubtitle?: string;
  fromWebSocket?: boolean;
  subdivxToken: string;
  subdivxCookie: string | null;
  subdivxParameter: string;
  indexedBy: IndexedBy;
}): Promise<boolean> {
  const {
    name,
    year,
    logo,
    genres,
    imdbId,
    rating,
    japanaseName,
    releaseDate,
    poster,
    backdrop,
    episode,
    spanishName,
    overview,
    totalSeasons,
    totalEpisodes,
    runtime,
    certification,
  } = currentTitle;

  const titleType = episode ? TitleTypes.tvShow : TitleTypes.movie;
  const { current_season: currentSeason, current_episode: currentEpisode } = getSeasonAndEpisode(episode);

  createInitialFolders();
  const titleProviderQuery = getQueryForTorrentProvider(currentTitle);

  const torrents = initialTorrents ?? (await getTitleTorrents(titleProviderQuery, titleType, imdbId));
  console.log("\nTorrents without filter \n");
  console.table(torrents.map(({ title, size, seeds }) => ({ title, size, seeds })));

  const filteredTorrents = getFilteredTorrents(torrents, name, 40, !initialTorrents);

  console.log("\nFiltered torrents \n");
  console.table(filteredTorrents.map(({ title, size, seeds }) => ({ title, size, seeds })));

  const specificTorrents = getSpecificTorrents(filteredTorrents, name, titleFileNameFromNotFoundSubtitle);

  console.log("\nSpecific torrents \n");
  console.table(specificTorrents.map(({ title, size, seeds }) => ({ title, size, seeds })));

  if (specificTorrents.length === 0) {
    console.log(`4.${index}) No se encontraron torrents para el titulo "${name}" con query ${titleProviderQuery} \n`);
    return false;
  }

  console.log(
    `4.${index}) Torrents (${specificTorrents.length}) encontrados para el título "${name}" con query ${titleProviderQuery} \n`,
  );
  console.table(
    specificTorrents.map(({ seeds, title, tracker, formattedBytes }) => ({
      query: titleProviderQuery,
      seeds,
      size: formattedBytes,
      title,
      tracker,
    })),
  );

  const releaseGroupsqueryMatches = Object.values(releaseGroups)
    .flatMap(({ matches }) => matches)
    .map((queryMatch) => queryMatch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  const releaseGroupsRegex = new RegExp(`\\b(${releaseGroupsqueryMatches.join("|")})\\b`, "gi");
  const resolutionRegex = /(480p|576p|720p|1080p|1440p|2160p|4k|3d)/gi;

  const enabledProviders = ["subdivx", "subdl", "openSubtitles"] as SubtitleProvider[];
  // const enabledProviders = ["subdl"] as SubtitleProvider[];

  const subtitleProviderQuery = japanaseName
    ? getQueryForTorrentProvider({ ...currentTitle, name: japanaseName })
    : titleProviderQuery;

  const subtitles = await getAllSubtitlesFromProviders({
    imdbId,
    titleType,
    currentSeason,
    currentEpisode,
    subdivxToken,
    subdivxCookie,
    subdivxParameter,
    providers: enabledProviders,
    titleProviderQuery: subtitleProviderQuery,
  });

  if (subtitles.subdivx) {
    console.log(`4.${index}) ${subtitles.subdivx.aaData.length} subtitlos encontrados en SubDivX \n`);

    const subdivxTable = subtitles.subdivx.aaData.map(({ id, titulo, descripcion }) => {
      const ripTypes = descripcion.match(RIP_TYPES_REGEX)?.filter(Boolean);
      const resolutions = descripcion.match(resolutionRegex);
      const releaseGroups = descripcion.match(releaseGroupsRegex);

      return {
        id,
        title: titulo,
        ripTypes: ripTypes?.length ? [...new Set(ripTypes)] : "",
        resolutions: resolutions?.length ? [...new Set(resolutions)] : "",
        releaseGroups: releaseGroups?.length ? [...new Set(releaseGroups)] : "",
      };
    });

    console.table(subdivxTable);
    console.log("\n\n");
  }

  if (subtitles.subdl) {
    console.log(`4.${index}) ${subtitles.subdl.length} subtitlos encontrados en SubDL \n`);

    const subdlTable = subtitles.subdl.map(({ name, release_name, subtitleLink }) => {
      const subtitleId = subtitleLink.split(/\//gi)[2].split(".")[0];

      const ripTypes = release_name.match(RIP_TYPES_REGEX)?.filter(Boolean);
      const resolutions = release_name.match(resolutionRegex);
      const releaseGroups = release_name.match(releaseGroupsRegex);

      return {
        id: subtitleId,
        title: name,
        releaseName: release_name,
        ripTypes: ripTypes?.length ? [...new Set(ripTypes)] : "",
        resolutions: resolutions?.length ? [...new Set(resolutions)] : "",
        releaseGroups: releaseGroups?.length ? [...new Set(releaseGroups)] : "",
      };
    });

    console.table(subdlTable);
    console.log("\n\n");
  }

  if (subtitles.openSubtitles) {
    console.log(`4.${index}) ${subtitles.openSubtitles.data.length} subtitlos encontrados en OpenSubtitles \n`);

    const openSubtitlesTable = subtitles.openSubtitles.data.map(({ attributes, id }) => {
      const release = attributes.release.toLowerCase();
      const comments = attributes?.comments?.toLowerCase() ?? "";

      const ripTypes =
        release.match(RIP_TYPES_REGEX)?.filter(Boolean) || comments.match(RIP_TYPES_REGEX)?.filter(Boolean);
      const resolutions = release.match(resolutionRegex) || comments.match(resolutionRegex);
      const releaseGroups = release.match(releaseGroupsRegex) || comments.match(releaseGroupsRegex);

      return {
        id,
        title: attributes.feature_details.title,
        name: attributes.feature_details.movie_name,
        ripTypes: ripTypes?.length ? [...new Set(ripTypes)] : "",
        resolutions: resolutions?.length ? [...new Set(resolutions)] : "",
        releaseGroups: releaseGroups?.length ? [...new Set(releaseGroups)] : "",
      };
    });

    console.table(openSubtitlesTable);
    console.log("\n\n");
  }

  // --------------------------------------------

  let wsSubtitleHasBeenFound = false;

  for await (const [torrentIndex, torrent] of Object.entries(specificTorrents)) {
    console.log("\n\n\n\n");
    console.log("-------------------------------------------------------------------");

    if (titleFileNameFromNotFoundSubtitle && wsSubtitleHasBeenFound) {
      break;
    }

    const videoFile = await executeWithOptionalTryCatch(
      true,
      async function processTorrent() {
        return await getTorrentVideoFileMetadata(torrent);
      },
      `4.${index}.${torrentIndex}) No se encontraron archivos en el torrent\n`,
    );

    if (!videoFile) {
      continue;
    }

    if (titleFileNameFromNotFoundSubtitle) {
      const torrentVideoFileName = videoFile.name.toLowerCase().trim();
      const torrentTitle = torrent.title.toLowerCase().trim();

      const parsedTitleFileNameFromNotFoundSubtitle = titleFileNameFromNotFoundSubtitle.toLowerCase().trim();
      const fileNameWithoutExtension = getTitleFileNameWithoutExtension(parsedTitleFileNameFromNotFoundSubtitle);

      const spacedTitleFileNameFromNotFoundSubtitle = parsedTitleFileNameFromNotFoundSubtitle.replaceAll(".", " ");

      if (
        torrentVideoFileName !== parsedTitleFileNameFromNotFoundSubtitle &&
        torrentVideoFileName !== fileNameWithoutExtension &&
        torrentTitle !== parsedTitleFileNameFromNotFoundSubtitle &&
        torrentTitle !== spacedTitleFileNameFromNotFoundSubtitle
      ) {
        console.log(
          `4.${index}.${torrentIndex}) El nombre del archivo del torrent no coincide con el nombre del archivo del subtítulo, saltando...`,
        );
        continue;
      }
    }

    const { length: bytes, name: fileName, resolution: resolutionFromVideoFile } = videoFile;
    let titleFileNameMetadata: TitleFileNameMetadata | null = null;

    try {
      const titleFileNameMetadataTemp = getTitleFileNameMetadata({
        titleFileName: fileName,
        titleName: name,
      });

      if (!titleFileNameMetadataTemp.resolution || !titleFileNameMetadataTemp.year) {
        throw new Error("Resolution or year not found");
      }

      titleFileNameMetadata = titleFileNameMetadataTemp;
    } catch (error) {
      console.log(`\nNo pudimos parsear ${fileName} correctamente`, error);
    }

    if (!titleFileNameMetadata) {
      console.log(`4.${index}) No se encontró metadata para el titulo "${name}" \n`);
      continue;
    }

    const { releaseGroup, resolution, ripType } = titleFileNameMetadata;
    const finalResolution = resolution ? resolution : resolutionFromVideoFile ? resolutionFromVideoFile : "-";

    if (!releaseGroup) {
      console.error(`No hay release group soportado para ${videoFile.name} \n`);

      if (isDebugging) {
        await confirm({
          initialValue: true,
          message: "¿Desea continuar? (Revisar si tiene sentido agregar el release group)",
        });
      }

      continue;
    }

    const fileNameExtension = getTitleFileNameExtension(fileName);

    console.table([
      {
        name,
        year,
        ripType,
        resolution: finalResolution,
        releaseGroup: releaseGroup.release_group_name,
        fileName,
        fileNameExtension,
      },
    ]);

    console.log(`4.${index}.${torrentIndex}) Buscando subtítulo para ${name}`);

    const subDivxSubtitleAlreadyExists = await hasSubDivXSubtitleInDatabase(fileName);
    if (subDivxSubtitleAlreadyExists) {
      console.log(`4.${index}.${torrentIndex}) Subtítulo (de SubDivX) ya existe en la base de datos 🙌`);
      continue;
    }

    await executeWithOptionalTryCatch(
      shouldUseTryCatch,
      async function getSubtitleFromProvider() {
        if (!subtitles.subdivx) {
          return;
        }

        if (subtitles.subdivx.aaData.length === 0) {
          return;
        }

        const foundSubtitleFromSubDivX = await filterSubDivXSubtitlesForTorrent({
          episode,
          subtitles: subtitles.subdivx,
          titleFileNameMetadata: {
            ...titleFileNameMetadata,
            resolution: finalResolution,
          },
        });

        wsSubtitleHasBeenFound = true;

        const { release_group_name: releaseGroupName } = releaseGroup;
        console.log(
          `4.${index}.${torrentIndex}) Subtítulo encontrado en SubDivX (ID: ${foundSubtitleFromSubDivX.externalId}) para ${name} ${finalResolution} ${releaseGroupName} \n`,
        );

        await downloadAndStoreTitleAndSubtitle({
          titleType,
          titleGenres: genres,
          titleFile: {
            bytes,
            fileName,
            fileNameExtension,
          },
          title: {
            runtime,
            imdb_id: imdbId,
            title_name: name,
            rating,
            overview,
            title_name_spa: spanishName,
            title_name_ja: japanaseName,
            release_date: releaseDate,
            year,
            logo,
            poster,
            backdrop,
            certification,
            total_episodes: totalEpisodes,
            total_seasons: totalSeasons,
            type: episode ? TitleTypes.tvShow : TitleTypes.movie,
            episode,
          },
          bytesFromNotFoundSubtitle,
          titleFileNameFromNotFoundSubtitle,
          torrent: { ...torrent, bytes },
          releaseGroupName,
          subtitleGroupName: foundSubtitleFromSubDivX.subtitleGroupName,
          subtitle: {
            ...foundSubtitleFromSubDivX,
            resolution: finalResolution,
            torrentId: torrent.id,
            ripType,
          },
          releaseGroups,
          subtitleGroups,
          indexedBy,
        });
      },
      `4.${index}.${torrentIndex}) Subtítulo no encontrado en SubDivX para ${name} ${finalResolution} ${releaseGroup.release_group_name} (Puede llegar a existir en otro proveedor) \n`,
    );

    const subDivxSubtitleAlreadyExists2 = await hasSubDivXSubtitleInDatabase(fileName);
    if (subDivxSubtitleAlreadyExists2) {
      console.log(`4.${index}.${torrentIndex}) Subtítulo (de SubDivX) ya existe en la base de datos 🙌`);
      continue;
    }

    await executeWithOptionalTryCatch(
      shouldUseTryCatch,
      async function getSubtitleFromProvider() {
        if (!subtitles.subdl) {
          return;
        }

        const foundSubtitleFromSubdl = await filterSubdlSubtitlesForTorrent({
          episode,
          subtitles: subtitles.subdl,
          titleFileNameMetadata: {
            ...titleFileNameMetadata,
            resolution: finalResolution,
          },
        });

        wsSubtitleHasBeenFound = true;

        const { release_group_name: releaseGroupName } = releaseGroup;
        console.log(
          `4.${index}.${torrentIndex}) Subtítulo encontrado en SubDL (ID: ${foundSubtitleFromSubdl.externalId}) para ${name} ${finalResolution} ${releaseGroupName} \n`,
        );

        await downloadAndStoreTitleAndSubtitle({
          indexedBy,
          titleType,
          titleGenres: genres,
          titleFile: {
            bytes,
            fileName,
            fileNameExtension,
          },
          title: {
            runtime,
            imdb_id: imdbId,
            title_name: name,
            rating,
            overview,
            title_name_spa: spanishName,
            title_name_ja: japanaseName,
            release_date: releaseDate,
            year,
            logo,
            poster,
            backdrop,
            certification,
            total_episodes: totalEpisodes,
            total_seasons: totalSeasons,
            type: episode ? TitleTypes.tvShow : TitleTypes.movie,
            episode,
          },
          bytesFromNotFoundSubtitle,
          titleFileNameFromNotFoundSubtitle,
          torrent,
          releaseGroupName,
          subtitleGroupName: foundSubtitleFromSubdl.subtitleGroupName,
          subtitle: {
            ...foundSubtitleFromSubdl,
            resolution: finalResolution,
            torrentId: torrent.id,
            ripType,
          },
          releaseGroups,
          subtitleGroups,
        });
      },
      `4.${index}.${torrentIndex}) Subtítulo no encontrado en SUBDL para ${name} ${finalResolution} ${releaseGroup.release_group_name} (Puede llegar a existir en otro proveedor) \n`,
    );

    const subDlSubtitleAlreadyExists = await hasSubDlSubtitleInDatabase(fileName);
    if (subDlSubtitleAlreadyExists) {
      console.log(`4.${index}.${torrentIndex}) Subtítulo (de SubDL) ya existe en la base de datos 🙌`);
      continue;
    }

    await executeWithOptionalTryCatch(
      shouldUseTryCatch,
      async function getSubtitleFromProvider() {
        if (!subtitles.openSubtitles) {
          return;
        }

        const foundSubtitleFromOpenSubtitles = await filterOpenSubtitleSubtitlesForTorrent({
          episode,
          subtitles: subtitles.openSubtitles,
          titleFileNameMetadata: {
            ...titleFileNameMetadata,
            resolution: finalResolution,
          },
        });

        wsSubtitleHasBeenFound = true;

        const { release_group_name: releaseGroupName } = releaseGroup;
        console.log(
          `4.${index}.${torrentIndex}) Subtítulo encontrado en OpenSubtitles (ID: ${foundSubtitleFromOpenSubtitles.externalId}) para ${name} ${finalResolution} ${releaseGroupName} \n`,
        );

        await downloadAndStoreTitleAndSubtitle({
          indexedBy,
          titleType,
          titleGenres: genres,
          titleFile: {
            bytes,
            fileName,
            fileNameExtension,
          },
          title: {
            runtime,
            imdb_id: imdbId,
            title_name: name,
            rating,
            overview,
            certification,
            title_name_spa: spanishName,
            title_name_ja: japanaseName,
            release_date: releaseDate,
            year,
            logo,
            poster,
            backdrop,
            total_episodes: totalEpisodes,
            total_seasons: totalSeasons,
            type: episode ? TitleTypes.tvShow : TitleTypes.movie,
            episode,
          },
          bytesFromNotFoundSubtitle,
          titleFileNameFromNotFoundSubtitle,
          torrent,
          releaseGroupName,
          subtitleGroupName: foundSubtitleFromOpenSubtitles.subtitleGroupName,
          subtitle: {
            ...foundSubtitleFromOpenSubtitles,
            resolution: finalResolution,
            torrentId: torrent.id,
            ripType,
          },
          releaseGroups,
          subtitleGroups,
        });
      },
      `4.${index}.${torrentIndex}) Subtítulo no encontrado en OpenSubtitles para ${name} ${finalResolution} ${releaseGroup.release_group_name} (Puede llegar a existir en otro proveedor) \n`,
    );

    if (isDebugging) {
      await confirm({
        message: `¿Desea continuar al siguiente ${Number(torrentIndex) === filteredTorrents.length - 1 ? "titulo" : "subtitlo"}?`,
      });
    }
  }

  // remove all files that begins with temp-
  const tempFiles = await fs.readdirSync(path.join(__dirname, "..", ".."));

  for (const file of tempFiles) {
    if (file.startsWith("temp-")) {
      await fs.unlinkSync(path.join(__dirname, "..", "..", file));
    }
  }

  if (!fromWebSocket) {
    console.log(`4.${index}) Esperando 2s para pasar al siguiente titulo... \n`);
    await Bun.sleep(2000);

    if (indexedBy !== "indexer-movie") {
      console.log(`4.${index}) Pasando al siguiente titulo... \n`);
      console.log("------------------------------ \n");
    }
  }

  return wsSubtitleHasBeenFound;
}

// ----------------------- WS

// export * from "./websocket-not-found";
