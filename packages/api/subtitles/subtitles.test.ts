import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { subtitles } from "./subtitles";

describe("API | /subtitles/movie", () => {
	test("Valid JSON Request with existing movieId", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ movieId: 3359350 }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/movie", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual([
			{
				id: 2748,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				subtitleFileName: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				releaseGroup: {
					name: "YTS",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
			},
			{
				id: 2749,
				resolution: "720p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-yts-subdivx.srt?download=Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				subtitleFileName: "Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				releaseGroup: {
					name: "YTS",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
			},
			{
				id: 2750,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				subtitleFileName: "Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				releaseGroup: {
					name: "GalaxyRG",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
			},
			{
				id: 2751,
				resolution: "720p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-galaxyrg-subdivx.srt?download=Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
				subtitleFileName: "Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
				releaseGroup: {
					name: "GalaxyRG",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
			},
			{
				id: 2753,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
				subtitleFileName: "Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
				releaseGroup: {
					name: "GalaxyRG",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
			},
			{
				id: 2752,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x265.10bit.AAC5.1-[YTS.MX].srt",
				subtitleFileName: "Road.House.2024.1080p.WEBRip.x265.10bit.AAC5.1-[YTS.MX].srt",
				releaseGroup: {
					name: "YTS",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
			},
			{
				id: 2754,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-ethel-subdivx.srt?download=Road.House.2024.1080p.WEB.h264-ETHEL.srt",
				subtitleFileName: "Road.House.2024.1080p.WEB.h264-ETHEL.srt",
				releaseGroup: {
					name: "ETHEL",
				},
				movie: {
					name: "Road House",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/bXi6IQiQDHD00JFio5ZSZOeRSBh.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/oe7mWkvYhK4PLRNAVSvonzyUXNy.jpg",
				},
			},
		]);
	});

	test("Valid JSON Request with non-existent movieId", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ movieId: 9350 }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/movie", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({ message: "Subtitles not found for movie" });
	});

	test("Invalid JSON Request (missing movieId)", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/movie", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			success: false,
			error: {
				issues: [
					{
						code: "invalid_type",
						expected: "number",
						received: "undefined",
						path: ["movieId"],
						message: "Required",
					},
				],
				name: "ZodError",
			},
		});
	});

	test("Invalid JSON Request (invalid movieId type)", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ movieId: "string" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/movie", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			success: false,
			error: {
				issues: [
					{
						code: "invalid_type",
						expected: "number",
						received: "string",
						path: ["movieId"],
						message: "Expected number, received string",
					},
				],
				name: "ZodError",
			},
		});
	});
});

describe("API | /subtitles/trending", () => {
	test("Valid JSON Request with limit 2", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ limit: 2 }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/trending", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveLength(2);
		expect(data).toEqual([
			{
				id: 2734,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune-part-two-1080p-yts-subdivx.srt?download=Dune.Part.Two.2024.1080p.WEBRip.x265.10bit.AAC-[YTS.MX].srt",
				subtitleFileName: "Dune.Part.Two.2024.1080p.WEBRip.x265.10bit.AAC-[YTS.MX].srt",
				movie: {
					name: "Dune: Part Two",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
				},
				releaseGroup: {
					name: "YTS",
				},
			},
			{
				id: 2733,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune-part-two-1080p-yts-subdivx.srt?download=Dune.Part.Two.2024.1080p.WEBRip.x264.AAC-[YTS.MX].srt",
				subtitleFileName: "Dune.Part.Two.2024.1080p.WEBRip.x264.AAC-[YTS.MX].srt",
				movie: {
					name: "Dune: Part Two",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
					backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
				},
				releaseGroup: {
					name: "YTS",
				},
			},
		]);
	});

	test("Invalid JSON Request (missing limit)", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/trending", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			success: false,
			error: {
				issues: [
					{
						code: "invalid_type",
						expected: "number",
						received: "undefined",
						path: ["limit"],
						message: "Required",
					},
				],
				name: "ZodError",
			},
		});
	});

	test("Invalid JSON Request (invalid limit type)", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ limit: "foo" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/trending", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			success: false,
			error: {
				issues: [
					{
						code: "invalid_type",
						expected: "number",
						received: "string",
						path: ["limit"],
						message: "Expected number, received string",
					},
				],
				name: "ZodError",
			},
		});
	});
});

describe("API | /subtitles/file/name", () => {
	test("Valid JSON Request with existing fileName", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ fileName: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4", bytes: "2442029036" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/file/name", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual({
			id: 2748,
			resolution: "1080p",
			subtitleLink:
				"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
			subtitleFileName: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
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
			method: "POST",
			body: JSON.stringify({ fileName: "Road.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3", bytes: "2442029036" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/file/name", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(415);
		expect(data).toEqual({ message: "File extension not supported" });
	});

	test("Valid JSON Request with wrong fileName found by bytes", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ fileName: "Road.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4", bytes: "2442029036" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/file/name", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual({
			id: 2748,
			resolution: "1080p",
			subtitleLink:
				"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
			subtitleFileName: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
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

	test("Invalid JSON Request with missing bytes", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ fileName: "some_file_name" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/file/name", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			success: false,
			error: {
				issues: [
					{
						code: "invalid_type",
						expected: "string",
						received: "undefined",
						path: ["bytes"],
						message: "Required",
					},
				],
				name: "ZodError",
			},
		});
	});

	test("Invalid JSON Request with non-string bytes", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ bytes: 123, fileName: "some_file_name" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/file/name", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			success: false,
			error: {
				issues: [
					{
						code: "invalid_type",
						expected: "string",
						received: "number",
						path: ["bytes"],
						message: "Expected string, received number",
					},
				],
				name: "ZodError",
			},
		});
	});
});

describe("API | /file/versions", () => {
	test("Valid JSON Request with existing fileName and valid movie metadata", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ fileName: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/file/versions", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual([
			{
				id: 2748,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				subtitleFileName: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
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
				id: 2749,
				resolution: "720p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-yts-subdivx.srt?download=Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				subtitleFileName: "Road.House.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
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
				id: 2750,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				subtitleFileName: "Road.House.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
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
				id: 2751,
				resolution: "720p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-720p-galaxyrg-subdivx.srt?download=Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
				subtitleFileName: "Road.House.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
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
				id: 2753,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
				subtitleFileName: "Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
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
				id: 2752,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x265.10bit.AAC5.1-[YTS.MX].srt",
				subtitleFileName: "Road.House.2024.1080p.WEBRip.x265.10bit.AAC5.1-[YTS.MX].srt",
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
				id: 2754,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-ethel-subdivx.srt?download=Road.House.2024.1080p.WEB.h264-ETHEL.srt",
				subtitleFileName: "Road.House.2024.1080p.WEB.h264-ETHEL.srt",
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
		]);
	});

	test("Valid JSON Request with existing fileName and invalid movie metadata", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ fileName: "Road.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/file/versions", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Movie not found for file",
		});
	});

	test("Invalid JSON Request with missing fileName key", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/file/versions", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			success: false,
			error: {
				issues: [
					{
						code: "invalid_type",
						expected: "string",
						received: "undefined",
						path: ["fileName"],
						message: "Required",
					},
				],
				name: "ZodError",
			},
		});
	});

	test("Invalid JSON Request with non-string file name", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ fileName: 123 }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/file/versions", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			success: false,
			error: {
				issues: [
					{
						code: "invalid_type",
						expected: "string",
						received: "number",
						path: ["fileName"],
						message: "Expected string, received number",
					},
				],
				name: "ZodError",
			},
		});
	});

	test("Invalid JSON Request with wrong fileName type", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ fileName: "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await subtitles.request("/file/versions", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(415);
		expect(data).toEqual({
			message: "File extension not supported",
		});
	});
});
