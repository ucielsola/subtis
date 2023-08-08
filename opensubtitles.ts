import "dotenv/config";
import slugify from "slugify";
import invariant from "tiny-invariant";

import { SUBTITLE_GROUPS } from "./subtitle-groups";
import { ReleaseGroupNames } from "./release-groups";

const OPEN_SUBTITLES_BASE_URL = "https://api.opensubtitles.com/api/v1" as const;

// TODO: Save API-KEY to an env
const headers = {
  "Content-Type": "application/json",
  "Api-Key": process.env.OPEN_SUBTITLES_API_KEY as string,
};

// TODO: Reach out to OpenSubtitles for a higher quota

export async function getOpenSubtitlesSubtitleLink(
  movieData: {
    name: string;
    year: number;
    resolution: string;
    searchableMovieName: string;
    searchableSubDivXName: string;
    searchableArgenteamName: string;
    releaseGroup: ReleaseGroupNames;
  },
  imdbId: string,
) {
  try {
    const { name, resolution, releaseGroup } = movieData;
    const parsedImdbId = imdbId.replace("tt", "");

    const response = await fetch(
      `${OPEN_SUBTITLES_BASE_URL}/subtitles?imdb_id=${parsedImdbId}&languages=es`,
      { headers },
    );
    const data = await response.json();

    // @ts-expect-error
    if (data?.data) {
      // @ts-expect-error
      const firstResult = data.data[0];

      invariant(firstResult, "No data found");

      const { files } = firstResult.attributes;
      const { file_id: fileId } = files[0];
      console.table(files);

      const response2 = await fetch(`${OPEN_SUBTITLES_BASE_URL}/download`, {
        headers,
        body: JSON.stringify({ file_id: fileId }),
        method: "POST",
      });
      const data2 = await response2.json();
      console.log("\n ~ data2:", data2);

      // @ts-expect-error
      invariant(data2?.link, "No data found");

      const fileExtension = "srt";

      // @ts-expect-error
      const subtitleLink = data2?.link;
      const subtitleGroup = SUBTITLE_GROUPS.OPEN_SUBTITLES.name;

      const subtitleSrtFileName = slugify(
        `${name}-${resolution}-${releaseGroup}-opensubtitles.srt`,
      ).toLowerCase();
      const subtitleFileNameWithoutExtension = slugify(
        `${name}-${resolution}-${releaseGroup}-opensubtitles`,
      ).toLowerCase();
      const subtitleCompressedFileName = slugify(
        `${name}-${resolution}-${releaseGroup}-opensubtitles.${fileExtension}`,
      ).toLowerCase();

      return {
        fileExtension,
        subtitleLink,
        subtitleGroup,
        subtitleSrtFileName,
        subtitleCompressedFileName,
        subtitleFileNameWithoutExtension,
      };
    }

    invariant(false, "No data found");

    console.log("\n ~ getOpenSubtitlesSubtitleLink ~ data:", data);
  } catch (error) {
    console.log("\n ~ getOpenSubtitlesSubtitleLink ~ error:", error);
  }
}
