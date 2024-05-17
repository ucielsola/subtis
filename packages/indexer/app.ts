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
import sound from "sound-play";
import invariant from "tiny-invariant";
import tg from "torrent-grabber";
import torrentStream, { type File } from "torrent-stream";
import { P, match } from "ts-pattern";
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

// enum
enum TitleTypes {
  movie = "movie",
  tvShow = "tvShow",
}

type TitleFile = {
  bytes: number;
  fileName: string;
  fileNameExtension: string;
};

type TitleWithEpisode = Pick<
  Title,
  "id" | "title_name" | "rating" | "release_date" | "year" | "poster" | "backdrop" | "type"
> & {
  episode: string | null;
};

type SubtitleWithResolution = SubtitleData & { resolution: string };

async function setSubtitlesToDatabase({
  title,
  titleFile,
  subtitle,
  releaseGroups,
  subtitleGroups,
  releaseGroupName,
  subtitleGroupName,
}: {
  titleFile: TitleFile;
  title: TitleWithEpisode;
  releaseGroups: ReleaseGroupMap;
  subtitleGroups: SubtitleGroupMap;
  subtitle: SubtitleWithResolution;
  releaseGroupName: ReleaseGroupNames;
  subtitleGroupName: SubtitleGroupNames;
}): Promise<void> {
  try {
    const {
      lang,
      downloadFileName,
      fileExtension,
      subtitleCompressedFileName,
      subtitleFileNameWithoutExtension,
      subtitleLink,
      subtitleSrtFileName,
      resolution,
    } = subtitle;

    // 1. Download subtitle to fs if file is compressed
    const subtitlesFolderAbsolutePath = path.join(__dirname, "..", "indexer", COMPRESSED_SUBTITLES_FOLDER_NAME);

    if (["rar", "zip"].includes(fileExtension)) {
      await download(subtitleLink, subtitlesFolderAbsolutePath, {
        filename: subtitleCompressedFileName,
      });
    }

    // 2. Create path to downloaded subtitles
    const subtitleAbsolutePath = path.join(__dirname, "..", "indexer", COMPRESSED_SUBTITLES_FOLDER_NAME, subtitleCompressedFileName);

    // 3. Create path to extracted subtitles
    const extractedSubtitlePath = path.join(__dirname, "..", "indexer", UNCOMPRESSED_SUBTITLES_FOLDER_NAME, subtitleFileNameWithoutExtension);

    // 4. Handle compressed zip/rar files or srt files
    fs.mkdirSync(extractedSubtitlePath, { recursive: true });

    await match(fileExtension)
      .with("rar", async () => {
        await unrar.uncompress({
          command: "e",
          dest: extractedSubtitlePath,
          src: subtitleAbsolutePath,
          switches: ["-o+", "-idcd"],
        });
      })
      .with("zip", async () => {
        await extract(subtitleAbsolutePath, { dir: extractedSubtitlePath });
      })
      .with("srt", async () => {
        await download(subtitleLink, extractedSubtitlePath, {
          filename: subtitleSrtFileName,
        });
      })
      .exhaustive();

    let srtFileToUpload: Buffer | unknown;

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

      srtFileToUpload = fs.readFileSync(extractedSrtFileNamePath);
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
      srtFileToUpload = fs.readFileSync(srtFileNamePath);
    }

    // 10. Get author
    const bufferSchema = z.instanceof(Buffer);
    const srtFileToUploadBuffer = bufferSchema.parse(srtFileToUpload);
    const author = getSubtitleAuthor(srtFileToUploadBuffer);

    // 10. Upload SRT file to Supabase storage
    await supabase.storage.from("subtitles").upload(subtitleSrtFileName, srtFileToUploadBuffer, {
      contentType: "text/plain;charset=UTF-8",
      upsert: true,
    });

    // 11. Remove files and folders from fs to avoid collition with others subtitle groups
    // await rimraf([subtitleAbsolutePath, extractedSubtitlePath]);

    // 12. Save SRT to Supabase and get public URL for SRT file
    const {
      data: { publicUrl },
    } = await supabase.storage.from("subtitles").getPublicUrl(subtitleSrtFileName, { download: true });

    // 13. Append download file name to public URL so it matches movie file name
    const subtitleLinkWithDownloadFileName = `${publicUrl}${downloadFileName}`;

    // 13. Get movie by ID
    const { data: titleData } = await supabase.from("Titles").select("*").match({ id: title.id });

    invariant(titleData, "Movie not found");

    // 14. Save titlte to Supabase if is not yet saved
    if (Array.isArray(titleData) && !titleData.length) {
      const { episode, ...rest } = title;
      await supabase.from("Titles").insert(rest).select();
    }

    // 15. Get release and subtitle group id
    const { id: subtitleGroupId } = subtitleGroups[subtitleGroupName];
    const { id: releaseGroupId } = releaseGroups[releaseGroupName];

    const { bytes, fileName, fileNameExtension } = titleFile;
    const { current_season, current_episode } = getSeasonAndEpisode(title.episode);

    // 16. Save subtitle to Supabase
    await supabase.from("Subtitles").insert({
      lang,
      author,
      reviewed: true,
      uploaded_by: "indexer",
      bytes,
      file_extension: fileNameExtension,
      title_file_name: fileName,
      subtitle_file_name: downloadFileName,
      title_id: title.id,
      release_group_id: releaseGroupId,
      resolution,
      subtitle_group_id: subtitleGroupId,
      subtitle_link: subtitleLinkWithDownloadFileName,
      current_season,
      current_episode,
    });

    // play sound when a subtitle was found
    console.log("\n✅ Subtítulo guardado en la base de datos!\n");

    const successSoundPath = path.join(__dirname, "..", "indexer", "success_short_high.wav");
    sound.play(successSoundPath);

    console.table([
      {
        imdbLink: getImdbLink(title.id),
        name: title.title_name,
        releaseGroupName,
        resolution,
        subtitleGroupName,
        subtitleLink: `${subtitleLink.slice(0, 100)}...`,
      },
    ]);
  } catch (error) {
    console.log("\n ~ error:", error);
    console.log("\n ~ error message:", error instanceof Error ? error.message : "");
  }
}

type TmdbMovie = TmdbTitle & { episode: null };
type TmdbTvShowEpisode = TmdbTvShow & { episode: string };
type CurrentTitle = TmdbMovie | TmdbTvShowEpisode;

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

const UNCOMPRESSED_SUBTITLES_FOLDER_NAME = "uncompressed-subtitles";
const COMPRESSED_SUBTITLES_FOLDER_NAME = "compressed-subtitles";
const TORRENTS_FOLDER_NAME = "torrents";

function createInitialFolders(): void {
  const FOLDERS = [UNCOMPRESSED_SUBTITLES_FOLDER_NAME, COMPRESSED_SUBTITLES_FOLDER_NAME, TORRENTS_FOLDER_NAME];

  for (const folder of FOLDERS) {
    const folderPath = path.join(__dirname, "..", "indexer", folder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  }
}

function getQueryForTorrentProvider(title: CurrentTitle): string {
  const { name, year, episode } = title;
  const parsedName = replaceSpecialCharacters(name.replace(/'/g, ""));

  return match(episode)
    .with(null, () => `${parsedName} ${year}`)
    .with(P.string, () => `${parsedName} ${episode}`)
    .exhaustive();
}

type PromiseTorrentResults = ReturnType<typeof tg.search>;
type TorrentResults = AsyncReturnType<typeof getTitleTorrents>;
type TorrentResult = ArrayValues<TorrentResults>;

async function getTitleTorrents(query: string): PromiseTorrentResults {
  return tg.search(query, { groupByTracker: false });
}

function getFilteredTorrents(torrents: TorrentResults, maxTorrents = 10, minSeeds = 15): TorrentResults {
  const CINEMA_RECORDING_REGEX = /\b(hdcam|hdcamrip|hqcam|hq-cam|telesync|hdts|hd-ts|c1nem4|qrips)\b/gi;

  return torrents
    .toSorted((torrentA, torrentB) => torrentB.seeds - torrentA.seeds)
    .slice(0, maxTorrents)
    .filter((torrent) => !torrent.title.match(CINEMA_RECORDING_REGEX))
    .filter(({ seeds }) => seeds > minSeeds);
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
  currentTitle,
  releaseGroups,
  subtitleGroups,
  isDebugging,
}: {
  index: string;
  currentTitle: CurrentTitle;
  releaseGroups: ReleaseGroupMap;
  subtitleGroups: SubtitleGroupMap;
  isDebugging: boolean;
}): Promise<void> {
  createInitialFolders();
  const titleProviderQuery = getQueryForTorrentProvider(currentTitle);

  const torrents = await getTitleTorrents(titleProviderQuery);
  const filteredTorrents = getFilteredTorrents(torrents);

  const { name, year, imdbId, rating, releaseDate, poster, backdrop, episode } = currentTitle;
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
      console.log(`No hay release group soportado para ${videoFile.name} \n`);
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
        console.log(`4.${index}.${torrentIndex}.${indexSubtitleProvider}) Buscando subtítulo en ${name}`);
        const subtitle = await getSubtitleFromProvider({ imdbId, titleFileNameMetadata, titleProviderQuery });

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

        await setSubtitlesToDatabase({
          titleFile: {
            bytes,
            fileName,
            fileNameExtension,
          },
          title: {
            id: imdbId,
            title_name: name,
            rating,
            release_date: releaseDate,
            year,
            poster,
            backdrop,
            type: TitleTypes.movie,
            episode,
          },
          releaseGroupName,
          subtitleGroupName,
          subtitle: { ...subtitle, resolution },
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
