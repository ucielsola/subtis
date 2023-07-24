import { P, match } from "ts-pattern";

import { RELEASE_GROUPS, ReleaseGroupNames } from "./release-groups";
import { VIDEO_FILE_EXTENSIONS, removeExtraSpaces } from "./utils";

export function getMovieName(name: string): string {
  return removeExtraSpaces(name.replaceAll(".", " ")).trim();
}

export function getMovieData(movie: string): {
  name: string;
  year: number;
  resolution: string;
  searchableMovieName: string;
  searchableSubDivXName: string;
  releaseGroup: ReleaseGroupNames;
} {
  const FIRST_MOVIE_RECORDED = 1888;
  const currentYear = new Date().getFullYear() + 1;

  const cody = RELEASE_GROUPS.CODY;
  const ytsMx = RELEASE_GROUPS.YTS_MX;

  for (let year = FIRST_MOVIE_RECORDED; year < currentYear; year++) {
    const yearString = String(year);

    const yearStringToReplace = match(movie)
      .with(P.string.includes(`(${yearString})`), () => `(${yearString})`)
      .with(P.string.includes(yearString), () => yearString)
      .otherwise(() => false);

    if (yearStringToReplace && typeof yearStringToReplace === "string") {
      const [rawName, rawAttributes] = movie.split(yearStringToReplace);

      const movieName = getMovieName(rawName);
      const searchableMovieName = removeExtraSpaces(
        `${movieName} (${yearString})`,
      );

      const resolution = match(rawAttributes)
        .with(P.string.includes("1080"), () => "1080p")
        .with(P.string.includes("720"), () => "720p")
        .with(P.string.includes("2160"), () => "2160p")
        .with(P.string.includes("3D"), () => "3D")
        .run();

      for (const videoFileExtension of VIDEO_FILE_EXTENSIONS) {
        if (rawAttributes.includes(videoFileExtension)) {
          if (rawAttributes.includes(ytsMx.fileAttribute)) {
            return {
              name: movieName,
              searchableMovieName,
              year,
              resolution,
              releaseGroup: ytsMx.name,
              searchableSubDivXName: ytsMx.searchableSubDivXName,
            };
          }

          if (rawAttributes.includes(cody.fileAttribute)) {
            return {
              name: movieName,
              searchableMovieName,
              year,
              resolution,
              releaseGroup: cody.name,
              searchableSubDivXName: cody.searchableSubDivXName,
            };
          }

          const releaseGroup = rawAttributes
            .split(videoFileExtension)
            .at(0)
            ?.split(/\.|\s/g)
            .at(-1)
            ?.replace("x264-", "");

          return {
            name: movieName,
            searchableMovieName,
            year,
            resolution,
            searchableSubDivXName: releaseGroup as string,
            releaseGroup: releaseGroup as ReleaseGroupNames,
          };
        }
      }
    }
  }

  throw new Error("Couldn't parse movie name");
}
