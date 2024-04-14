import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /subtitles/movie", () => {
	afterAll(() => app.stop());

	it("return a subtitles response for a specific movie", async () => {
		const movieId = 3359350;

		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/movie`, {
			body: JSON.stringify({ movieId }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(data).toMatchObject([
			{
				id: 2464,
				fileName: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
				resolution: "1080p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				subtitleShortLink: "https://tinyurl.com/2dckj9bk",
				releaseGroup: {
					name: "YTS",
				},
				subtitleGroup: {
					name: "SubDivX",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
				},
			},
			{
				id: 2465,
				fileName: "Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].mp4",
				resolution: "720p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-yts-subdivx.srt?download=Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				subtitleShortLink: "https://tinyurl.com/24njx3k3",
				releaseGroup: {
					name: "YTS",
				},
				subtitleGroup: {
					name: "SubDivX",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
				},
			},
			{
				id: 2466,
				fileName: "Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv",
				resolution: "1080p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				subtitleShortLink: "https://tinyurl.com/23czjbw9",
				releaseGroup: {
					name: "GalaxyRG",
				},
				subtitleGroup: {
					name: "SubDivX",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
				},
			},
			{
				id: 2467,
				fileName: "Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.mkv",
				resolution: "720p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-galaxyrg-subdivx.srt?download=Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
				subtitleShortLink: "https://tinyurl.com/23fzkagm",
				releaseGroup: {
					name: "GalaxyRG",
				},
				subtitleGroup: {
					name: "SubDivX",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
				},
			},
			{
				id: 2468,
				fileName: "Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.mkv",
				resolution: "1080p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
				subtitleShortLink: "https://tinyurl.com/28opjqbn",
				releaseGroup: {
					name: "GalaxyRG",
				},
				subtitleGroup: {
					name: "SubDivX",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
				},
			},
			{
				id: 2469,
				fileName: "Road.House.2024.1080p.WEB.h264-ETHEL.mkv",
				resolution: "1080p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-ethel-subdivx.srt?download=Road.House.2024.1080p.WEB.h264-ETHEL.srt",
				subtitleShortLink: "https://tinyurl.com/27hwj6wn",
				releaseGroup: {
					name: "ETHEL",
				},
				subtitleGroup: {
					name: "SubDivX",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
				},
			},
		]);
	});

	it("return a response for an 404 error for a non existant movie id", async () => {
		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/movie`, {
			body: JSON.stringify({ movieId: 17950 }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Subtitles not found for movie",
		});
	});

	it("return a response for an 422 error for a bad payload", async () => {
		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/movie`, {
			body: JSON.stringify({ movie: 12 }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(422);
		expect(data).toMatchObject({
			type: "validation",
			on: "body",
			property: "/movieId",
			message: "Required property",
			expected: {
				movieId: 0,
			},
			found: {
				movie: 12,
			},
		});
	});
});
