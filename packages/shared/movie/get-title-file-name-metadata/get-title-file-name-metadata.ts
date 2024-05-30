import { P, match } from "ts-pattern";
import { z } from "zod";

// indexer
import { RELEASE_GROUPS } from "@subtis/indexer/release-groups";

// internals
import { VIDEO_FILE_EXTENSIONS } from "../../files";
import { getMovieFileNameWithoutExtension } from "../get-movie-file-name-without-extension/get-movie-file-name-without-extension";
import { getTitleName } from "../get-title-name";

// types
export type TitleFileNameMetadata = ReturnType<typeof getTitleFileNameMetadata>;

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

    const lowerCaseRawAttributes = rawAttributes.toLowerCase();
    const parsedRawAttributes = lowerCaseRawAttributes.includes("YTS")
      ? lowerCaseRawAttributes.replace("AAC", "")
      : lowerCaseRawAttributes;

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

    const fileNameWithoutExtension = getMovieFileNameWithoutExtension(parsedMovieFileName);

    const releaseGroup = Object.values(RELEASE_GROUPS).find((releaseGroupInternal) => {
      return releaseGroupInternal.file_attributes.some((attribute) =>
        parsedRawAttributes.includes(attribute.toLowerCase()),
      );
    });

    return {
      year,
      resolution,
      releaseGroup,
      fileNameWithoutExtension,
      name: titleName || parsedTitleName,
    };
  }

  const resolutions = ["480p", "576p", "1080p", "720p", "2160p", "3D"];

  for (const resolution of resolutions) {
    if (!parsedMovieFileName.includes(resolution)) {
      continue;
    }

    const [rawTitleName, rawAttributes] = parsedMovieFileName.split(resolution);
    const parsedTitleName = getTitleName(rawTitleName);

    const lowerCaseRawAttributes = rawAttributes.toLowerCase();
    const parsedRawAttributes = lowerCaseRawAttributes.includes("YTS")
      ? lowerCaseRawAttributes.replace("AAC", "")
      : lowerCaseRawAttributes;

    const videoFileExtension = VIDEO_FILE_EXTENSIONS.find((videoFileExtension) =>
      rawAttributes.includes(videoFileExtension),
    );
    z.string({ message: `Video file extension not supported: ${parsedMovieFileName}` }).parse(videoFileExtension);

    const releaseGroup = Object.values(RELEASE_GROUPS).find((releaseGroupInternal) => {
      return releaseGroupInternal.file_attributes.some((attribute) =>
        parsedRawAttributes.includes(attribute.toLowerCase()),
      );
    });

    const fileNameWithoutExtension = getMovieFileNameWithoutExtension(parsedMovieFileName);

    return {
      year: null,
      resolution,
      releaseGroup,
      fileNameWithoutExtension,
      name: titleName || parsedTitleName,
    };
  }

  throw new Error("Couldn't parse the title file name metadata");
}
