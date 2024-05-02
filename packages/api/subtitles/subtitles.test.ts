import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { subtitles } from "./subtitles";

describe("API | /subtitles/movie", () => {
	test("Valid JSON Request with existing movieId", async () => {
		const request = {
			method: "GET",
		};

		const movieId = 3359350;

		const response = await subtitles.request(`/movie/${movieId}`, request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual([
			{
				id: 2987,
				resolution: "720p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-yts-subdivx.srt?download=Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				subtitle_file_name: "Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "YTS",
				},
			},
			{
				id: 2989,
				resolution: "720p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-galaxyrg-subdivx.srt?download=Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
				subtitle_file_name: "Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "GalaxyRG",
				},
			},
			{
				id: 2990,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x265.10bit.AAC5.1-[YTS.MX].srt",
				subtitle_file_name: "Road.House.2024.1080p.WEBRip.x265.10bit.AAC5.1-[YTS.MX].srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "YTS",
				},
			},
			{
				id: 2991,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
				subtitle_file_name: "Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "GalaxyRG",
				},
			},
			{
				id: 2992,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-ethel-subdivx.srt?download=Road.House.2024.1080p.WEB.h264-ETHEL.srt",
				subtitle_file_name: "Road.House.2024.1080p.WEB.h264-ETHEL.srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "ETHEL",
				},
			},
			{
				id: 2988,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				subtitle_file_name: "Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "GalaxyRG",
				},
			},
			{
				id: 2986,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				subtitle_file_name: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "YTS",
				},
			},
		]);
	});

	test("Valid JSON Request with non-existent movieId", async () => {
		const request = {
			method: "GET",
		};

		const response = await subtitles.request("/movie/9350", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({ message: "Subtitles not found for movie" });
	});
});

describe("API | /subtitles/trending", () => {
	test("Valid JSON Request with limit 2", async () => {
		const request = {
			method: "GET",
		};

		const limit = 2;

		const response = await subtitles.request(`/trending/${limit}`, request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveLength(2);
		expect(data).toEqual([
			{
				id: 2986,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				subtitle_file_name: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "YTS",
				},
			},
			{
				id: 2988,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				subtitle_file_name: "Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "GalaxyRG",
				},
			},
		]);
	});
});

describe("API | /subtitles/file/name", () => {
	test("Valid JSON Request with existing fileName", async () => {
		const request = {
			method: "GET",
		};

		const fileName = "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";
		const bytes = "2442029036";

		const response = await subtitles.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual({
			id: 2986,
			resolution: "1080p",
			subtitle_link:
				"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
			subtitle_file_name: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
			movie: {
				name: "Road House",
				year: 2024,
				poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
				backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
			},
			releaseGroup: {
				name: "YTS",
			},
		});
	});

	test("Invalid JSON Request with wrong fileName type", async () => {
		const request = {
			method: "GET",
		};

		const fileName = "Road.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3";
		const bytes = "2442029036";

		const response = await subtitles.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(415);
		expect(data).toEqual({ message: "File extension not supported" });
	});

	test("Valid JSON Request with wrong fileName found by bytes", async () => {
		const request = {
			method: "GET",
		};

		const fileName = "Road.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";
		const bytes = "2442029036";

		const response = await subtitles.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual({
			id: 2986,
			resolution: "1080p",
			subtitle_link:
				"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
			subtitle_file_name: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
			movie: {
				name: "Road House",
				year: 2024,
				poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
				backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
			},
			releaseGroup: {
				name: "YTS",
			},
		});
	});
});

describe("API | /file/versions", () => {
	test("Valid JSON Request with existing fileName and valid movie metadata", async () => {
		const request = {
			method: "GET",
		};

		const fileName = "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";

		const response = await subtitles.request(`/file/versions/${fileName}`, request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual([
			{
				id: 2987,
				resolution: "720p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-yts-subdivx.srt?download=Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				subtitle_file_name: "Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "YTS",
				},
			},
			{
				id: 2989,
				resolution: "720p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-galaxyrg-subdivx.srt?download=Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
				subtitle_file_name: "Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "GalaxyRG",
				},
			},
			{
				id: 2990,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x265.10bit.AAC5.1-[YTS.MX].srt",
				subtitle_file_name: "Road.House.2024.1080p.WEBRip.x265.10bit.AAC5.1-[YTS.MX].srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "YTS",
				},
			},
			{
				id: 2991,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
				subtitle_file_name: "Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "GalaxyRG",
				},
			},
			{
				id: 2992,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-ethel-subdivx.srt?download=Road.House.2024.1080p.WEB.h264-ETHEL.srt",
				subtitle_file_name: "Road.House.2024.1080p.WEB.h264-ETHEL.srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "ETHEL",
				},
			},
			{
				id: 2988,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				subtitle_file_name: "Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "GalaxyRG",
				},
			},
			{
				id: 2986,
				resolution: "1080p",
				subtitle_link:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				subtitle_file_name: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
				releaseGroup: {
					name: "YTS",
				},
			},
		]);
	});

	test("Valid JSON Request with existing fileName and invalid movie metadata", async () => {
		const request = {
			method: "GET",
		};

		const fileName = "Road.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";

		const response = await subtitles.request(`/file/versions/${fileName}`, request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Movie not found for file",
		});
	});

	test("Invalid JSON Request with wrong fileName type", async () => {
		const request = {
			method: "GET",
		};

		const fileName = "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3";

		const response = await subtitles.request(`/file/versions/${fileName}`, request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(415);
		expect(data).toEqual({
			message: "File extension not supported",
		});
	});
});
