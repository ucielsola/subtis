// import dayjs from "dayjs";
import z from "zod";

// internals
import { getStripedImdbId } from "./imdb";
import { getNumbersArray } from "./utils";

// schemas
export const tmdbDiscoverMovieSchema = z.object({
  page: z.number(),
  results: z.array(
    z.object({
      adult: z.boolean(),
      backdrop_path: z.string().nullable(),
      genre_ids: z.array(z.number()),
      id: z.number(),
      original_language: z.string(),
      original_title: z.string(),
      overview: z.string(),
      popularity: z.number(),
      poster_path: z.string().nullable(),
      release_date: z.string(),
      title: z.string(),
      video: z.boolean(),
      vote_average: z.number(),
      vote_count: z.number(),
    }),
  ),
  total_pages: z.number(),
  total_results: z.number(),
});

export const tmdbDiscoverSerieSchema = z.object({
  page: z.number(),
  results: z.array(
    z.object({
      adult: z.boolean(),
      backdrop_path: z.string().nullable(),
      genre_ids: z.array(z.number()),
      id: z.number(),
      origin_country: z.array(z.string()),
      original_language: z.string(),
      original_name: z.string(),
      overview: z.string(),
      popularity: z.number(),
      poster_path: z.string().nullable(),
      first_air_date: z.string(),
      name: z.string(),
      vote_average: z.number(),
      vote_count: z.number(),
    }),
  ),
  total_pages: z.number(),
  total_results: z.number(),
});

export const tmdbMovieSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  belongs_to_collection: z
    .object({
      backdrop_path: z.string().nullable(),
      id: z.number(),
      name: z.string(),
      poster_path: z.string().nullable(),
    })
    .nullable(),
  budget: z.number(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  homepage: z.string(),
  id: z.number(),
  imdb_id: z.string().nullable(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  production_companies: z.array(
    z.union([
      z.object({
        id: z.number(),
        logo_path: z.string(),
        name: z.string(),
        origin_country: z.string(),
      }),
      z.object({
        id: z.number(),
        logo_path: z.null(),
        name: z.string(),
        origin_country: z.string(),
      }),
    ]),
  ),
  production_countries: z.array(z.object({ iso_3166_1: z.string(), name: z.string() })),
  release_date: z.string(),
  revenue: z.number(),
  runtime: z.number(),
  spoken_languages: z.array(
    z.object({
      english_name: z.string(),
      iso_639_1: z.string(),
      name: z.string(),
    }),
  ),
  status: z.string(),
  tagline: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});

export const tmdbTvShowSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  created_by: z.array(
    z.object({
      id: z.number(),
      credit_id: z.string(),
      name: z.string(),
      original_name: z.string(),
      gender: z.number(),
      profile_path: z.string().nullable(),
    }),
  ),
  episode_run_time: z.array(z.unknown()),
  first_air_date: z.string(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  homepage: z.string(),
  id: z.number(),
  in_production: z.boolean(),
  languages: z.array(z.string()),
  last_air_date: z.string().nullable(),
  last_episode_to_air: z
    .object({
      id: z.number(),
      overview: z.string(),
      name: z.string(),
      vote_average: z.number(),
      vote_count: z.number(),
      air_date: z.string(),
      episode_number: z.number(),
      episode_type: z.string(),
      production_code: z.string(),
      runtime: z.number().nullable(),
      season_number: z.number(),
      show_id: z.number().nullable().optional(),
      still_path: z.string().nullable(),
    })
    .nullable(),
  name: z.string(),
  next_episode_to_air: z
    .object({
      id: z.number(),
      overview: z.string(),
      name: z.string(),
      vote_average: z.number(),
      vote_count: z.number(),
      air_date: z.string(),
      episode_number: z.number(),
      episode_type: z.string(),
      production_code: z.string(),
      runtime: z.number().nullable(),
      season_number: z.number(),
      show_id: z.number().nullable().optional(),
      still_path: z.string().nullable(),
    })
    .nullable(),
  networks: z.array(
    z.object({
      id: z.number(),
      logo_path: z.string().nullable(),
      name: z.string(),
      origin_country: z.string(),
    }),
  ),
  number_of_episodes: z.number().nullable(),
  number_of_seasons: z.number(),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_name: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  production_companies: z.array(
    z.union([
      z.object({
        id: z.number(),
        logo_path: z.string(),
        name: z.string(),
        origin_country: z.string(),
      }),
      z.object({
        id: z.number(),
        logo_path: z.null(),
        name: z.string(),
        origin_country: z.string(),
      }),
    ]),
  ),
  production_countries: z.array(z.object({ iso_3166_1: z.string(), name: z.string() })),
  seasons: z.array(
    z.object({
      air_date: z.string().nullable(),
      episode_count: z.number(),
      id: z.number(),
      name: z.string(),
      overview: z.string(),
      poster_path: z.string().nullable(),
      season_number: z.number(),
      vote_average: z.number(),
    }),
  ),
  spoken_languages: z.array(
    z.object({
      english_name: z.string(),
      iso_639_1: z.string(),
      name: z.string(),
    }),
  ),
  status: z.string(),
  tagline: z.string(),
  type: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
});

const tmdbTvShowExternalIdsSchema = z.object({
  imdb_id: z.string().nullable(),
});

const tmdbImageSchema = z.object({
  id: z.number(),
  backdrops: z.array(
    z.object({
      aspect_ratio: z.number(),
      height: z.number(),
      iso_639_1: z.string(),
      file_path: z.string(),
      vote_average: z.number(),
      vote_count: z.number(),
      width: z.number(),
    }),
  ),
  logos: z.array(
    z.object({
      aspect_ratio: z.number(),
      height: z.number(),
      iso_639_1: z.string(),
      file_path: z.string(),
      vote_average: z.number(),
      vote_count: z.number(),
      width: z.number(),
    }),
  ),
  posters: z.array(
    z.object({
      aspect_ratio: z.number(),
      height: z.number(),
      iso_639_1: z.string(),
      file_path: z.string(),
      vote_average: z.number(),
      vote_count: z.number(),
      width: z.number(),
    }),
  ),
});

// constants
const TMDB_OPTIONS = {
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
  },
  method: "GET",
};

// helpers
function generateTmdbDiscoverMovieUrl(page: number, year: number, isDebugging: boolean) {
  if (isDebugging) {
    return `https://api.themoviedb.org/3/discover/movie?language=es-ES&page=${page}&with_original_language=en&primary_release_year=${year}`;
  }
  return `https://api.themoviedb.org/3/discover/movie?language=es-ES&page=${page}&with_original_language=en&primary_release_year=${year}`;

  // TODO: Check why the following filters doesn't work properly
  // return `https://api.themoviedb.org/3/discover/movie?language=es-ES&page=${page}&with_original_language=en&primary_release_date.gte=${dayjs(
  //   `${year}`,
  // )
  //   .startOf("year")
  //   .format("YYYY-MM-DD")}&primary_release_date.lte=${dayjs(`${year}`)
  //   .endOf("year")
  //   .format("YYYY-MM-DD")}&sort_by=primary_release_date.asc&region=US&with_runtime.gte=60`;
}

function generateTmdbDiscoverSeriesUrl(page: number, year: number) {
  return `https://api.themoviedb.org/3/discover/tv?language=es-ES&page=${page}&first_air_date_year=${year}&sort_by=popularity.desc&with_original_language=en`;
}

export async function getTmdbMoviesTotalPagesArray(
  year: number,
  isDebugging: boolean,
): Promise<{ totalPages: number[]; totalResults: number }> {
  const url = generateTmdbDiscoverMovieUrl(1, year, isDebugging);

  const response = await fetch(url, TMDB_OPTIONS);
  const data = await response.json();

  const validatedData = tmdbDiscoverMovieSchema.parse(data);
  const totalPages = getNumbersArray(validatedData.total_pages);

  return { totalPages, totalResults: validatedData.total_results };
}

export async function getTmdbTvShowsTotalPagesArray(
  year: number,
): Promise<{ totalPages: number[]; totalResults: number }> {
  const url = generateTmdbDiscoverSeriesUrl(1, year);

  const response = await fetch(url, TMDB_OPTIONS);
  const data = await response.json();

  const validatedData = tmdbDiscoverSerieSchema.parse(data);
  const totalPages = getNumbersArray(validatedData.total_pages);

  return { totalPages, totalResults: validatedData.total_results };
}

const tmdbApiEndpoints = {
  discoverMovies: (page: number, year: number, isDebugging: boolean) => {
    return generateTmdbDiscoverMovieUrl(page, year, isDebugging);
  },
  discoverTvShows: (page: number, year: number) => {
    return generateTmdbDiscoverSeriesUrl(page, year);
  },
  movieDetail: (id: number) => {
    return `https://api.themoviedb.org/3/movie/${id}&language=es-ES&with_original_language=en`;
  },
  movieImages: (id: number) => {
    return `https://api.themoviedb.org/3/movie/${id}/images?include_image_language=en`;
  },
  tvShowDetail: (id: number) => {
    return `https://api.themoviedb.org/3/tv/${id}`;
  },
  tvShowImages: (id: number) => {
    return `https://api.themoviedb.org/3/tv/${id}/images?include_image_language=en`;
  },
  tvShowExternalIds: (id: number) => {
    return `https://api.themoviedb.org/3/tv/${id}/external_ids`;
  },
  movieSearch: (title: string, year?: number) => {
    if (year) {
      return `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&primary_release_year=${year}&language=es-ES`;
    }

    return `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=es-ES`;
  },
  tvShowSearch: (title: string, year?: number) => {
    if (year) {
      return `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(title)}&primary_release_year=${year}&language=es-ES`;
    }

    return `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(title)}&language=es-ES`;
  },
};

export type TmdbTitle = {
  imdbId: number;
  imdbLink: string;
  rating: number;
  overview: string;
  spanishName: string;
  releaseDate: string;
  name: string;
  year: number;
  logo: string | null;
  poster: string | null;
  backdrop: string | null;
};

export type TmdbTvShow = TmdbTitle & {
  episodes: string[];
  totalSeasons: number | null;
  totalEpisodes: number | null;
};

function generateTmdbImageUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }

  return `https://image.tmdb.org/t/p/original${path}`;
}

export async function getMovieMetadataFromTmdbMovie({
  id,
  name,
  spanishName,
  overview,
  posterPath,
  releaseDate,
  voteAverage,
  backdropPath,
}: {
  id: number;
  name: string;
  spanishName: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  posterPath: string | null;
  backdropPath: string | null;
}) {
  // 1. Get IMDB ID from TMDB movie detail
  const url = tmdbApiEndpoints.movieDetail(id);

  const response = await fetch(url, TMDB_OPTIONS);
  const data = await response.json();
  const { imdb_id } = tmdbMovieSchema.parse(data);

  // 2. Parse raw imdb_id
  const imdbId = getStripedImdbId(imdb_id ?? "");

  // 3. Get year from release date
  const year = Number(releaseDate.split("-")[0]);

  // 4. Get movie title image
  const logo = await getTmdbMovieLogoUrl(id);

  return {
    year,
    name,
    logo,
    imdbId,
    overview,
    spanishName,
    releaseDate,
    rating: voteAverage,
    poster: generateTmdbImageUrl(posterPath),
    backdrop: generateTmdbImageUrl(backdropPath),
    imdbLink: imdbId ? `https://www.imdb.com/title/tt${imdbId}` : "-",
  };
}

export async function getMoviesFromTmdb(page: number, year: number, isDebugging: boolean): Promise<TmdbTitle[]> {
  const movies: TmdbTitle[] = [];

  // 1. Get movies for current page
  const url = tmdbApiEndpoints.discoverMovies(page, year, isDebugging);

  const response = await fetch(url, TMDB_OPTIONS);
  const data = await response.json();
  const validatedData = tmdbDiscoverMovieSchema.parse(data);

  // 2. Iterate movies for current page
  for await (const movie of validatedData.results) {
    const {
      id,
      overview,
      title: spanishName,
      original_title: name,
      release_date: releaseDate,
      vote_average: voteAverage,
      poster_path: posterPath,
      backdrop_path: backdropPath,
    } = movie;

    const movieData = await getMovieMetadataFromTmdbMovie({
      id,
      name,
      overview,
      spanishName,
      posterPath,
      releaseDate,
      voteAverage,
      backdropPath,
    });

    movies.push(movieData);
  }

  return movies;
}

export async function getTvShowMetadataFromTmdbTvShow({
  id,
  name,
  overview,
  spanishName,
  posterPath,
  releaseDate,
  voteAverage,
  backdropPath,
}: {
  id: number;
  name: string;
  spanishName: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  posterPath: string | null;
  backdropPath: string | null;
}) {
  // 1. Get IMDB ID from TMDB movie detail
  const tvShowExternalIdsUrl = tmdbApiEndpoints.tvShowExternalIds(id);

  const externalIdsResponse = await fetch(tvShowExternalIdsUrl, TMDB_OPTIONS);
  const externalIdsData = await externalIdsResponse.json();
  const { imdb_id } = tmdbTvShowExternalIdsSchema.parse(externalIdsData);

  // 2. Parse raw imdb_id
  const imdbId = getStripedImdbId(imdb_id ?? "");

  // 3. Get year from release date
  const year = Number(releaseDate.split("-")[0]);

  // 4. Get TV Show metadata
  const tvShowDetailUrl = tmdbApiEndpoints.tvShowDetail(id);

  const tvShowDetailResponse = await fetch(tvShowDetailUrl, TMDB_OPTIONS);
  const tvShowDetailData = await tvShowDetailResponse.json();

  const data = tmdbTvShowSchema.parse(tvShowDetailData);

  // 5. Get TV show logo
  const logo = await getTmdbTvShoweLogoUrl(id);

  const episodes = data.seasons.flatMap((season) => {
    const { season_number: seasonNumber, episode_count: episodeCount } = season;

    if (seasonNumber === 0) {
      return [];
    }

    const seasonEpisodes: string[] = [];

    for (let episode = 1; episode <= episodeCount; episode++) {
      seasonEpisodes.push(
        `S${seasonNumber < 10 ? `0${seasonNumber}` : seasonNumber}E${episode < 10 ? `0${episode}` : episode}`,
      );
    }

    return seasonEpisodes;
  });

  return {
    year,
    name,
    logo,
    imdbId,
    overview,
    episodes,
    spanishName,
    releaseDate,
    rating: voteAverage,
    totalSeasons: data.number_of_seasons,
    totalEpisodes: data.number_of_episodes,
    poster: generateTmdbImageUrl(posterPath),
    backdrop: generateTmdbImageUrl(backdropPath),
    imdbLink: imdbId ? `https://www.imdb.com/title/tt${imdbId}` : "-",
  };
}

export async function getTvShowsFromTmdb(page: number, year: number): Promise<TmdbTvShow[]> {
  const tvShows: TmdbTvShow[] = [];

  // 1. Get movies for current page
  const url = tmdbApiEndpoints.discoverTvShows(page, year);

  const response = await fetch(url, TMDB_OPTIONS);
  const data = await response.json();
  const validatedData = tmdbDiscoverSerieSchema.parse(data);

  // 2. Iterate movies for current page
  for await (const tvShow of validatedData.results) {
    const {
      id,
      overview,
      name: spanishName,
      original_name: name,
      first_air_date: releaseDate,
      vote_average: voteAverage,
      poster_path: posterPath,
      backdrop_path: backdropPath,
    } = tvShow;

    const tvShowData = await getTvShowMetadataFromTmdbTvShow({
      id,
      name,
      overview,
      spanishName,
      posterPath,
      releaseDate,
      voteAverage,
      backdropPath,
    });

    tvShows.push(tvShowData);
  }

  return tvShows;
}

export async function getTmdbTvShowFromTitle(query: string, year?: number): Promise<TmdbTvShow> {
  const url = tmdbApiEndpoints.tvShowSearch(query, year);

  const response = await fetch(url, TMDB_OPTIONS);
  const data = await response.json();

  const { results } = tmdbDiscoverSerieSchema.parse(data);
  const [tvShow] = results;

  const {
    id,
    overview,
    name: spanishName,
    original_name: name,
    first_air_date: releaseDate,
    vote_average: voteAverage,
    poster_path: posterPath,
    backdrop_path: backdropPath,
  } = tvShow;

  const tvShowData = await getTvShowMetadataFromTmdbTvShow({
    id,
    name,
    overview,
    spanishName,
    posterPath,
    releaseDate,
    voteAverage,
    backdropPath,
  });

  return tvShowData;
}

async function getTmdbTvShoweLogoUrl(id: number): Promise<string | null> {
  const response = await fetch(tmdbApiEndpoints.tvShowImages(id), TMDB_OPTIONS);
  const data = await response.json();

  const images = tmdbImageSchema.parse(data);
  const [logo] = images.logos
    .filter((logo) => !logo.file_path.endsWith("svg"))
    .sort((logoA, logoB) => logoA.width - logoB.width);

  if (!logo) {
    return null;
  }

  return generateTmdbImageUrl(logo.file_path);
}

async function getTmdbMovieLogoUrl(id: number): Promise<string | null> {
  const response = await fetch(tmdbApiEndpoints.movieImages(id), TMDB_OPTIONS);
  const data = await response.json();

  const images = tmdbImageSchema.parse(data);
  const [logo] = images.logos
    .filter((logo) => !logo.file_path.endsWith("svg"))
    .sort((logoA, logoB) => logoA.width - logoB.width);

  if (!logo) {
    return null;
  }

  return generateTmdbImageUrl(logo.file_path);
}

export async function getTmdbMovieFromTitle(query: string, year?: number): Promise<TmdbTitle> {
  const url = tmdbApiEndpoints.movieSearch(query, year);

  const response = await fetch(url, TMDB_OPTIONS);
  const data = await response.json();

  const { results } = tmdbDiscoverMovieSchema.parse(data);
  const [movie] = results;

  const {
    id,
    overview,
    title: spanishName,
    original_title: name,
    release_date: releaseDate,
    vote_average: voteAverage,
    poster_path: posterPath,
    backdrop_path: backdropPath,
  } = movie;

  const movieData = await getMovieMetadataFromTmdbMovie({
    id,
    name,
    overview,
    spanishName,
    posterPath,
    releaseDate,
    voteAverage,
    backdropPath,
  });

  return movieData;
}
