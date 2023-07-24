const YTS_BASE_URL = "https://yts.mx/api/v2" as const;

const ytsApiEndpoints = {
  movieList: (page = 1, limit = 50) => {
    return `${YTS_BASE_URL}/list_movies.json?limit=${limit}&page=${page}`;
  },
};

export async function getYtsMxTotalMoviesAndPages(limit = 50): Promise<{
  totalMovies: number;
  totalPages: number;
}> {
  const response = await fetch(ytsApiEndpoints.movieList(1, 1));
  const { data } = await response.json();

  const totalMovies = (data as { movie_count: number }).movie_count;
  const totalPages = Math.ceil(totalMovies / limit);

  return { totalMovies, totalPages };
}

export type Torrent = {
  url: string;
  hash: string;
  quality: string;
  type: string;
  is_repack: string;
  video_codec: string;
  bit_depth: string;
  audio_channels: string;
  seeds: number;
  peers: number;
  size: string;
  size_bytes: number;
  date_uploaded: string;
  date_uploaded_unix: number;
};

export type YtsMxMovie = {
  id: number;
  url: string;
  imdb_code: string;
  title: string;
  title_english: string;
  title_long: string;
  slug: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  summary: string;
  description_full: string;
  synopsis: string;
  yt_trailer_code: string;
  language: string;
  mp_rating: string;
  background_image: string;
  background_image_original: string;
  small_cover_image: string;
  medium_cover_image: string;
  large_cover_image: string;
  state: string;
  torrents: Torrent[];
  date_uploaded: string;
  date_uploaded_unix: number;
};

export async function getYtsMxMovieList(
  page = 1,
  limit = 50,
): Promise<YtsMxMovie[]> {
  const response = await fetch(ytsApiEndpoints.movieList(page, limit));
  const { data } = await response.json();

  // TODO: Add zod schema here

  return data.movies as YtsMxMovie[];
}
