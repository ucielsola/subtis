import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import { confirm } from "@clack/prompts";
import unrar from "@continuata/unrar";
import clipboard from "clipboardy";
import download from "download";
import extract from "extract-zip";
import prettyBytes from "pretty-bytes";
import invariant from "tiny-invariant";
import tg from "torrent-grabber";
import torrentStream, { type File } from "torrent-stream";
import { match } from "ts-pattern";
import type { ArrayValues, AsyncReturnType } from "type-fest";
import { z } from "zod";

import { type Title, supabase } from "@subtis/db";
import {
  type TitleFileNameMetadata,
  VIDEO_FILE_EXTENSIONS,
  getTitleFileNameExtension,
  getTitleFileNameMetadata,
} from "@subtis/shared";

// internals
import { getImdbLink } from "./imdb";
import type { ReleaseGroupMap, ReleaseGroupNames } from "./release-groups";
import { type SubtitleGroupMap, type SubtitleGroupNames, getEnabledSubtitleProviders } from "./subtitle-groups";
import type { TmdbTitle, TmdbTvShow } from "./tmdb";
import type { SubtitleData } from "./types";
import { getSubtitleAuthor } from "./utils";
import { getQueryForTorrentProvider } from "./utils/query";
import { generateIdFromMagnet } from "./utils/torrent";

// types
type TmdbTvShowEpisode = TmdbTvShow & { episode: string };
type TmdbMovie = TmdbTitle & { episode: null; totalSeasons: null; totalEpisodes: null };

export type CurrentTitle = TmdbMovie | TmdbTvShowEpisode;

// enum
enum TitleTypes {
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

function readSubtitleFile({
  subtitle,
  extractedSubtitlePath,
}: {
  subtitle: SubtitleWithResolutionAndTorrentId;
  extractedSubtitlePath: string;
}): Buffer {
  const { fileExtension, subtitleFileNameWithoutExtension, subtitleSrtFileName } = subtitle;

  let subtitleFileToUpload: Buffer | undefined;

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

    subtitleFileToUpload = fs.readFileSync(extractedSrtFileNamePath);
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
    subtitleFileToUpload = fs.readFileSync(srtFileNamePath);
  }

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
  await supabase.from("Titles").upsert(rest);
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

async function downloadAndStoreTitleAndSubtitle({
  title,
  titleFile,
  subtitle,
  torrent,
  releaseGroups,
  subtitleGroups,
  releaseGroupName,
  subtitleGroupName,
}: {
  titleFile: TitleFile;
  title: TitleWithEpisode;
  torrent: TorrentResultWithId;
  releaseGroups: ReleaseGroupMap;
  subtitleGroups: SubtitleGroupMap;
  subtitle: SubtitleWithResolutionAndTorrentId;
  releaseGroupName: ReleaseGroupNames;
  subtitleGroupName: SubtitleGroupNames;
}): Promise<void> {
  try {
    await downloadSubtitle(subtitle);

    const { subtitleCompressedAbsolutePath, extractedSubtitlePath } = getSubtitleAbsolutePaths(subtitle);
    await uncompressSubtitle({ subtitle, fromRoute: subtitleCompressedAbsolutePath, toRoute: extractedSubtitlePath });

    const subtitleFileToUpload = readSubtitleFile({ subtitle, extractedSubtitlePath });
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
function getSeasonAndEpisode(fullSeason: string | null): {
  current_season: number | null;
  current_episode: number | null;
} {
  if (!fullSeason) {
    return { current_season: null, current_episode: null };
  }

  const [current_season, current_episode] = fullSeason.replace("E", "-").replace("S", "").split("-").map(Number);
  return { current_season, current_episode };
}

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

async function getTitleTorrents(query: string): PromiseTorrentResults {
  return tg.search(query, { groupByTracker: false });
}

function getFilteredTorrents(torrents: TorrentResults, maxTorrents = 10, minSeeds = 15): TorrentResultWithId[] {
  const CINEMA_RECORDING_REGEX = /\b(hdcam|hdcamrip|hqcam|hq-cam|telesync|hdts|hd-ts|c1nem4|qrips)\b/gi;

  return torrents
    .toSorted((torrentA, torrentB) => torrentB.seeds - torrentA.seeds)
    .slice(0, maxTorrents)
    .filter((torrent) => !torrent.title.match(CINEMA_RECORDING_REGEX))
    .filter(({ seeds }) => seeds > minSeeds)
    .map((torrent) => ({ ...torrent, id: generateIdFromMagnet(torrent.trackerId) }));
}

async function getTorrentFilesMetadata(torrent: TorrentResult): Promise<File[]> {
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

function getVideoFromFiles(files: File[]): File | undefined {
  return files
    .toSorted((fileA, fileB) => fileB.length - fileA.length)
    .find((file) => {
      return VIDEO_FILE_EXTENSIONS.some((videoFileExtension) => {
        return file.name.endsWith(videoFileExtension);
      });
    });
}

async function hasSubtitleInDatabase(subtitle_group_id: number, title_file_name: string): Promise<boolean> {
  const { data: subtitles } = await supabase.from("Subtitles").select("*").match({
    subtitle_group_id,
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
}: {
  index: string;
  initialTorrents?: TorrentResults;
  currentTitle: CurrentTitle;
  releaseGroups: ReleaseGroupMap;
  subtitleGroups: SubtitleGroupMap;
  isDebugging: boolean;
}): Promise<void> {
  createInitialFolders();
  const titleProviderQuery = getQueryForTorrentProvider(currentTitle);

  const torrents = initialTorrents ?? (await getTitleTorrents(titleProviderQuery));
  const filteredTorrents = getFilteredTorrents(torrents);

  const {
    name,
    year,
    logo,
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

  for await (const [torrentIndex, torrent] of Object.entries(filteredTorrents)) {
    console.log(`4.${index}.${torrentIndex}) Procesando torrent`, `"${torrent.title}"`, "\n");
    const files = await getTorrentFilesMetadata(torrent);

    if (files.length === 0) {
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

    const enabledSubtitleProviders = getEnabledSubtitleProviders(subtitleGroups, ["SubDivX"]);

    for await (const [indexSubtitleProvider, enabledSubtitleProvider] of Object.entries(enabledSubtitleProviders)) {
      const { getSubtitleFromProvider, id: subtitleGroupId } = enabledSubtitleProvider;

      try {
        console.log(`4.${index}.${torrentIndex}.${indexSubtitleProvider}) Buscando subtítulo para ${name}`);
        const subtitle = await getSubtitleFromProvider({ imdbId, titleFileNameMetadata, titleProviderQuery, episode });

        if (subtitle) {
          const exists = await hasSubtitleInDatabase(subtitleGroupId, fileName);
          if (exists) {
            console.log(`4.${index}.${torrentIndex}.${indexSubtitleProvider}) Subtítulo ya existe en la base de datos`);
            continue;
          }
        }

        const { subtitleGroupName } = subtitle;
        const { release_group_name: releaseGroupName } = releaseGroup;
        console.log(
          `4.${index}.${torrentIndex}.${indexSubtitleProvider}) Subtítulo encontrado para ${subtitleGroupName}`,
        );

        await downloadAndStoreTitleAndSubtitle({
          titleFile: {
            bytes,
            fileName,
            fileNameExtension,
          },
          title: {
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
          torrent,
          releaseGroupName,
          subtitleGroupName,
          subtitle: { ...subtitle, resolution, torrentId: torrent.id },
          releaseGroups,
          subtitleGroups,
        });
      } catch (error) {
        console.log("\n ~ forawait ~ error:", error);
        console.log(`4.${index}.${torrentIndex}.${indexSubtitleProvider}) Subtítulo no encontrado en ${name} \n`);
      }
    }

    if (isDebugging) {
      await confirm({ message: "¿Desea continuar?" });
    }
    console.log("\n------------------------------\n");
  }

  console.log(`4.${index}) Pasando al siguiente titulo... \n`);
  console.log("------------------------------ \n");
}
