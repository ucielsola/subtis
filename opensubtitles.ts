import "dotenv/config";

import { z } from "zod";
import slugify from "slugify";
import invariant from "tiny-invariant";

import { SUBTITLE_GROUPS } from "./subtitle-groups";
import { ReleaseGroupNames } from "./release-groups";

// constants
const OPEN_SUBTITLES_BASE_URL = "https://api.opensubtitles.com/api/v1" as const;

// utils
function getOpenSubtitlesApiKey(): string {
  const openSubtitlesApiKey = process.env.OPEN_SUBTITLES_API_KEY;
  return z.string().parse(openSubtitlesApiKey);
}

function getOpenSubtitlesHeaders(): {
  "Content-Type": "application/json";
  "Api-Key": string;
} {
  return {
    "Content-Type": "application/json",
    "Api-Key": getOpenSubtitlesApiKey(),
  };
}

// schemas
const subtitleDataSchema = z.object({
  id: z.string(),
  type: z.string(),
  attributes: z.object({
    subtitle_id: z.string(),
    language: z.string(),
    download_count: z.number(),
    new_download_count: z.number(),
    hearing_impaired: z.boolean(),
    hd: z.boolean(),
    fps: z.number(),
    votes: z.number(),
    ratings: z.number(),
    from_trusted: z.boolean().nullable(),
    foreign_parts_only: z.boolean(),
    upload_date: z.string(),
    ai_translated: z.boolean(),
    machine_translated: z.boolean(),
    release: z.string(),
    comments: z.string(),
    legacy_subtitle_id: z.number().nullable(),
    uploader: z.object({
      name: z.string(),
      rank: z.string(),
      uploader_id: z.number().nullable(),
    }),
    feature_details: z.object({
      feature_id: z.number(),
      feature_type: z.string(),
      year: z.number(),
      title: z.string(),
      movie_name: z.string(),
      imdb_id: z.number(),
      tmdb_id: z.number(),
    }),
    related_links: z.array(
      z.object({
        label: z.string(),
        url: z.string(),
        img_url: z.string(),
      }),
    ),
    files: z.array(
      z.object({
        file_id: z.number(),
        cd_number: z.number(),
        file_name: z.string(),
      }),
    ),
  }),
});

const subtitlesSchema = z.object({
  total_pages: z.number(),
  total_count: z.number(),
  per_page: z.number(),
  page: z.number(),
  data: z.array(subtitleDataSchema),
});

const downloadSchema = z.object({
  link: z.string(),
  file_name: z.string(),
  requests: z.number(),
  remaining: z.number(),
  message: z.string(),
  reset_time: z.string(),
  reset_time_utc: z.string(),
  uk: z.string(),
  uid: z.number(),
  ts: z.number(),
});

export async function getOpenSubtitlesSubtitleLink(
  movieData: {
    name: string;
    year: number;
    resolution: string;
    releaseGroup: ReleaseGroupNames;
    searchableMovieName: string;
    searchableSubDivXName: string;
    searchableArgenteamName: string;
    searchableOpenSubtitlesName: string;
  },
  imdbId: number,
) {
  const { name, resolution, releaseGroup, searchableOpenSubtitlesName } =
    movieData;

  invariant(
    !String(imdbId).startsWith("tt"),
    "imdbId should not start with 'tt'",
  );

  const response = await fetch(
    `${OPEN_SUBTITLES_BASE_URL}/subtitles?imdb_id=${imdbId}&languages=es`,
    { headers: getOpenSubtitlesHeaders() },
  );
  const data = await response.json();

  const parsedData = subtitlesSchema.parse(data);
  invariant(parsedData.data, "No subtitles data found");

  const parsedReleaseGroup = searchableOpenSubtitlesName.toLowerCase();
  const firstResult = parsedData.data.find((subtitle) => {
    const release = subtitle.attributes.release.toLowerCase();
    return release.includes(parsedReleaseGroup) && release.includes(resolution);
  });
  invariant(firstResult, "No subtitle data found");

  const { files } = firstResult.attributes;
  const { file_id } = files[0];

  const downloadResponse = await fetch(`${OPEN_SUBTITLES_BASE_URL}/download`, {
    method: "POST",
    body: JSON.stringify({ file_id }),
    headers: getOpenSubtitlesHeaders(),
  });
  const downloadData = await downloadResponse.json();

  const parsedDownloadData = downloadSchema.parse(downloadData);
  invariant(parsedDownloadData.link, "No download subtitle link found");

  const fileExtension = "srt";
  const subtitleLink = parsedDownloadData.link;
  const subtitleGroup = SUBTITLE_GROUPS.OPEN_SUBTITLES.name;

  const subtitleSrtFileName = slugify(
    `${name}-${resolution}-${releaseGroup}-${subtitleGroup}.srt`,
  ).toLowerCase();
  const subtitleFileNameWithoutExtension = slugify(
    `${name}-${resolution}-${releaseGroup}-${subtitleGroup}`,
  ).toLowerCase();
  const subtitleCompressedFileName = slugify(
    `${name}-${resolution}-${releaseGroup}-${subtitleGroup}.${fileExtension}`,
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
