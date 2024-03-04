import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /subtitles/trending", () => {
	afterAll(() => app.stop());

	it("return the last two trending subtitles", async () => {
		const request = new Request(
			`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/trending`,
			{
				body: JSON.stringify({ limit: 2 }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			},
		);

		const response = await app.handle(request);
		const data = await response.json();

		expect(data).toEqual([
			{
				Movies: {
					name: "Wonka",
					year: 2023,
				},
				ReleaseGroups: {
					name: "YTS-MX",
				},
				SubtitleGroups: {
					name: "SubDivX",
				},
				fileName: "Wonka.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
				id: 1518,
				resolution: "1080p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/wonka-1080p-yts-mx-subdivx.srt?download=Wonka.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				subtitleShortLink: "https://tinyurl.com/2x7w48uv",
			},
			{
				Movies: {
					name: "Badland Hunters",
					year: 2024,
				},
				ReleaseGroups: {
					name: "GalaxyRG",
				},
				SubtitleGroups: {
					name: "SubDivX",
				},
				fileName:
					"Badland.Hunters.2024.KOREAN.720p.WEBRip.800MB.x264-GalaxyRG.mkv",
				id: 1516,
				resolution: "720p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/badland-hunters-720p-galaxyrg-subdivx.srt?download=Badland.Hunters.2024.KOREAN.720p.WEBRip.800MB.x264-GalaxyRG.srt",
				subtitleShortLink: "https://tinyurl.com/yvjxyu7p",
			},
		]);
	});

	it("return a response for an 400 error for a bad payload", async () => {
		const request = new Request(
			`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/trending`,
			{
				body: JSON.stringify({ lim: "123" }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			},
		);

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toMatchObject({
			at: "limit",
			expected: {
				limit: 0,
			},
			message: "Required property",
			type: "body",
		});
	});
});
