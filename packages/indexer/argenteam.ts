import { z } from 'zod';
import slugify from 'slugify';
import { match } from 'ts-pattern';
import invariant from 'tiny-invariant';

// internals
import { SubtitleData } from './types';
import { SUBTITLE_GROUPS } from './subtitle-groups';

// shared
import { MovieData } from 'shared/movie';

// constants
const ARGENTEAM_BREADCRUMB_ERROR = 'ARGENTEAM_ERROR' as const;
const ARGENTEAM_BASE_URL = 'https://argenteam.net/api/v1' as const;

// utils
export const argenteamApiEndpoints = {
  search: (query: number) => {
    return `${ARGENTEAM_BASE_URL}/search?q=${query}` as const;
  },
  tvShow: (id: number) => {
    return `${ARGENTEAM_BASE_URL}/tvshow?id=${id}` as const;
  },
  episode: (id: number) => {
    return `${ARGENTEAM_BASE_URL}/episode?id=${id}` as const;
  },
  movie: (id: number) => {
    return `${ARGENTEAM_BASE_URL}/movie?id=${id}` as const;
  },
};

// schemas
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

// core
export async function getArgenteamSubtitle(movieData: MovieData, imdbId: number): Promise<SubtitleData> {
  const { name, resolution, releaseGroup, searchableArgenteamName } = movieData;

  // 1. Get argenteam search results
  const argenteamSearchEndpoint = argenteamApiEndpoints.search(imdbId);
  const searchResponse = await fetch(argenteamSearchEndpoint);
  const rawSearchData = await searchResponse.json();

  const { results } = argenteamSearchSchema.parse(rawSearchData);
  invariant(results.length > 0, `[${ARGENTEAM_BREADCRUMB_ERROR}]: There should be at least one result`);

  // 2. Get argenteam resource data
  const { id, type } = results[0];

  const argenteamResourceEndpoint = match(type)
    .with('movie', () => argenteamApiEndpoints.movie(id))
    .with('episode', () => argenteamApiEndpoints.episode(id))
    .with('tvshow', () => argenteamApiEndpoints.tvShow(id))
    .otherwise(() => {
      throw new Error(`type ${type} not supported`);
    });

  const resourceResponse = await fetch(argenteamResourceEndpoint);
  const rawResourceData = await resourceResponse.json();

  // 3. Filter releases by release group and quality
  const { releases } = argenteamResourceSchema.parse(rawResourceData);

  const searchableTeam = searchableArgenteamName.toLowerCase();
  const release = releases.find(
    (release) => release.team.toLowerCase() === searchableTeam && release.tags.includes(resolution),
  );
  invariant(release, `[${ARGENTEAM_BREADCRUMB_ERROR}]: Release should exist`);

  // 4. Get subtitle link
  const { subtitles } = release;
  invariant(subtitles.length > 0, `[${ARGENTEAM_BREADCRUMB_ERROR}]: There should be at least one subtitle`);

  const subtitleLink = subtitles[0].uri;

  // 5. Create extra needed strings
  const fileExtension = 'zip';
  const subtitleGroup = SUBTITLE_GROUPS.ARGENTEAM.name;

  const subtitleSrtFileName = slugify(`${name}-${resolution}-${releaseGroup}-${subtitleGroup}.srt`).toLowerCase();

  const subtitleFileNameWithoutExtension = slugify(
    `${name}-${resolution}-${releaseGroup}-${subtitleGroup}`,
  ).toLowerCase();

  const subtitleCompressedFileName = slugify(
    `${name}-${resolution}-${releaseGroup}-${subtitleGroup}.zip`,
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
