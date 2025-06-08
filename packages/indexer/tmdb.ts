import invariant from "tiny-invariant";
import z from "zod";

// db
import type { Genre, SupabaseClient } from "@subtis/db";

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

const tmdbMovieAlternativeTitleSchema = z.object({
  id: z.number(),
  titles: z.array(z.object({ iso_3166_1: z.string(), title: z.string(), type: z.string() })),
});

const tmdbMovieCertificatesSchema = z.object({
  id: z.number(),
  results: z.array(
    z.object({
      iso_3166_1: z.string(),
      release_dates: z.array(
        z.object({
          certification: z.string(),
          descriptors: z.array(z.string().optional()),
          iso_639_1: z.string(),
          note: z.string(),
          release_date: z.string(),
          type: z.number(),
        }),
      ),
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
    return `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${page}&with_original_language=en&primary_release_year=${year}`;
  }

  return `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${page}&with_original_language=en&primary_release_year=${year}`;

  // TODO: Check why the following filters doesn't work properly
  // return `https://api.themoviedb.org/3/discover/movie?language=es-MX&page=${page}&with_original_language=en&primary_release_date.gte=${dayjs(
  //   `${year}`,
  // )
  //   .startOf("year")
  //   .format("YYYY-MM-DD")}&primary_release_date.lte=${dayjs(`${year}`)
  //   .endOf("year")
  //   .format("YYYY-MM-DD")}&sort_by=primary_release_date.asc&region=US&with_runtime.gte=60`;
}

function generateTmdbDiscoverSeriesUrl(page: number, year: number) {
  return `https://api.themoviedb.org/3/discover/tv?language=es-MX&page=${page}&first_air_date_year=${year}&sort_by=popularity.desc&with_original_language=en`;
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
  movieGenres: () => {
    return "https://api.themoviedb.org/3/genre/movie/list?language=es";
  },
  discoverMovies: (page: number, year: number, isDebugging: boolean) => {
    return generateTmdbDiscoverMovieUrl(page, year, isDebugging);
  },
  discoverTvShows: (page: number, year: number) => {
    return generateTmdbDiscoverSeriesUrl(page, year);
  },
  movieDetail: (id: number) => {
    return `https://api.themoviedb.org/3/movie/${id}?language=es-MX&with_original_language=en`;
  },
  movieCertificates: (id: number) => {
    return `https://api.themoviedb.org/3/movie/${id}/release_dates`;
  },
  movieDetailAlternativeTitleJapanese: (id: number) => {
    return `https://api.themoviedb.org/3/movie/${id}/alternative_titles?country=JP`;
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
      return `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&year=${year}&language=en-US`;
    }

    return `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=en-US`;
  },
  tvShowSearch: (title: string, year?: number) => {
    if (year) {
      return `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(title)}&year=${year}&language=es-MX`;
    }

    return `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(title)}&language=es-MX`;
  },
  tvShowAlternativeTitleJapanese: (id: number) => {
    return `https://api.themoviedb.org/3/tv/${id}/alternative_titles?country=JP`;
  },
};

export type TmdbTitle = {
  imdbId: string;
  imdbLink: string;
  rating: number;
  genres: number[];
  runtime: number | null;
  overview: string;
  spanishName: string;
  japanaseName: string | null;
  releaseDate: string;
  name: string;
  year: number;
  logo: string | null;
  poster: string | null;
  backdrop: string | null;
  backdropMain: string | null;
  certification: string | null;
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

async function getMovieCertificationFromTmdbMovie(id: number) {
  const certificatesUrl = tmdbApiEndpoints.movieCertificates(id);
  const certificatesResponse = await fetch(certificatesUrl, TMDB_OPTIONS);
  const certificatesData = await certificatesResponse.json();

  const certificates = tmdbMovieCertificatesSchema.parse(certificatesData);

  const usCertifications = certificates.results.filter((result) => result.iso_3166_1 === "US");
  const certifications = usCertifications
    .flatMap((result) => result.release_dates.map((releaseDate) => releaseDate.certification))
    .filter(Boolean);
  const unrepeatedCertifications = [...new Set(certifications)];

  const [firstCertification] = unrepeatedCertifications;
  const parsedCertification = firstCertification ?? null;

  return parsedCertification;
}

export async function getMovieMetadataFromTmdbMovie({
  id,
  name,
  genres,
  releaseDate,
  voteAverage,
}: {
  id: number;
  name: string;
  genres: number[];
  releaseDate: string;
  voteAverage: number;
}) {
  // 1. Get IMDB ID from TMDB movie detail
  const url = tmdbApiEndpoints.movieDetail(id);

  const response = await fetch(url, TMDB_OPTIONS);
  const data = await response.json();
  const { overview, imdb_id, title: spanishName, original_language, runtime } = tmdbMovieSchema.parse(data);

  // 2. Parse raw imdb_id
  const imdbId = getStripedImdbId(imdb_id ?? "");

  // 3. Get year from release date
  const year = Number(releaseDate.split("-")[0]);

  // 4. Get movie title image
  const logo = await getTmdbMovieLogoUrl(id);

  // 5. Get movie backdrop
  const backdrop = await getTmdbMovieBackdropUrl(id);

  // 5. Get movie backdrop main
  const backdropMain = await getTmdbMovieBackdropMainUrl(id);

  // 6. Get movie poster
  const poster = await getTmdbMoviePosterUrl(id);

  // 7. Get movie certification
  const certification = await getMovieCertificationFromTmdbMovie(id);

  let japanaseName = null;

  if (original_language === "ja") {
    const url = tmdbApiEndpoints.movieDetailAlternativeTitleJapanese(id);

    const response = await fetch(url, TMDB_OPTIONS);
    const data = await response.json();

    const { titles } = tmdbMovieAlternativeTitleSchema.parse(data);
    const [firstTitle] = titles;

    japanaseName = firstTitle?.title ?? null;
  }

  return {
    year,
    name,
    logo,
    poster,
    imdbId,
    genres,
    backdrop,
    backdropMain,
    overview,
    runtime,
    spanishName,
    releaseDate,
    japanaseName,
    certification,
    rating: Number(Number(voteAverage).toFixed(1)),
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
    const { id, title: name, genre_ids: genres, release_date: releaseDate, vote_average: voteAverage } = movie;

    const movieData = await getMovieMetadataFromTmdbMovie({
      id,
      name,
      genres,
      releaseDate,
      voteAverage,
    });

    movies.push(movieData);
  }

  return movies;
}

export async function getTvShowMetadataFromTmdbTvShow({
  id,
  genres,
  name,
  spanishName,
  releaseDate,
  voteAverage,
}: {
  id: number;
  name: string;
  genres: number[];
  spanishName: string;
  releaseDate: string;
  voteAverage: number;
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

  const { overview, ...data } = tmdbTvShowSchema.parse(tvShowDetailData);

  // 5. Get TV show logo
  const logo = await getTmdbTvShowLogoUrl(id);

  // 6. Get TV show backdrop
  const backdrop = await getTmdbTvShowBackdropUrl(id);

  // 7. Get TV show poster
  const poster = await getTmdbTvShowPosterUrl(id);

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

  let japanaseName = null;

  if (data.original_language === "ja") {
    const url = tmdbApiEndpoints.tvShowAlternativeTitleJapanese(id);

    const response = await fetch(url, TMDB_OPTIONS);
    const data = await response.json();

    const { titles } = tmdbMovieAlternativeTitleSchema.parse(data);
    const [firstTitle] = titles;

    japanaseName = firstTitle.title;
  }

  return {
    year,
    name,
    logo,
    poster,
    imdbId,
    genres,
    backdrop,
    overview,
    episodes,
    spanishName,
    releaseDate,
    japanaseName,
    runtime: null,
    rating: voteAverage,
    totalSeasons: data.number_of_seasons,
    totalEpisodes: data.number_of_episodes,
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
      name: spanishName,
      genre_ids: genres,
      original_name: name,
      first_air_date: releaseDate,
      vote_average: voteAverage,
    } = tvShow;

    const tvShowData = await getTvShowMetadataFromTmdbTvShow({
      id,
      name,
      genres,
      spanishName,
      releaseDate,
      voteAverage,
    });

    tvShows.push({ ...tvShowData, runtime: null, certification: null, backdropMain: null });
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
    name: spanishName,
    genre_ids: genres,
    original_name: name,
    first_air_date: releaseDate,
    vote_average: voteAverage,
  } = tvShow;

  const tvShowData = await getTvShowMetadataFromTmdbTvShow({
    id,
    name,
    genres,
    spanishName,
    releaseDate,
    voteAverage,
  });

  return {
    ...tvShowData,
    certification: null,
    backdropMain: null,
  };
}

async function getTmdbTvShowLogoUrl(id: number): Promise<string | null> {
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

async function getTmdbTvShowBackdropUrl(id: number): Promise<string | null> {
  const response = await fetch(tmdbApiEndpoints.tvShowImages(id), TMDB_OPTIONS);
  const data = await response.json();

  const images = tmdbImageSchema.parse(data);
  const [backdrop] = images.backdrops;

  if (!backdrop) {
    return null;
  }

  return generateTmdbImageUrl(backdrop.file_path);
}

async function getTmdbTvShowPosterUrl(id: number): Promise<string | null> {
  const response = await fetch(tmdbApiEndpoints.tvShowImages(id), TMDB_OPTIONS);
  const data = await response.json();

  const images = tmdbImageSchema.parse(data);
  const [poster] = images.posters;

  if (!poster) {
    return null;
  }

  return generateTmdbImageUrl(poster.file_path);
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

async function getTmdbMovieBackdropUrl(id: number): Promise<string | null> {
  const response = await fetch(tmdbApiEndpoints.movieImages(id), TMDB_OPTIONS);
  const data = await response.json();

  const images = tmdbImageSchema.parse(data);
  const [backdrop] = images.backdrops;

  if (!backdrop) {
    return null;
  }

  return generateTmdbImageUrl(backdrop.file_path);
}

async function getTmdbMovieBackdropMainUrl(id: number): Promise<string | null> {
  const response = await fetch(tmdbApiEndpoints.movieImages(id), TMDB_OPTIONS);
  const data = await response.json();

  const images = tmdbImageSchema.parse(data);
  const [, backdropMain] = images.backdrops;

  if (!backdropMain) {
    return null;
  }

  return generateTmdbImageUrl(backdropMain.file_path);
}

async function getTmdbMoviePosterUrl(id: number): Promise<string | null> {
  const response = await fetch(tmdbApiEndpoints.movieImages(id), TMDB_OPTIONS);
  const data = await response.json();

  const images = tmdbImageSchema.parse(data);
  const [poster] = images.posters;

  if (!poster) {
    return null;
  }

  return generateTmdbImageUrl(poster.file_path);
}

export async function getTmdbMovieFromTitle(query: string, year?: number): Promise<TmdbTitle> {
  const url = tmdbApiEndpoints.movieSearch(query, year);

  const response = await fetch(url, TMDB_OPTIONS);
  const data = await response.json();

  const { results } = tmdbDiscoverMovieSchema.parse(data);
  // const sortedMoviesByVoteCount = results.toSorted((a, b) => (a.vote_count < b.vote_count ? 1 : -1));
  const [movie] = results;

  if (!movie) {
    throw new Error("Movie not found");
  }

  const { id, title: name, genre_ids: genres, release_date: releaseDate, vote_average: voteAverage } = movie;

  const movieData = await getMovieMetadataFromTmdbMovie({
    id,
    name,
    genres,
    releaseDate,
    voteAverage,
  });

  return movieData;
}

const genresSchema = z.object({
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
});

async function getTmdbMovieGenres() {
  const url = tmdbApiEndpoints.movieGenres();

  const response = await fetch(url, TMDB_OPTIONS);
  const data = await response.json();

  const validatedData = genresSchema.parse(data);
  const sortedGenres = validatedData.genres.toSorted((a, b) => a.id - b.id);

  return sortedGenres;
}

export async function saveTmdbMovieGenresToDb(supabaseClient: SupabaseClient): Promise<void> {
  const genres = await getTmdbMovieGenres();

  for (const genre of genres) {
    const { id, name } = genre;

    // Check if the genre already exists in the database
    const { data: existingGenres } = await supabaseClient.from("Genres").select("id").eq("genre_id", id).single();

    if (existingGenres) {
      await supabaseClient.from("Genres").update({ name }).eq("genre_id", existingGenres.id);
    } else {
      await supabaseClient.from("Genres").insert({ genre_id: id, name });
    }
  }
}

export async function getGenresFromDb(supabaseClient: SupabaseClient): Promise<Genre[]> {
  const { data } = await supabaseClient.from("Genres").select("*");
  invariant(data, "Genres not found in database");

  return data;
}
