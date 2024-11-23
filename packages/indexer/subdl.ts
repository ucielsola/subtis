import invariant from "tiny-invariant";
import { z } from "zod";

// shared
import { type TitleFileNameMetadata, getIsCinemaRecording } from "@subtis/shared";

// internals
import type { TitleTypes } from "./app";
import { getFullImdbId } from "./imdb";
import { generateSubtitleFileNames } from "./subtitle-filenames";
import { SUBTITLE_GROUPS } from "./subtitle-groups";
import type { SubtitleData } from "./types";

// constants
const SUBDL_API_BASE_URL = "https://api.subdl.com/api/v1/subtitles";
const SUBDL_BREADCRUMB_ERROR = "SUBDL_ERROR" as const;

// schemas
const errorSchema = z.object({
  status: z.boolean(),
  error: z.string(),
});

const resultSchema = z.object({
  sd_id: z.number(),
  type: z.string(),
  name: z.string(),
  imdb_id: z.string(),
  tmdb_id: z.number(),
  first_air_date: z.string().nullable(),
  release_date: z.string(),
  year: z.number(),
});

const subtitleSchema = z.object({
  release_name: z.string(),
  name: z.string(),
  lang: z.string(),
  author: z.string(),
  url: z.string(),
  subtitlePage: z.string(),
  season: z.number(),
  episode: z.number().nullable(),
  language: z.string(),
  hi: z.boolean(),
  episode_from: z.number().nullable(),
  episode_end: z.number(),
  full_season: z.boolean(),
});

const dataSchema = z.object({
  status: z.boolean(),
  results: z.array(resultSchema),
  subtitles: z.array(subtitleSchema),
});

// types
type SubdlSubtitle = z.infer<typeof subtitleSchema>;

type SubdlSubtitleData = SubdlSubtitle & {
  subtitleLink: string;
};
export type SubdlSubtitles = SubdlSubtitleData[];

export async function getSubtitlesFromSubdl({
  imdbId,
  titleType,
  currentSeason,
  currentEpisode,
}: {
  imdbId: string;
  titleType: TitleTypes;
  currentSeason: number | null;
  currentEpisode: number | null;
}) {
  try {
    const baseUrl = `${SUBDL_API_BASE_URL}?api_key=${process.env.SUBDL_API_KEY}&imdb_id=${getFullImdbId(imdbId)}&subs_per_page=30&languages=es`;

    const movieSubdlUrl = baseUrl;
    const tvShowSubdlUrl = `${baseUrl}&season_number=${currentSeason}&episode_number=${currentEpisode}`;

    const subdlUrl = titleType === "movie" ? movieSubdlUrl : tvShowSubdlUrl;

    const response = await fetch(subdlUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const data = await response.json();
    const errorData = errorSchema.safeParse(data);

    if (errorData.success && errorData.data.status === false) {
      return null;
    }

    const parsedData = dataSchema.safeParse(data);

    if (parsedData.success && parsedData.data.status === false) {
      return null;
    }

    if (parsedData.success) {
      return parsedData.data.subtitles.map((subtitle) => ({
        ...subtitle,
        subtitleLink: `https://dl.subdl.com${subtitle.url}`,
      }));
    }

    return null;
  } catch (error) {
    console.log("Couldn't get subtitles from Subdl");
    console.log("\n ~ getSubtitlesFromSubdl ~ error:", error);
    return null;
  }
}

export async function filterSubdlSubtitlesForTorrent({
  episode,
  subtitles,
  titleFileNameMetadata,
}: {
  episode: string | null;
  subtitles: SubdlSubtitles;
  titleFileNameMetadata: TitleFileNameMetadata;
}): Promise<SubtitleData> {
  const { fileNameWithoutExtension, name, releaseGroup, resolution } = titleFileNameMetadata;

  if (!releaseGroup) {
    throw new Error("Release group undefined");
  }

  let subtitle: SubdlSubtitleData | undefined;

  const subtitlesWithoutCinemaRecordings = subtitles.filter((subtitle) => {
    return !getIsCinemaRecording(subtitle.release_name);
  });

  subtitle = subtitlesWithoutCinemaRecordings.find((subtitle) => {
    const release = subtitle.release_name.toLowerCase();

    const matchesResolution = release.includes(resolution);
    const matchesReleaseGroup = releaseGroup.matches.some((match) => {
      const lowerCaseMatch = match.toLowerCase();
      return release.includes(lowerCaseMatch);
    });

    const matchesRipType = titleFileNameMetadata.ripType ? release.includes(titleFileNameMetadata.ripType) : false;
    const isSameFileName = release === fileNameWithoutExtension.toLowerCase();

    return isSameFileName || (matchesResolution && matchesReleaseGroup && matchesRipType);
  });

  if (!subtitle) {
    subtitle = subtitlesWithoutCinemaRecordings.find((subtitle) => {
      const release = subtitle.release_name.toLowerCase();

      const matchesResolution = release.includes(resolution);
      const matchesReleaseGroup = releaseGroup.matches.some((match) => {
        const lowerCaseMatch = match.toLowerCase();
        return release.includes(lowerCaseMatch);
      });

      const isSameFileName = release === fileNameWithoutExtension.toLowerCase();

      return isSameFileName || (matchesResolution && matchesReleaseGroup);
    });
  }

  if (!subtitle) {
    subtitle = subtitles.find((subtitle) => {
      const release = subtitle.release_name.toLowerCase();

      const matchesResolution = release.includes(resolution);
      const matchesReleaseGroup = releaseGroup.matches.some((match) => {
        const lowerCaseMatch = match.toLowerCase();
        return release.includes(lowerCaseMatch);
      });

      const matchesRipType = titleFileNameMetadata.ripType ? release.includes(titleFileNameMetadata.ripType) : false;
      const isSameFileName = release === fileNameWithoutExtension.toLowerCase();

      return isSameFileName || (matchesResolution && matchesReleaseGroup && matchesRipType);
    });

    if (!subtitle) {
      subtitle = subtitles.find((subtitle) => {
        const release = subtitle.release_name.toLowerCase();

        const matchesResolution = release.includes(resolution);
        const matchesReleaseGroup = releaseGroup.matches.some((match) => {
          const lowerCaseMatch = match.toLowerCase();
          return release.includes(lowerCaseMatch);
        });

        const isSameFileName = release === fileNameWithoutExtension.toLowerCase();

        return isSameFileName || (matchesResolution && matchesReleaseGroup);
      });
    }
  }

  invariant(subtitle, `[${SUBDL_BREADCRUMB_ERROR}]: No subtitle data found`);

  const fileExtension = "zip";
  const subtitleLink = subtitle.subtitleLink;
  const subtitleGroupName = SUBTITLE_GROUPS.SUBDL.subtitle_group_name;

  const subtitleFileNames = generateSubtitleFileNames({
    name,
    episode,
    resolution,
    fileExtension,
    subtitleGroupName,
    fileNameWithoutExtension,
    releaseGroupName: releaseGroup.release_group_name,
  });

  const subtitleId = subtitleLink.split(/\//gi)[2].split(".")[0];

  return {
    lang: "es",
    subtitleLink,
    fileExtension,
    subtitleGroupName,
    externalId: subtitleId,
    ...subtitleFileNames,
  };
}
