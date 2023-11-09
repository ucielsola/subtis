import z from 'zod'

// utils
import { getNumbersArray } from './utils'

// imdb
import { getStripedImdbId } from './imdb'

// schemas
export const tmdbDiscoverSchema = z.object({
  page: z.number(),
  results: z.array(
    z.object({
      adult: z.boolean(),
      backdrop_path: z.string(),
      genre_ids: z.array(z.number()),
      id: z.number(),
      original_language: z.string(),
      original_title: z.string(),
      overview: z.string(),
      popularity: z.number(),
      poster_path: z.string(),
      release_date: z.string(),
      title: z.string(),
      video: z.boolean(),
      vote_average: z.number(),
      vote_count: z.number(),
    }),
  ),
  total_pages: z.number(),
  total_results: z.number(),
})

export const tmdbMovieSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string(),
  belongs_to_collection: z
    .object({
      id: z.number(),
      name: z.string(),
      poster_path: z.string().nullable(),
      backdrop_path: z.string().nullable(),
    })
    .nullable(),
  budget: z.number(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  homepage: z.string(),
  id: z.number(),
  imdb_id: z.string(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string(),
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
})

export async function getTmdbMoviesTotalPagesArray(): Promise<number[]> {
  const url = 'https://api.themoviedb.org/3/discover/movie?language=en-US&page=1&language=en-US'
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OWQzMTc0MjM1OTUzYzUzMmNhZjUzZjIzYzJkNGMzMCIsInN1YiI6IjViZDY3OTA5OTI1MTQxMDM5NjAzN2U1MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Jgt15vr7N0PFptDVWYaHD_wIkJvxs9-YeMkePZR4AJM',
    },
  }

  const response = await fetch(url, options)
  const data = await response.json()

  const validatedData = tmdbDiscoverSchema.parse(data)
  return getNumbersArray(validatedData.total_pages)
}

const tmdbApiEndpoints = {
  discoverMovies: (page: number) => {
    return `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${page}`
  },
  movieDetail: (id: number) => {
    return `https://api.themoviedb.org/3/movie/${id}`
  },
}

const TMDB_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${Bun.env.TMDB_API_KEY}`,
  },
}

export interface TmdbMovie {
  year: number
  title: string
  imdbId: number
  rating: number
}

export async function getMoviesFromTmdb(page: number): Promise<TmdbMovie[]> {
  const movies: TmdbMovie[] = []

  // 1. Get movies for current page
  const url = tmdbApiEndpoints.discoverMovies(page)

  const response = await fetch(url, TMDB_OPTIONS)
  const data = await response.json()
  const validatedData = tmdbDiscoverSchema.parse(data)

  // 2. Iterate movies for current page
  for await (const movie of validatedData.results) {
    const { id, release_date, title, vote_average: rating } = movie

    // 3. Get IMDB ID from TMDB movie detail
    const url2 = tmdbApiEndpoints.movieDetail(id)

    const response = await fetch(url2, TMDB_OPTIONS)
    const data = await response.json()
    const { imdb_id } = tmdbMovieSchema.parse(data)

    // 4. Parse raw imdb_id
    const imdbId = getStripedImdbId(imdb_id)

    // 5. Get year from release date
    const year = Number(release_date.split('-')[0])

    const movieData = {
      year,
      title,
      imdbId,
      rating,
    }

    movies.push(movieData)
  }

  return movies
}
