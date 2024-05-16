import invariant from "tiny-invariant";
import { z } from "zod";

// shared
import type { TitleFileNameMetadata } from "@subtis/shared";

import { generateSubtitleFileNames } from "./subtitle-filenames";
import { SUBTITLE_GROUPS } from "./subtitle-groups";
// internals
import type { SubtitleData } from "./types";

// constants
const OPEN_SUBTITLES_BREADCRUMB_ERROR = "OPEN_SUBTITLES_ERROR" as const;
const OPEN_SUBTITLES_BASE_URL = "https://api.opensubtitles.com/api/v1" as const;

// utils
function getOpenSubtitlesApiKey(): string {
  const openSubtitlesApiKey = process.env.OPEN_SUBTITLES_API_KEY;
  return z.string().parse(openSubtitlesApiKey);
}

function getOpenSubtitlesHeaders(): {
  "Api-Key": string;
  "Content-Type": "application/json";
} {
  return {
    "Api-Key": getOpenSubtitlesApiKey(),
    "Content-Type": "application/json",
  };
}

// schemas
const subtitleDataSchema = z.object({
  attributes: z.object({
    ai_translated: z.boolean(),
    comments: z.string(),
    download_count: z.number(),
    feature_details: z.object({
      feature_id: z.number(),
      feature_type: z.string(),
      imdb_id: z.number(),
      movie_name: z.string(),
      title: z.string(),
      tmdb_id: z.number(),
      year: z.number(),
    }),
    files: z.array(
      z.object({
        cd_number: z.number(),
        file_id: z.number(),
        file_name: z.string(),
      }),
    ),
    foreign_parts_only: z.boolean(),
    fps: z.number(),
    from_trusted: z.boolean().nullable(),
    hd: z.boolean(),
    hearing_impaired: z.boolean(),
    language: z.string(),
    legacy_subtitle_id: z.number().nullable(),
    machine_translated: z.boolean(),
    new_download_count: z.number(),
    ratings: z.number(),
    related_links: z.array(
      z.object({
        img_url: z.string(),
        label: z.string(),
        url: z.string(),
      }),
    ),
    release: z.string(),
    subtitle_id: z.string(),
    upload_date: z.string(),
    uploader: z.object({
      name: z.string(),
      rank: z.string(),
      uploader_id: z.number().nullable(),
    }),
    votes: z.number(),
  }),
  id: z.string(),
  type: z.string(),
});

const subtitlesSchema = z.object({
  data: z.array(subtitleDataSchema),
  page: z.number(),
  per_page: z.number(),
  total_count: z.number(),
  total_pages: z.number(),
});

const downloadSchema = z.object({
  file_name: z.string(),
  link: z.string(),
  message: z.string(),
  remaining: z.number(),
  requests: z.number(),
  reset_time: z.string(),
  reset_time_utc: z.string(),
  ts: z.number(),
  uid: z.number(),
  uk: z.string(),
});

// core
export async function getOpenSubtitlesSubtitle({
  imdbId,
  titleFileNameMetadata,
}: {
  imdbId: number;
  titleFileNameMetadata: TitleFileNameMetadata;
}): Promise<SubtitleData> {
  const { fileNameWithoutExtension, name, releaseGroup, resolution } = titleFileNameMetadata;
  if (!releaseGroup) {
    throw new Error("release group undefined");
  }

  invariant(
    !String(imdbId).startsWith("tt"),
    `[${OPEN_SUBTITLES_BREADCRUMB_ERROR}]: imdbId should not start with 'tt'`,
  );

  const response = await fetch(`${OPEN_SUBTITLES_BASE_URL}/subtitles?imdb_id=${imdbId}&languages=es`, {
    headers: getOpenSubtitlesHeaders(),
  });
  const data = await response.json();

  const parsedData = subtitlesSchema.parse(data);
  invariant(parsedData.data, `[${OPEN_SUBTITLES_BREADCRUMB_ERROR}]: No subtitles data found`);

  const firstResult = parsedData.data.find((subtitle) => {
    const release = subtitle.attributes.release.toLowerCase();

    const hasMovieResolution = release.includes(resolution);
    const hasReleaseGroup = releaseGroup.searchable_opensubtitles_name.some((searchableOpenSubtitlesName) => {
      return release.includes(searchableOpenSubtitlesName.toLowerCase());
    });

    return hasMovieResolution && hasReleaseGroup;
  });

  invariant(firstResult, `[${OPEN_SUBTITLES_BREADCRUMB_ERROR}]: No subtitle data found`);

  const { files } = firstResult.attributes;
  const { file_id } = files[0];

  const downloadResponse = await fetch(`${OPEN_SUBTITLES_BASE_URL}/download`, {
    body: JSON.stringify({ file_id }),
    headers: getOpenSubtitlesHeaders(),
    method: "POST",
  });
  const downloadData = await downloadResponse.json();

  const parsedDownloadData = downloadSchema.parse(downloadData);
  invariant(parsedDownloadData.link, `[${OPEN_SUBTITLES_BREADCRUMB_ERROR}]: No download subtitle link found`);

  const fileExtension = "srt";
  const subtitleLink = parsedDownloadData.link;
  const subtitleGroup = SUBTITLE_GROUPS.OPEN_SUBTITLES.name;

  const subtitleFileNames = generateSubtitleFileNames({
    name,
    resolution,
    subtitleGroup,
    fileExtension,
    fileNameWithoutExtension,
    releaseGroupName: releaseGroup.name,
  });

  return {
    lang: "es",
    subtitleLink,
    fileExtension,
    subtitleGroup,
    ...subtitleFileNames,
  };
}
