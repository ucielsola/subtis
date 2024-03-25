import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /subtitles/trending", () => {
	afterAll(() => app.stop());

	it("return the last two trending subtitles", async () => {
		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/trending`, {
			body: JSON.stringify({ limit: 2 }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(data).toEqual([
			{
				fileName: "Madame.Web.2024.720p.WEBRip.x264.AAC-[YTS.MX].mp4",
				id: 2219,
				resolution: "720p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/madame-web-720p-yts-mx-subdivx.srt?download=Madame.Web.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				subtitleShortLink: "https://tinyurl.com/27e94opl",
				ReleaseGroups: {
					name: "YTS-MX",
				},
				SubtitleGroups: {
					name: "SubDivX",
				},
				Movies: {
					name: "Madame Web",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
				},
			},
			{
				fileName: "Madame.Web.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
				id: 2218,
				resolution: "1080p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/madame-web-1080p-yts-mx-subdivx.srt?download=Madame.Web.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				subtitleShortLink: "https://tinyurl.com/27fployb",
				ReleaseGroups: {
					name: "YTS-MX",
				},
				SubtitleGroups: {
					name: "SubDivX",
				},
				Movies: {
					name: "Madame Web",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
				},
			},
		]);
	});

	it("return a response for an 422 error for a bad payload", async () => {
		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/trending`, {
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
