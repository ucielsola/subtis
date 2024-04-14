import dayjs from "dayjs";
import z from "zod";

import { getStripedImdbId } from "./imdb";
// internals
import { getNumbersArray } from "./utils";

// schemas
export const tmdbDiscoverSchema = z.object({
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
		return `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${page}`;
	}

	return `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${page}&primary_release_date.gte=${dayjs(
		`${year}`,
	)
		.startOf("year")
		.format("YYYY-MM-DD")}&primary_release_date.lte=${dayjs(`${year}`)
		.endOf("year")
		.format("YYYY-MM-DD")}&sort_by=primary_release_date.asc&region=US&with_runtime.gte=60`;
}

export async function getTmdbMoviesTotalPagesArray(
	year: number,
	isDebugging: boolean,
): Promise<{ totalPages: number[]; totalResults: number }> {
	const url = generateTmdbDiscoverMovieUrl(1, year, isDebugging);

	const response = await fetch(url, TMDB_OPTIONS);
	const data = await response.json();

	const validatedData = tmdbDiscoverSchema.parse(data);
	const totalPages = getNumbersArray(validatedData.total_pages);

	return { totalPages, totalResults: validatedData.total_results };
}

const tmdbApiEndpoints = {
	discoverMovies: (page: number, year: number, isDebugging: boolean) => {
		return generateTmdbDiscoverMovieUrl(page, year, isDebugging);
	},
	movieDetail: (id: number) => {
		return `https://api.themoviedb.org/3/movie/${id}`;
	},
	movieSearch: (title: string) => {
		return `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}`;
	},
};
export type TmdbMovie = {
	imdbId: number;
	imdbLink: string;
	rating: number;
	releaseDate: string;
	title: string;
	year: number;
	poster: string | null;
	backdrop: string | null;
};

function generateTmdbImageUrl(path: string | null): string | null {
	if (!path) {
		return null;
	}

	return `https://image.tmdb.org/t/p/original${path}`;
}

async function getMovieMetadataFromTmdbMovie({
	id,
	title,
	posterPath,
	releaseDate,
	voteAverage,
	backdropPath,
}: {
	id: number;
	title: string;
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

	return {
		year,
		title,
		imdbId,
		releaseDate,
		rating: voteAverage,
		poster: generateTmdbImageUrl(posterPath),
		backdrop: generateTmdbImageUrl(backdropPath),
		imdbLink: imdbId ? `https://www.imdb.com/title/tt${imdbId}` : "-",
	};
}

export async function getMoviesFromTmdb(page: number, year: number, isDebugging: boolean): Promise<TmdbMovie[]> {
	const movies: TmdbMovie[] = [];

	// 1. Get movies for current page
	const url = tmdbApiEndpoints.discoverMovies(page, year, isDebugging);

	const response = await fetch(url, TMDB_OPTIONS);
	const data = await response.json();
	const validatedData = tmdbDiscoverSchema.parse(data);

	// 2. Iterate movies for current page
	for await (const movie of validatedData.results) {
		const {
			id,
			title,
			release_date: releaseDate,
			vote_average: voteAverage,
			poster_path: posterPath,
			backdrop_path: backdropPath,
		} = movie;

		const movieData = await getMovieMetadataFromTmdbMovie({
			id,
			title,
			posterPath,
			releaseDate,
			voteAverage,
			backdropPath,
		});

		movies.push(movieData);
	}

	return movies;
}

export async function getTmdbMovieFromTitle(query: string): Promise<TmdbMovie> {
	const url = tmdbApiEndpoints.movieSearch(query);

	const response = await fetch(url, TMDB_OPTIONS);
	const data = await response.json();

	const { results } = tmdbDiscoverSchema.parse(data);
	const [movie] = results;

	const {
		id,
		release_date: releaseDate,
		title,
		vote_average: voteAverage,
		poster_path: posterPath,
		backdrop_path: backdropPath,
	} = movie;

	const movieData = await getMovieMetadataFromTmdbMovie({
		id,
		title,
		posterPath,
		releaseDate,
		voteAverage,
		backdropPath,
	});

	return movieData;
}
