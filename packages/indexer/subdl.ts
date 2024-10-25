import { z } from "zod";

// internals
import type { TitleTypes } from "./app";
import { getFullImdbId } from "./imdb";

// constants
const SUBDL_API_BASE_URL = "https://api.subdl.com/api/v1/subtitles";

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
export type SubdlSubtitles = SubdlSubtitle[];

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
  const baseUrl = `${SUBDL_API_BASE_URL}?api_key=${process.env.SUBDL_API_KEY}&imdb_id=${getFullImdbId(imdbId)}&subs_per_page=30&languages=es`;

  const movieSubdlUrl = baseUrl;
  const tvShowSubdlUrl = `${baseUrl}&season_number=${currentSeason}&episode_number=${currentEpisode}`;

  const subdlUrl = titleType === "movie" ? movieSubdlUrl : tvShowSubdlUrl;

  const response = await fetch(subdlUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const data = await response.json();
  console.log("\n ~ data:", data);

  const errorData = errorSchema.safeParse(data);
  console.log("\n ~ errorData:", errorData);

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
}
