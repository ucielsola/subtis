import { P, match } from "ts-pattern";
import { z } from "zod";

// indexer
import { RELEASE_GROUPS } from "@subtis/indexer/release-groups";

// shared
import { RESOLUTION_REGEX, getEpisode, getSeasonAndEpisode } from "@subtis/shared";

// internals
import { VIDEO_FILE_EXTENSIONS } from "../../files";
import { getTitleFileNameWithoutExtension } from "../get-title-file-name-without-extension/get-title-file-name-without-extension";
import { getTitleName } from "../get-title-name";

// types
export type TitleFileNameMetadata = ReturnType<typeof getTitleFileNameMetadata>;

// constants
export const RIP_TYPES_REGEX = /bluray|blu-ray|bdrip|brrip|webdl|web-dl|webrip|hdrip|repack|web|theater|/gi;

export function getTitleFileNameMetadata({
  titleFileName,
  titleName,
}: {
  titleFileName: string;
  titleName?: string;
}): {
  name: string;
  resolution: string;
  year: number | null;
  ripType: string | null;
  currentSeason: number | null;
  currentEpisode: number | null;
  fileNameWithoutExtension: string;
  releaseGroup: (typeof RELEASE_GROUPS)[keyof typeof RELEASE_GROUPS] | undefined;
} {
  const FIRST_MOVIE_RECORDED = 1888;
  const currentYear = new Date().getFullYear();

  const parsedMovieFileName = titleFileName.replace(/\s/g, ".");

  for (let year = FIRST_MOVIE_RECORDED; year <= currentYear; year++) {
    const yearString = String(year);

    const yearStringToReplace = match(parsedMovieFileName)
      .with(P.string.includes(`(${yearString})`), () => `(${yearString})`)
      .with(P.string.includes(yearString), () => yearString)
      .otherwise(() => false);

    if (!yearStringToReplace || typeof yearStringToReplace !== "string") {
      continue;
    }

    const [rawTitleName, rawAttributes] = parsedMovieFileName.split(yearStringToReplace);
    const parsedTitleName = getTitleName(rawTitleName);

    const episode = getEpisode(rawTitleName);
    const { current_season: currentSeason, current_episode: currentEpisode } = getSeasonAndEpisode(episode);

    const lowerCaseRawAttributes = rawAttributes.toLowerCase();
    const parsedRawAttributes = lowerCaseRawAttributes.includes("YTS")
      ? lowerCaseRawAttributes.replace("AAC", "")
      : lowerCaseRawAttributes;

    const result = lowerCaseRawAttributes.match(RIP_TYPES_REGEX);
    const ripType = result?.length ? (result.filter(Boolean)?.[0] ?? "")?.toLowerCase() : null;

    const videoFileExtension = VIDEO_FILE_EXTENSIONS.find((videoFileExtension) =>
      rawAttributes.includes(videoFileExtension),
    );
    z.string({ message: `Video file extension not supported: ${parsedMovieFileName}` }).parse(videoFileExtension);

    const resolution = match(rawAttributes)
      .with(P.string.includes("480"), () => "480p")
      .with(P.string.includes("576"), () => "576p")
      .with(P.string.includes("1080"), () => "1080p")
      .with(P.string.includes("720"), () => "720p")
      .with(P.string.includes("2160"), () => "2160p")
      .with(P.string.includes("3D"), () => "3D")
      .run();

    const fileNameWithoutExtension = getTitleFileNameWithoutExtension(parsedMovieFileName);

    const releaseGroup = Object.values(RELEASE_GROUPS).find((releaseGroupInternal) => {
      return releaseGroupInternal.matches.some((attribute) => parsedRawAttributes.includes(attribute.toLowerCase()));
    });

    const name = titleName || parsedTitleName;
    const filteredName = name
      .replace(/\sdirectors\scut/gi, "")
      .replace(/\sextended\sversion/gi, "")
      .replace(/\sextended/gi, "");

    return {
      year,
      ripType,
      resolution,
      releaseGroup,
      currentSeason,
      currentEpisode,
      fileNameWithoutExtension,
      name: filteredName,
    };
  }

  const [resolution] = titleFileName.match(RESOLUTION_REGEX) ?? [".S"];

  const [rawTitleName, rawAttributes] = parsedMovieFileName.split(resolution);
  const parsedTitleName = getTitleName(rawTitleName);

  const episode = getEpisode(rawTitleName);
  const { current_season: currentSeason, current_episode: currentEpisode } = getSeasonAndEpisode(episode);

  const lowerCaseRawAttributes = rawAttributes.toLowerCase();
  const parsedRawAttributes = lowerCaseRawAttributes.includes("YTS")
    ? lowerCaseRawAttributes.replace("AAC", "")
    : lowerCaseRawAttributes;

  const result = lowerCaseRawAttributes.match(RIP_TYPES_REGEX);
  const ripType = result?.length ? (result.filter(Boolean)?.[0] ?? "")?.toLowerCase() : null;

  const videoFileExtension = VIDEO_FILE_EXTENSIONS.find((videoFileExtension) =>
    rawAttributes.includes(videoFileExtension),
  );
  z.string({ message: `Video file extension not supported: ${parsedMovieFileName}` }).parse(videoFileExtension);

  const releaseGroup = Object.values(RELEASE_GROUPS).find((releaseGroupInternal) => {
    return releaseGroupInternal.matches.some((attribute) => parsedRawAttributes.includes(attribute.toLowerCase()));
  });

  const fileNameWithoutExtension = getTitleFileNameWithoutExtension(parsedMovieFileName);

  const name = titleName || parsedTitleName;
  const filteredName = name
    .replace(/\sdirectors\scut/gi, "")
    .replace(/\sextended\sversion/gi, "")
    .replace(/\sextended/gi, "");

  return {
    ripType,
    year: null,
    releaseGroup,
    currentSeason,
    currentEpisode,
    fileNameWithoutExtension,
    name: filteredName,
    resolution: resolution === ".S" ? "" : resolution,
  };
}
