import { z } from 'zod';

// internals
import { getNumbersArray } from './utils';
import { getStripedImdbId } from './imdb';

// constants
const YTS_BASE_URL = 'https://yts.mx/api/v2' as const;

// utils
const ytsApiEndpoints = {
  movieList: (page = 1, limit = 50) => {
    return `${YTS_BASE_URL}/list_movies.json?limit=${limit}&page=${page}` as const;
  },
};

// schemas
export const torrentSchema = z.object({
  url: z.string(),
  hash: z.string(),
  quality: z.string(),
  type: z.string(),
  is_repack: z.string(),
  video_codec: z.string(),
  bit_depth: z.string(),
  audio_channels: z.string(),
  seeds: z.number(),
  peers: z.number(),
  size: z.string(),
  size_bytes: z.number(),
  date_uploaded: z.string().optional(),
  date_uploaded_unix: z.number().optional(),
});

export const ytsMxMovieSchema = z.object({
  id: z.number(),
  url: z.string(),
  imdb_code: z.string(),
  title: z.string(),
  title_english: z.string(),
  title_long: z.string(),
  slug: z.string(),
  year: z.number(),
  rating: z.number(),
  runtime: z.number(),
  genres: z.array(z.string()).nullable().optional(),
  summary: z.string(),
  description_full: z.string(),
  synopsis: z.string(),
  yt_trailer_code: z.string(),
  language: z.string(),
  background_image: z.string(),
  background_image_original: z.string(),
  small_cover_image: z.string(),
  medium_cover_image: z.string(),
  large_cover_image: z.string(),
  state: z.string(),
  torrents: z.array(torrentSchema),
  date_uploaded: z.string().optional(),
  date_uploaded_unix: z.number().optional(),
});

export const schema = z.object({
  status: z.string(),
  status_message: z.string(),
  data: z.object({
    movie_count: z.number(),
    limit: z.number(),
    page_number: z.number(),
    movies: z.array(ytsMxMovieSchema),
  }),
  '@meta': z.object({
    server_time: z.number(),
    server_timezone: z.string(),
    api_version: z.number(),
    execution_time: z.string(),
  }),
});

// types
type YtsMxMovie = z.infer<typeof ytsMxMovieSchema>;
export type Torrent = z.infer<typeof torrentSchema>;
export type YtsMxMovieList = YtsMxMovie & { imdbId: number };

// core fn
export async function getYtsMxTotalMoviesAndPages(limit = 50): Promise<{
  totalMovies: number;
  totalPages: number;
  totalPagesArray: number[];
}> {
  const response = await fetch(ytsApiEndpoints.movieList(1, 1));
  const data = await response.json();

  const parsedData = schema.parse(data);
  const totalMovies = parsedData.data.movie_count;

  const totalPages = Math.ceil(totalMovies / limit);
  const totalPagesArray = getNumbersArray(totalPages);

  return { totalMovies, totalPages, totalPagesArray };
}

export async function getYtsMxMovieList(page = 1, limit = 50): Promise<YtsMxMovieList[]> {
  const response = await fetch(ytsApiEndpoints.movieList(page, limit));
  const data = await response.json();

  const parsedData = schema.parse(data);
  const { movies } = parsedData.data;

  return movies.map((movie) => ({
    ...movie,
    imdbId: getStripedImdbId(movie.imdb_code),
  }));
}
