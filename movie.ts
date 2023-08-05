import { P, match } from "ts-pattern";

import { VIDEO_FILE_EXTENSIONS, removeExtraSpaces } from "./utils";
import { RELEASE_GROUPS, ReleaseGroupNames } from "./release-groups";

export function getMovieName(name: string): string {
  return removeExtraSpaces(name.replaceAll(".", " ")).trim();
}

export function getMovieData(movie: string): {
  name: string;
  year: number;
  resolution: string;
  searchableMovieName: string;
  searchableSubDivXName: string;
  searchableArgenteamName: string;
  releaseGroup: ReleaseGroupNames;
} {
  const FIRST_MOVIE_RECORDED = 1888;
  const currentYear = new Date().getFullYear() + 1;

  const { CODY, YTS_MX, RIGHTNOW, GALAXY_RG } = RELEASE_GROUPS;

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
          if (rawAttributes.includes(YTS_MX.fileAttribute)) {
            return {
              name: movieName,
              searchableMovieName,
              year,
              resolution,
              releaseGroup: YTS_MX.name,
              searchableSubDivXName: YTS_MX.searchableSubDivXName,
              searchableArgenteamName: YTS_MX.searchableArgenteamName,
            };
          }

          if (rawAttributes.includes(CODY.fileAttribute)) {
            return {
              name: movieName,
              searchableMovieName,
              year,
              resolution,
              releaseGroup: CODY.name,
              searchableSubDivXName: CODY.searchableSubDivXName,
              searchableArgenteamName: CODY.searchableArgenteamName,
            };
          }

          if (rawAttributes.includes(GALAXY_RG.fileAttribute)) {
            return {
              name: movieName,
              searchableMovieName,
              year,
              resolution,
              releaseGroup: GALAXY_RG.name,
              searchableSubDivXName: GALAXY_RG.searchableSubDivXName,
              searchableArgenteamName: GALAXY_RG.searchableArgenteamName,
            };
          }

          if (rawAttributes.includes(RIGHTNOW.fileAttribute)) {
            return {
              name: movieName,
              searchableMovieName,
              year,
              resolution,
              releaseGroup: RIGHTNOW.name,
              searchableSubDivXName: RIGHTNOW.searchableSubDivXName,
              searchableArgenteamName: RIGHTNOW.searchableArgenteamName,
            };
          }

          const releaseGroup = rawAttributes
            .split(videoFileExtension)
            .at(0)
            ?.split(/\.|\s/g)
            .at(-1)
            ?.replace("x264-", "");

          console.warn(
            `⚠️ ⚠️ ⚠️ ☢️ ☢️ ☢️ Release Group not supported in DB, ${releaseGroup}`,
          );

          return {
            name: movieName,
            searchableMovieName,
            year,
            resolution,
            searchableSubDivXName: releaseGroup as string,
            searchableArgenteamName: releaseGroup as string,
            releaseGroup: releaseGroup as ReleaseGroupNames,
          };
        }
      }
    }
  }

  throw new Error("Couldn't parse movie name");
}
