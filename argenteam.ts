import { z } from "zod";
import slugify from "slugify";
import { match } from "ts-pattern";
import invariant from "tiny-invariant";

import { getMovieData } from "./movie";
import { SUBTITLE_GROUPS } from "./subtitle-groups";

// Argenteam endpoints
const ARGENTEAM_BASE_URL = "https://argenteam.net/api/v1" as const;

const argenteamApiEndpoints = {
  search: (query: string) => {
    return `${ARGENTEAM_BASE_URL}/search?q=${query}`;
  },
  tvShow: (id: number) => {
    return `${ARGENTEAM_BASE_URL}/tvshow?id=${id}`;
  },
  episode: (id: number) => {
    return `${ARGENTEAM_BASE_URL}/episode?id=${id}`;
  },
  movie: (id: number) => {
    return `${ARGENTEAM_BASE_URL}/movie?id=${id}`;
  },
};

// Schemas
const argenteamSearchResultSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: z.string(),
  summary: z.string(),
  imdb: z.string(),
  poster: z.string(),
});

const argenteamSearchSchema = z.object({
  results: z.array(argenteamSearchResultSchema),
  total: z.number(),
  offset: z.number(),
});

const argenteamResourceInfoSchema = z.object({
  title: z.string(),
  imdb: z.string(),
  year: z.number(),
  rating: z.number(),
  runtime: z.number().nullable().optional(),
  alternativeTitle: z.string(),
  country: z.string().nullable().optional(),
  poster: z.string(),
  director: z.string(),
  actors: z.string(),
});

const argenteamResourceSubtitlesSchema = z.object({
  uri: z.string(),
  count: z.number(),
});

const argenteamResourceReleaseSchema = z.object({
  source: z.string(),
  codec: z.string(),
  team: z.string(),
  tags: z.string(),
  size: z.string(),
  torrents: z.any(),
  elinks: z.any(),
  subtitles: z.array(argenteamResourceSubtitlesSchema),
});

const argenteamResourceSchema = z.object({
  id: z.number(),
  title: z.string(),
  summary: z.string(),
  info: argenteamResourceInfoSchema,
  releases: z.array(argenteamResourceReleaseSchema),
});

export async function getArgenteamSubtitleLink(
  movieFileName: string,
  imdbId: string,
): Promise<{
  fileExtension: "zip";
  subtitleLink: string;
  subtitleGroup: string;
  subtitleSrtFileName: string;
  subtitleCompressedFileName: string;
  subtitleFileNameWithoutExtension: string;
}> {
  // 0. Get movie data
  const { name, resolution, releaseGroup, searchableArgenteamName } =
    getMovieData(movieFileName);

  // 1. Parse imdb id
  const parsedImdbId = imdbId.replace("tt", "");

  // 2. Get argenteam search results
  const argenteamSearchEndpoint = argenteamApiEndpoints.search(parsedImdbId);
  const searchResponse = await fetch(argenteamSearchEndpoint);
  const rawSearchData = await searchResponse.json();

  const { results } = argenteamSearchSchema.parse(rawSearchData);
  invariant(results.length > 0, "There should be at least one result");

  // 3. Get argenteam resource data
  const { id, type } = results[0];

  const argenteamResourceEndpoint = match(type)
    .with("movie", () => argenteamApiEndpoints.movie(id))
    .with("episode", () => argenteamApiEndpoints.episode(id))
    .with("tvshow", () => argenteamApiEndpoints.tvShow(id))
    .otherwise(() => {
      throw new Error(`type ${type} not supported`);
    });

  const resourceResponse = await fetch(argenteamResourceEndpoint);
  const rawResourceData = await resourceResponse.json();

  // 4. Filter releases by release group and quality
  const { releases } = argenteamResourceSchema.parse(rawResourceData);

  const searchableTeam = searchableArgenteamName.toLowerCase();
  const release = releases.find(
    (release) =>
      release.team.toLowerCase() === searchableTeam &&
      release.tags.includes(resolution),
  );
  invariant(release, "Release should exist");

  // 5. Get subtitle link
  const { subtitles } = release;
  invariant(subtitles.length > 0, "There should be at least one subtitle");

  const subtitleLink = subtitles[0].uri;

  // 6. Create extra needed strings
  const fileExtension = "zip";
  const subtitleGroup = SUBTITLE_GROUPS.ARGENTEAM.name;

  const subtitleSrtFileName = slugify(
    `${name}-${resolution}-${releaseGroup}-argenteam.srt`,
  ).toLowerCase();

  const subtitleFileNameWithoutExtension = slugify(
    `${name}-${resolution}-${releaseGroup}-argenteam`,
  ).toLowerCase();

  const subtitleCompressedFileName = slugify(
    `${name}-${resolution}-${releaseGroup}-argenteam.zip`,
  ).toLowerCase();

  return {
    subtitleLink,
    fileExtension,
    subtitleGroup,
    subtitleSrtFileName,
    subtitleCompressedFileName,
    subtitleFileNameWithoutExtension,
  };
}
