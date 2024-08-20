import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import { confirm } from "@clack/prompts";
import unrar from "@continuata/unrar";
import clipboard from "clipboardy";
import download from "download";
import extract from "extract-zip";
import prettyBytes from "pretty-bytes";
import replaceSpecialCharacters from "replace-special-characters";
import invariant from "tiny-invariant";
import tg from "torrent-grabber";
import torrentStream, { type File } from "torrent-stream";
import { match } from "ts-pattern";
import type { ArrayValues, AsyncReturnType } from "type-fest";
import { z } from "zod";

// db
import { type Title, supabase } from "@subtis/db";

// shared
import {
  type TitleFileNameMetadata,
  VIDEO_FILE_EXTENSIONS,
  getDecodedSubtitleFile,
  getSeasonAndEpisode,
  getTitleFileNameExtension,
  getTitleFileNameMetadata,
} from "@subtis/shared";

// internals
import { getImdbLink } from "./imdb";
import { filterOpenSubtitleSubtitlesForTorrent, getSubtitlesFromOpenSubtitlesForTitle } from "./opensubtitles";
import type { ReleaseGroupMap, ReleaseGroupNames } from "./release-groups";
import { filterSubDivXSubtitlesForTorrent, getSubtitlesFromSubDivXForTitle } from "./subdivx";
import type { SubtitleGroupMap, SubtitleGroupNames } from "./subtitle-groups";
import type { TmdbTitle, TmdbTvShow } from "./tmdb";
import type { SubtitleData } from "./types";
import { executeWithOptionalTryCatch, getSubtitleAuthor } from "./utils";
import { getQueryForTorrentProvider } from "./utils/query";
import { generateIdFromMagnet } from "./utils/torrent";
import { getYtsTorrents } from "./yts";

// types
type TmdbTvShowEpisode = TmdbTvShow & { episode: string };
type TmdbMovie = TmdbTitle & { episode: null; totalSeasons: null; totalEpisodes: null };

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
  | "id"
  | "title_name"
  | "title_name_spa"
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
  | "teaser"
> & {
  episode: string | null;
};

type SubtitleWithResolutionAndTorrentId = SubtitleData & { resolution: string; torrentId: number };

// constants
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
      await unrar.uncompress({
        command: "e",
        dest: toRoute,
        src: fromRoute,
        switches: ["-o+", "-idcd"],
      });
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

  if (["rar", "zip"].includes(fileExtension)) {
    const extractedSubtitleFiles = fs.readdirSync(extractedSubtitlePath);

    const srtFile = extractedSubtitleFiles.find((file) => path.extname(file).toLowerCase() === ".srt");
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
    contentType: "text/plain;charset=UTF-8",
    upsert: true,
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

async function storeTitleInSupabaseTable(title: TitleWithEpisode): Promise<void> {
  const { episode, ...rest } = title;
  await supabase.from("Titles").upsert({
    ...rest,
    title_name_without_special_chars: replaceSpecialCharacters(title.title_name).replaceAll(":", ""),
  });
}

async function storeSubtitleInSupabaseTable({
  title,
  titleFile,
  subtitle,
  author,
  subtitleLink,
  subtitleGroups,
  releaseGroups,
  subtitleGroupName,
  releaseGroupName,
  bytesFromNotFoundSubtitle,
  titleFileNameFromNotFoundSubtitle,
}: {
  title: TitleWithEpisode;
  titleFile: TitleFile;
  subtitle: SubtitleWithResolutionAndTorrentId;
  author: string | null;
  subtitleLink: string;
  subtitleGroups: SubtitleGroupMap;
  releaseGroups: ReleaseGroupMap;
  subtitleGroupName: SubtitleGroupNames;
  releaseGroupName: ReleaseGroupNames;
  bytesFromNotFoundSubtitle?: number;
  titleFileNameFromNotFoundSubtitle?: string;
}): Promise<void> {
  const { lang, downloadFileName, resolution, torrentId } = subtitle;

  const { id: subtitleGroupId } = subtitleGroups[subtitleGroupName];
  const { id: releaseGroupId } = releaseGroups[releaseGroupName];

  const { bytes, fileName, fileNameExtension } = titleFile;
  const { current_season, current_episode } = getSeasonAndEpisode(title.episode);

  const { error } = await supabase.from("Subtitles").insert({
    lang,
    author,
    reviewed: true,
    uploaded_by: "indexer",
    bytes,
    torrent_id: torrentId,
    file_extension: fileNameExtension,
    title_file_name: fileName,
    subtitle_file_name: downloadFileName,
    title_id: title.id,
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
      reviewed: true,
      uploaded_by: "indexer",
      bytes: bytesFromNotFoundSubtitle,
      torrent_id: torrentId,
      file_extension: fileNameExtension,
      title_file_name: titleFileNameFromNotFoundSubtitle,
      subtitle_file_name: downloadFileName,
      title_id: title.id,
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

function parseTorrentTrackerId(trackerId: string) {
  return trackerId.slice(0, 60).toLowerCase();
}

async function storeTorrentInSupabaseTable(torrent: TorrentResultWithId): Promise<void> {
  const { id, title, size, seeds, tracker, trackerId } = torrent;

  await supabase.from("Torrents").upsert({
    id,
    torrent_name: title,
    torrent_size: size,
    torrent_seeds: seeds,
    torrent_tracker: tracker,
    torrent_link: parseTorrentTrackerId(trackerId),
  });
}

function removeSubtitlesFromFileSystem(paths: string[]): void {
  for (const path of paths) {
    fs.promises.rm(path, { recursive: true, force: true });
  }
}

function addSecondsToTimestamp(timestamp: string, secondsToAdd: number): string {
  const [time] = timestamp.split(",");
  let [hours, minutes, seconds] = time.split(":").map(Number);

  seconds += secondsToAdd;

  if (seconds >= 60) {
    minutes += Math.floor(seconds / 60);
    seconds %= 60;
  }

  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes %= 60;
  }

  if (hours >= 24) {
    hours %= 24;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},000`;
}

async function addWatermarkToSubtitle({
  path,
  titleType,
  subtitleGroupName,
}: {
  path: string;
  titleType: TitleTypes;
  subtitleGroupName: SubtitleGroupNames;
}): Promise<void> {
  const subtitleBuffer = await fs.promises.readFile(path);

  let subtitleText = "";

  if (subtitleGroupName === "SubDivX") {
    subtitleText = getDecodedSubtitleFile(subtitleBuffer);
  }

  if (subtitleGroupName === "OpenSubtitles") {
    subtitleText = subtitleBuffer.toString("utf-8");
  }

  const subtitleTextWithWatermark = match(titleType)
    .with(TitleTypes.movie, () => {
      return `-2
00:00:05,000 --> 00:00:15,000
- Subtitulos descargados desde <b>Subtis</b>
- Link: https://subt.is

-1
00:00:16,000 --> 00:00:26,000
Contactanos por Twitter/X en @subt_is

0
00:00:27,000 --> 00:00:37,000
Contactanos por email a soporte@subt.is

${subtitleText}`;
    })
    .with(TitleTypes.tvShow, () => {
      const splitter = match(subtitleGroupName)
        .with("SubDivX", () => /\r\n\r\n/)
        .with("OpenSubtitles", () => /\n\n/)
        .run();

      const lastSubtitleSplitted = subtitleText.trimEnd().split(splitter);
      let lastSubtitle = lastSubtitleSplitted.at(-1) as string;

      if (lastSubtitle.includes("9999") || lastSubtitle.includes("www.subdivx.com")) {
        lastSubtitle = lastSubtitleSplitted.at(-2) as string;
      }

      const [id, timestamp] = lastSubtitle.split("\n");

      const lastSubtitleId = Number(id);
      const lastSubtitleTimestamp = timestamp.split(" ").at(-1) as string;

      const watermarkNextId = lastSubtitleId + 1;

      const newTimestamp = addSecondsToTimestamp(lastSubtitleTimestamp, 6);
      const newTimestamp2 = addSecondsToTimestamp(newTimestamp, 4);
      const newTimestamp3 = addSecondsToTimestamp(newTimestamp2, 4);

      return `${subtitleText}

  ${watermarkNextId}
  ${lastSubtitleTimestamp} --> ${newTimestamp}
  - Subtitulos descargados desde <b>Subtis</b>
  - Link: https://subt.is

  ${watermarkNextId + 1}
  ${newTimestamp} --> ${newTimestamp2}
  Contactanos por Twitter/X en @subt_is

  ${watermarkNextId + 2}
  ${newTimestamp2} --> ${newTimestamp3}
  Contactanos por email a soporte@subt.is`;
    })
    .run();

  await fs.promises.writeFile(path, subtitleTextWithWatermark, "utf-8");
}

async function downloadAndStoreTitleAndSubtitle({
  title,
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
}: {
  titleFile: TitleFile;
  titleType: TitleTypes;
  title: TitleWithEpisode;
  torrent: TorrentResultWithId;
  releaseGroups: ReleaseGroupMap;
  subtitleGroups: SubtitleGroupMap;
  subtitle: SubtitleWithResolutionAndTorrentId;
  releaseGroupName: ReleaseGroupNames;
  subtitleGroupName: SubtitleGroupNames;
  bytesFromNotFoundSubtitle?: number;
  titleFileNameFromNotFoundSubtitle?: string;
}): Promise<void> {
  try {
    await downloadSubtitle(subtitle);

    const { subtitleCompressedAbsolutePath, extractedSubtitlePath } = getSubtitleAbsolutePaths(subtitle);
    await uncompressSubtitle({ subtitle, fromRoute: subtitleCompressedAbsolutePath, toRoute: extractedSubtitlePath });

    const path = getSubtitleInitialPath({ subtitle, extractedSubtitlePath });
    await addWatermarkToSubtitle({ path, subtitleGroupName, titleType });

    const subtitleFileToUpload = readSubtitleFile(path);
    const author = getSubtitleAuthor(subtitleFileToUpload);

    const fullPath = await storeSubtitleInSupabaseStorage({ subtitle, subtitleFileToUpload });
    removeSubtitlesFromFileSystem([subtitleCompressedAbsolutePath, extractedSubtitlePath]);
    const subtitleLink = getSupabaseSubtitleLink({ fullPath, subtitle });

    await storeTorrentInSupabaseTable(torrent);
    await storeTitleInSupabaseTable(title);
    await storeSubtitleInSupabaseTable({
      title,
      titleFile,
      subtitle,
      author,
      subtitleLink,
      subtitleGroups,
      releaseGroups,
      subtitleGroupName,
      releaseGroupName,
      bytesFromNotFoundSubtitle,
      titleFileNameFromNotFoundSubtitle,
    });

    // play sound when a subtitle was found
    console.log("\n✅ Subtítulo guardado en la base de datos!\n");

    console.table([
      {
        imdbLink: getImdbLink(title.id),
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

type PromiseTorrentResults = ReturnType<typeof tg.search>;
type TorrentResults = AsyncReturnType<typeof getTitleTorrents>;
type TorrentResult = ArrayValues<TorrentResults>;
type TorrentResultWithId = TorrentResult & { id: number };

async function getTitleTorrents(query: string, titleType: TitleTypes, imdbId: number): PromiseTorrentResults {
  let thePirateBayTorrents = [];

  try {
    const thePirateBayResult = await tg.search(query, { groupByTracker: true });
    thePirateBayTorrents = thePirateBayResult instanceof Map ? thePirateBayResult.get("ThePirateBay") : [];
  } catch (error) {
    const parsedError = error as Error;
    if (!parsedError.message.includes("arr[0].tracker")) {
      console.log("Error on getTitleTorrents using tg.search interface");
      console.log(error);
    }
  }

  if (titleType === TitleTypes.tvShow) {
    return thePirateBayTorrents;
  }

  const ytsTorrents = await getYtsTorrents(imdbId);

  return [...ytsTorrents, ...thePirateBayTorrents].flat();
}

function getFilteredTorrents(torrents: TorrentResults, maxTorrents = 15, minSeeds = 15): TorrentResultWithId[] {
  const CINEMA_RECORDING_REGEX =
    /\b(hdcam|hdcamrip|hqcam|hq-cam|telesync|hdts|hd-ts|c1nem4|qrips|hdrip|cam|soundtrack|xxx|clean|khz|ep)\b/gi;

  const seenSizes = new Set<number>();

  return torrents
    .toSorted((torrentA, torrentB) => {
      if (torrentA.tracker === "YTS" && torrentB.tracker !== "YTS") return -1;
      if (torrentA.tracker !== "YTS" && torrentB.tracker === "YTS") return 1;

      return torrentB.seeds - torrentA.seeds;
    })
    .slice(0, maxTorrents)
    .filter((torrent) => !torrent.title.match(CINEMA_RECORDING_REGEX))
    .filter(({ seeds }) => seeds > minSeeds)
    .filter((torrent) => {
      if (seenSizes.has(torrent.size)) {
        return false;
      }

      seenSizes.add(torrent.size);

      return true;
    })
    .map((torrent) => ({ ...torrent, id: generateIdFromMagnet(torrent.trackerId) }));
}

export async function getTorrentFilesMetadata(torrent: TorrentResult): Promise<File[]> {
  const engine = torrentStream(torrent.trackerId);

  const files = await new Promise<File[]>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      engine.destroy();
      reject(new Error("Timeout: Tardo más de 30s puede ser por falta de seeds"));
    }, 30000);

    engine.on("torrent", (data) => {
      clearTimeout(timeoutId);
      resolve(data.files);
    });
  });

  engine.destroy();

  return files;
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

async function hasSubtitleInDatabase(title_file_name: string): Promise<boolean> {
  const { data: subtitles } = await supabase.from("Subtitles").select("*").match({
    title_file_name,
  });

  return subtitles ? subtitles.length > 0 : false;
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
}: {
  index: string;
  initialTorrents?: TorrentResults;
  currentTitle: CurrentTitle;
  releaseGroups: ReleaseGroupMap;
  subtitleGroups: SubtitleGroupMap;
  isDebugging: boolean;
  shouldUseTryCatch: boolean;
  bytesFromNotFoundSubtitle?: number;
  titleFileNameFromNotFoundSubtitle?: string;
  fromWebSocket?: boolean;
}): Promise<void> {
  const {
    name,
    year,
    logo,
    teaser,
    imdbId,
    rating,
    releaseDate,
    poster,
    backdrop,
    episode,
    spanishName,
    overview,
    totalSeasons,
    totalEpisodes,
  } = currentTitle;

  const titleType = episode ? TitleTypes.tvShow : TitleTypes.movie;
  const { current_season: currentSeason, current_episode: currentEpisode } = getSeasonAndEpisode(episode);

  createInitialFolders();
  const titleProviderQuery = getQueryForTorrentProvider(currentTitle);

  const torrents = initialTorrents ?? (await getTitleTorrents(titleProviderQuery, titleType, imdbId));
  const filteredTorrents = getFilteredTorrents(torrents);

  if (filteredTorrents.length === 0) {
    return console.log(`4.${index}) No se encontraron torrents para el titulo "${name}" \n`);
  }

  console.log(`4.${index}) Torrents (${filteredTorrents.length}) encontrados para el título "${name}" \n`);
  console.table(
    filteredTorrents.map(({ seeds, size, title, tracker }) => ({
      query: titleProviderQuery,
      seeds,
      size: prettyBytes(size ?? 0),
      title,
      tracker,
    })),
  );

  clipboard.writeSync(titleProviderQuery);
  console.log(
    `👉 Nombre de titulo ${titleProviderQuery} guardado en el clipboard, para poder pegar directamente en proveedor de torrents o subtítulos \n`,
  );

  console.log(`4.${index}) Buscando subtítulos en SubDivX \n`);
  const subtitlesFromSubDivX = await getSubtitlesFromSubDivXForTitle({
    titleProviderQuery,
    hasBeenExecutedOnce: false,
  });
  console.log(`4.${index}) ${subtitlesFromSubDivX.aaData.length} subtitlos encontrados en SubDivX \n`);

  console.log(`4.${index}) Buscando subtítulos en OpenSubtitles \n`);
  const subtitlesFromOpenSubtitles = await getSubtitlesFromOpenSubtitlesForTitle({
    imdbId,
    titleType,
    currentSeason,
    currentEpisode,
  });
  console.log(`4.${index}) ${subtitlesFromOpenSubtitles.data.length} subtitlos encontrados en OpenSubtitles \n`);

  const releaseGroupsqueryMatches = Object.values(releaseGroups)
    .flatMap(({ query_matches }) => query_matches)
    .map((queryMatch) => queryMatch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  const releaseGroupsRegex = new RegExp(`\\b(${releaseGroupsqueryMatches.join("|")})\\b`, "gi");
  const resolutionRegex = /(480p|576p|720p|1080p|2160p|3d)/gi;

  const subdivxTable = subtitlesFromSubDivX.aaData.map(({ titulo, descripcion }) => {
    const resolutions = descripcion.match(resolutionRegex);
    const releaseGroups = descripcion.match(releaseGroupsRegex);

    return {
      title: titulo,
      resolutions: resolutions ? [...new Set(resolutions)] : "",
      releaseGroups: releaseGroups ? [...new Set(releaseGroups)] : "",
    };
  });

  const openSubtitlesTable = subtitlesFromOpenSubtitles.data.map(({ attributes }) => {
    const release = attributes.release.toLowerCase();
    const comments = attributes?.comments?.toLowerCase() ?? "";

    const resolutions = release.match(resolutionRegex) || comments.match(resolutionRegex);
    const releaseGroups = release.match(releaseGroupsRegex) || comments.match(releaseGroupsRegex);

    return {
      title: attributes.feature_details.title,
      name: attributes.feature_details.movie_name,
      resolutions: resolutions ? [...new Set(resolutions)] : "",
      releaseGroups: releaseGroups ? [...new Set(releaseGroups)] : "",
    };
  });

  for await (const [torrentIndex, torrent] of Object.entries(filteredTorrents)) {
    console.log("\n\n\n\n");
    console.log("-------------------------------------------------------------------");

    if (subdivxTable.length > 0) {
      console.log(`4.${index}.${torrentIndex}) Subtitulos encontrados en SubDivx:`);
      console.table(subdivxTable);
      console.log("\n");
    }

    if (openSubtitlesTable.length > 0) {
      console.log(`4.${index}.${torrentIndex}) Subtitulos encontrados en OpenSubtitles:`);
      console.table(openSubtitlesTable);
      console.log("\n");
    }

    console.log(`4.${index}.${torrentIndex}) Procesando torrent`, `"${torrent.title}"`, "\n");
    const files = await executeWithOptionalTryCatch(
      true,
      async function processTorrent() {
        return await getTorrentFilesMetadata(torrent);
      },
      `4.${index}.${torrentIndex}) No se encontraron archivos en el torrent\n`,
    );

    if (!files || files.length === 0) {
      console.log("No se encontraron archivos en el torrent\n");
      continue;
    }

    const videoFile = getVideoFromFiles(files);

    if (!videoFile) {
      console.log("No hay archivos de video en el torrent\n");
      continue;
    }

    const { length: bytes, name: fileName } = videoFile;
    let titleFileNameMetadata: TitleFileNameMetadata | null = null;

    try {
      titleFileNameMetadata = getTitleFileNameMetadata({
        titleFileName: fileName,
        titleName: name,
      });
    } catch (error) {
      console.log(`\nNo pudimos parsear ${fileName} correctamente`, error);
    }

    if (!titleFileNameMetadata) {
      console.log(`4.${index}) No se encontró metadata para el titulo "${name}" \n`);
      continue;
    }

    const { releaseGroup, resolution } = titleFileNameMetadata;

    if (!releaseGroup) {
      console.error(`No hay release group soportado para ${videoFile.name} \n`);

      if (isDebugging) {
        await confirm({
          message: "¿Desea continuar? (Revisar si tiene sentido agregar el release group)",
          initialValue: true,
        });
      }

      continue;
    }

    const fileNameExtension = getTitleFileNameExtension(fileName);

    console.table([
      {
        name,
        year,
        resolution,
        releaseGroup: releaseGroup.release_group_name,
        fileName,
        fileNameExtension,
      },
    ]);

    console.log(`4.${index}.${torrentIndex}) Buscando subtítulo para ${name}`);

    const subtitleAlreadyExists = await hasSubtitleInDatabase(fileName);
    if (subtitleAlreadyExists) {
      console.log(`4.${index}.${torrentIndex}) Subtítulo ya existe en la base de datos 🙌`);
      continue;
    }

    await executeWithOptionalTryCatch(
      shouldUseTryCatch,
      async function getSubtitleFromProvider() {
        const foundSubtitleFromSubDivX = await filterSubDivXSubtitlesForTorrent({
          episode,
          titleFileNameMetadata,
          subtitles: subtitlesFromSubDivX,
        });

        const { release_group_name: releaseGroupName } = releaseGroup;
        console.log(
          `4.${index}.${torrentIndex}) Subtítulo encontrado en SubDivX para ${name} ${resolution} ${releaseGroupName} \n`,
        );

        await downloadAndStoreTitleAndSubtitle({
          titleType,
          titleFile: {
            bytes,
            fileName,
            fileNameExtension,
          },
          title: {
            teaser,
            id: imdbId,
            title_name: name,
            rating,
            overview,
            title_name_spa: spanishName,
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
          subtitleGroupName: foundSubtitleFromSubDivX.subtitleGroupName,
          subtitle: { ...foundSubtitleFromSubDivX, resolution, torrentId: torrent.id },
          releaseGroups,
          subtitleGroups,
        });
      },
      `4.${index}.${torrentIndex}) Subtítulo no encontrado en SubDivX para ${name} ${resolution} ${releaseGroup.release_group_name} (Puede llegar a existir en OpenSubtitles) \n`,
    );

    const subtitleAlreadyExistsAgain = await hasSubtitleInDatabase(fileName);
    if (subtitleAlreadyExistsAgain) {
      console.log(`4.${index}.${torrentIndex}) Subtítulo ya existe en la base de datos 🙌`);
      continue;
    }

    await executeWithOptionalTryCatch(
      shouldUseTryCatch,
      async function getSubtitleFromProvider() {
        const foundSubtitleFromOpenSubtitles = await filterOpenSubtitleSubtitlesForTorrent({
          episode,
          titleFileNameMetadata,
          subtitles: subtitlesFromOpenSubtitles,
        });

        const { release_group_name: releaseGroupName } = releaseGroup;
        console.log(
          `4.${index}.${torrentIndex}) Subtítulo encontrado en OpenSubtitles para ${name} ${resolution} ${releaseGroupName} \n`,
        );

        await downloadAndStoreTitleAndSubtitle({
          titleType,
          titleFile: {
            bytes,
            fileName,
            fileNameExtension,
          },
          title: {
            teaser,
            id: imdbId,
            title_name: name,
            rating,
            overview,
            title_name_spa: spanishName,
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
          subtitle: { ...foundSubtitleFromOpenSubtitles, resolution, torrentId: torrent.id },
          releaseGroups,
          subtitleGroups,
        });
      },
      `4.${index}.${torrentIndex}) Subtítulo no encontrado en OpenSubtitles para ${name} ${resolution} ${releaseGroup.release_group_name} \n`,
    );

    if (isDebugging) {
      await confirm({
        message: `¿Desea continuar al siguiente ${Number(torrentIndex) === filteredTorrents.length - 1 ? "titulo" : "subtitlo"}?`,
      });
    }
  }

  if (!fromWebSocket) {
    console.log(`4.${index}) Esperando 4s para pasar al siguiente titulo... \n`);
    await Bun.sleep(4000);

    console.log(`4.${index}) Pasando al siguiente titulo... \n`);
    console.log("------------------------------ \n");
  }
}

// ----------------------- WS

// export * from "./websocket-not-found";
