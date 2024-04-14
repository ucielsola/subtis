import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /subtitles/trending", () => {
	afterAll(() => app.stop());

	it("return the last two trending subtitles", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/trending`, {
			method: "POST",
			body: JSON.stringify({ limit: 2 }),
			headers: { "Content-Type": "application/json" },
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual([
			{
				id: 2450,
				fileName: "Dune.Part.Two.2024.720p.WEBRip.x264.AAC-[YTS.MX].mp4",
				resolution: "720p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune-part-two-720p-yts-subdivx.srt?download=Dune.Part.Two.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				subtitleShortLink: "https://tinyurl.com/2c6h794h",
				releaseGroup: {
					name: "YTS",
				},
				subtitleGroup: {
					name: "SubDivX",
				},
				movie: {
					name: "Dune: Part Two",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
				},
			},
			{
				id: 2449,
				fileName: "Dune.Part.Two.2024.1080p.WEBRip.x264.AAC-[YTS.MX].mp4",
				resolution: "1080p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune-part-two-1080p-yts-subdivx.srt?download=Dune.Part.Two.2024.1080p.WEBRip.x264.AAC-[YTS.MX].srt",
				subtitleShortLink: "https://tinyurl.com/26ztzthj",
				releaseGroup: {
					name: "YTS",
				},
				subtitleGroup: {
					name: "SubDivX",
				},
				movie: {
					name: "Dune: Part Two",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
				},
			},
		]);
	});

	it("return a response for an 422 error for a bad payload", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/trending`, {
			body: JSON.stringify({ lim: "123" }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(422);
		expect(data).toMatchObject({
			expected: {
				limit: 0,
			},
			message: "Required property",
			type: "validation",
		});
	});
});
