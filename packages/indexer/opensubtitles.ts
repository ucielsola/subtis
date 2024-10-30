import invariant from "tiny-invariant";
import { z } from "zod";

// shared
import type { TitleFileNameMetadata } from "@subtis/shared";

// internals
import type { TitleTypes } from "./app";
import { generateSubtitleFileNames } from "./subtitle-filenames";
import { SUBTITLE_GROUPS } from "./subtitle-groups";
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
  "User-Agent": string;
  "Content-Type": "application/json";
} {
  return {
    "User-Agent": "Subtis v0.4.1",
    "Content-Type": "application/json",
    "Api-Key": getOpenSubtitlesApiKey(),
  };
}

// schemas
const subtitleDataSchema = z.object({
  attributes: z.object({
    ai_translated: z.boolean(),
    comments: z.string().nullable(),
    download_count: z.number(),
    feature_details: z.union([
      z.object({
        feature_id: z.number(),
        feature_type: z.string(),
        imdb_id: z.number(),
        movie_name: z.string(),
        title: z.string(),
        tmdb_id: z.number().nullable(),
        year: z.number().nullable(),
      }),
      z.object({
        feature_id: z.number(),
        feature_type: z.string(),
        imdb_id: z.number(),
        movie_name: z.string(),
        title: z.string(),
        tmdb_id: z.number().nullable(),
        year: z.number().nullable(),
        season_number: z.number(),
        episode_number: z.number(),
        parent_imdb_id: z.number(),
        parent_title: z.string(),
        parent_tmdb_id: z.number(),
        parent_feature_id: z.number(),
      }),
    ]),
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
      z.union([
        z.object({
          img_url: z.string(),
          label: z.string(),
          url: z.string(),
        }),
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      ]),
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

export type OpenSubtitlesSubtitles = z.infer<typeof subtitlesSchema>;

// core
export async function getSubtitlesFromOpenSubtitlesForTitle({
  imdbId,
  titleType,
  currentSeason,
  currentEpisode,
}: {
  imdbId: string;
  titleType: TitleTypes;
  currentSeason: number | null;
  currentEpisode: number | null;
}): Promise<OpenSubtitlesSubtitles | null> {
  try {
    const titleTypeParam = titleType === "movie" ? "imdb_id" : "parent_imdb_id";
    const tvShowParam =
      titleType === "tv-show" ? `&season_number=${currentSeason}&episode_number=${currentEpisode}` : "";

    const URL = `${OPEN_SUBTITLES_BASE_URL}/subtitles?${titleTypeParam}=${imdbId}${tvShowParam}&languages=es`;

    const headers = getOpenSubtitlesHeaders();
    const response = await fetch(URL, { headers });

    if (!response.ok) {
      throw new Error(`[${OPEN_SUBTITLES_BREADCRUMB_ERROR}]: ${response.statusText}`);
    }

    const data = await response.json();

    return subtitlesSchema.parse(data);
  } catch (error) {
    console.log("Couldn't get subtitles from OpenSubtitles");
    console.log("\n ~ getSubtitlesFromOpenSubtitlesForTitle ~ error:", error);
    return null;
  }
}

export async function filterOpenSubtitleSubtitlesForTorrent({
  episode,
  subtitles,
  titleFileNameMetadata,
}: {
  episode: string | null;
  subtitles: OpenSubtitlesSubtitles;
  titleFileNameMetadata: TitleFileNameMetadata;
}): Promise<SubtitleData> {
  const { fileNameWithoutExtension, name, releaseGroup, resolution } = titleFileNameMetadata;

  if (!releaseGroup) {
    throw new Error("Release group undefined");
  }

  const firstResult = subtitles.data.find((subtitle) => {
    const release = subtitle.attributes.release.toLowerCase();
    const comments = subtitle.attributes?.comments?.toLowerCase() ?? "";

    const hasResolution = release.includes(resolution) || comments.includes(resolution);
    const hasReleaseGroup = releaseGroup.query_matches.some((queryMatch) => {
      const lowerCaseQueryMatch = queryMatch.toLowerCase();

      return release.includes(lowerCaseQueryMatch) || comments.includes(lowerCaseQueryMatch);
    });

    const hasFileName =
      release.includes(fileNameWithoutExtension.toLowerCase()) ||
      comments.includes(fileNameWithoutExtension.toLowerCase());

    return hasFileName || (hasResolution && hasReleaseGroup);
  });

  invariant(firstResult, `[${OPEN_SUBTITLES_BREADCRUMB_ERROR}]: No subtitle data found`);

  const { files } = firstResult.attributes;
  const { file_id } = files[0];

  const downloadResponse = await fetch(`${OPEN_SUBTITLES_BASE_URL}/download`, {
    method: "POST",
    body: JSON.stringify({ file_id }),
    headers: getOpenSubtitlesHeaders(),
  });
  const downloadData = await downloadResponse.json();

  const parsedDownloadData = downloadSchema.parse(downloadData);

  const fileExtension = "srt";
  const subtitleLink = parsedDownloadData.link;
  const subtitleGroupName = SUBTITLE_GROUPS.OPEN_SUBTITLES.subtitle_group_name;

  const subtitleFileNames = generateSubtitleFileNames({
    name,
    episode,
    resolution,
    fileExtension,
    subtitleGroupName,
    fileNameWithoutExtension,
    releaseGroupName: releaseGroup.release_group_name,
  });

  return {
    lang: "es",
    subtitleLink,
    fileExtension,
    subtitleGroupName,
    ...subtitleFileNames,
  };
}
