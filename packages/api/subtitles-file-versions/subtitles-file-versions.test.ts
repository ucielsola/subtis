import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /subtitles/file/versions", () => {
	afterAll(() => app.stop());

	it("return a response for an existant subtitle with correct file name", async () => {
		const fileName = "Road.House.2024.1080p.WEBRip.x264.C5.1-[YTS.MX].mp4";

		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file/versions`, {
			body: JSON.stringify({ fileName }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual([
			{
				id: 2499,
				movieId: 3359350,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				movieFileName: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
				subtitleFileName: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
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
				id: 2501,
				movieId: 3359350,
				resolution: "720p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-yts-subdivx.srt?download=Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				movieFileName: "Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].mp4",
				subtitleFileName: "Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
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
				id: 2502,
				movieId: 3359350,
				resolution: "720p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-galaxyrg-subdivx.srt?download=Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
				movieFileName: "Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.mkv",
				subtitleFileName: "Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
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
				id: 2503,
				movieId: 3359350,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
				movieFileName: "Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.mkv",
				subtitleFileName: "Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
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
				id: 2504,
				movieId: 3359350,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-ethel-subdivx.srt?download=Road.House.2024.1080p.WEB.h264-ETHEL.srt",
				movieFileName: "Road.House.2024.1080p.WEB.h264-ETHEL.mkv",
				subtitleFileName: "Road.House.2024.1080p.WEB.h264-ETHEL.srt",
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
			{
				id: 2500,
				movieId: 3359350,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				movieFileName: "Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv",
				subtitleFileName: "Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
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
		]);
	});

	it("return a response for an 415 error for non supported file extensions", async () => {
		const fileName = "Road.House.2024.1080p.WEBRip.x264.C5.1-[YTS.MX].mp3";

		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file/versions`, {
			body: JSON.stringify({
				fileName,
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(415);
		expect(data).toEqual({
			message: "File extension not supported",
		});
	});

	it("return a response for an 404 error for a non existant subtitle", async () => {
		const fileName = "Rd.House.2024.1080p.WEBRip.x264.C5.1-[YTS.MX].mp4";

		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file/versions`, {
			body: JSON.stringify({
				fileName,
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Movie not found for file",
		});
	});

	it("return a response for an 422 error for a bad payload", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file/versions`, {
			body: JSON.stringify({ file: "the" }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(422);
		expect(data).toMatchObject({
			type: "validation",
			on: "body",
			property: "/fileName",
			message: "Required property",
			expected: {
				fileName: "",
			},
		});
	});
});
