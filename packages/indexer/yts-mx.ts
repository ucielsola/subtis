import { z } from "zod";

import { getStripedImdbId } from "./imdb";
// internals
import { getNumbersArray } from "./utils";

// constants
const YTS_BASE_URL = "https://yts.mx/api/v2" as const;

// utils
const ytsApiEndpoints = {
	movieList: (page = 1, limit = 50): string => {
		return `${YTS_BASE_URL}/list_movies.json?limit=${limit}&page=${page}` as const;
	},
};

// schemas
export const torrentSchema = z.object({
	audio_channels: z.string(),
	bit_depth: z.string(),
	date_uploaded: z.string().optional(),
	date_uploaded_unix: z.number().optional(),
	hash: z.string(),
	is_repack: z.string(),
	peers: z.number(),
	quality: z.string(),
	seeds: z.number(),
	size: z.string(),
	size_bytes: z.number(),
	type: z.string(),
	url: z.string(),
	video_codec: z.string(),
});

export const ytsMxMovieSchema = z.object({
	background_image: z.string(),
	background_image_original: z.string(),
	date_uploaded: z.string().optional(),
	date_uploaded_unix: z.number().optional(),
	description_full: z.string(),
	genres: z.array(z.string()).nullable().optional(),
	id: z.number(),
	imdb_code: z.string(),
	language: z.string(),
	large_cover_image: z.string(),
	medium_cover_image: z.string(),
	rating: z.number(),
	runtime: z.number(),
	slug: z.string(),
	small_cover_image: z.string(),
	state: z.string(),
	summary: z.string(),
	synopsis: z.string(),
	title: z.string(),
	title_english: z.string(),
	title_long: z.string(),
	torrents: z.array(torrentSchema),
	url: z.string(),
	year: z.number(),
	yt_trailer_code: z.string(),
});

export const schema = z.object({
	"@meta": z.object({
		api_version: z.number(),
		execution_time: z.string(),
		server_time: z.number(),
		server_timezone: z.string(),
	}),
	data: z.object({
		limit: z.number(),
		movie_count: z.number(),
		movies: z.array(ytsMxMovieSchema),
		page_number: z.number(),
	}),
	status: z.string(),
	status_message: z.string(),
});

// types
type YtsMxMovie = z.infer<typeof ytsMxMovieSchema>;
export type Torrent = z.infer<typeof torrentSchema>;
export type YtsMxMovieList = YtsMxMovie & { imdbId: number };

// core
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
