import { afterAll, beforeEach, describe, expect, it, spyOn } from "bun:test";

// internals
import { runApi } from "../app";
import { cache } from "./subtitles-file";

// constants
const app = runApi();
const cacheGetSpy = spyOn(cache, "get");
const cacheSetSpy = spyOn(cache, "set");

describe("API | /subtitles/file/name", () => {
	afterAll(() => app.stop());

	beforeEach(() => {
		cache.clear();
		cacheGetSpy.mockClear();
		cacheSetSpy.mockClear();
	});

	it("return a response for an existant subtitle with correct file name", async () => {
		const bytes = "2442029036";
		const fileName = "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";

		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file/name`, {
			body: JSON.stringify({ bytes, fileName }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(cacheGetSpy).toHaveBeenCalled();
		expect(cacheSetSpy).toHaveBeenCalled();
		expect(cache.size).toBe(1);

		expect(response.status).toBe(200);
		expect(data).toEqual({
			id: 2499,
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
		});
	});

	it("return a response for an 415 error for non supported file extensions", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file/name`, {
			body: JSON.stringify({
				bytes: "2",
				fileName: "The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3",
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(cacheGetSpy).not.toHaveBeenCalled();
		expect(cacheSetSpy).not.toHaveBeenCalled();

		expect(response.status).toBe(415);
		expect(data).toEqual({
			message: "File extension not supported",
		});
	});

	it("return a response for an 200 for a file with changed name but with correct bytes", async () => {
		const bytes = "2442029036";
		const fileName = "Road.Hose.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";

		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file/name`, {
			body: JSON.stringify({ bytes, fileName }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(cacheGetSpy).toHaveBeenCalled();

		expect(response.status).toBe(200);
		expect(data).toEqual({
			id: 2499,
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
		});
	});

	it("return a response for an 404 error for a non existant subtitle", async () => {
		const bytes = "2071378941";

		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file/name`, {
			body: JSON.stringify({
				bytes,
				fileName: "The.Marvels.2021.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(cacheGetSpy).toHaveBeenCalled();

		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Subtitle not found for file",
		});
	});

	it("return a response for an 422 error for a bad payload", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file/name`, {
			body: JSON.stringify({ file: "the" }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(cacheGetSpy).not.toHaveBeenCalled();
		expect(cacheSetSpy).not.toHaveBeenCalled();

		expect(response.status).toBe(422);
		expect(data).toMatchObject({
			expected: {
				bytes: "",
				fileName: "",
			},
			message: "Required property",
			type: "validation",
		});
	});
});
