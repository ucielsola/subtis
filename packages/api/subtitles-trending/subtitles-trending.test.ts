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
        fileName: "Wonka.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
        id: 2106,
        resolution: "1080p",
        subtitleFullLink: "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/wonka-1080p-yts-mx-subdivx.srt?download=Wonka.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
        subtitleShortLink: "https://tinyurl.com/2x7w48uv",
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
      }, {
        fileName: "No.Way.Up.2024.720p.WEBRip.x264.AAC-[YTS.MX].mp4",
        id: 2068,
        resolution: "720p",
        subtitleFullLink: "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/no-way-up-720p-yts-mx-subdivx.srt?download=No.Way.Up.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
        subtitleShortLink: "https://tinyurl.com/25gqzbs8",
        Movies: {
          name: "No Way Up",
          year: 2024,
        },
        ReleaseGroups: {
          name: "YTS-MX",
        },
        SubtitleGroups: {
          name: "SubDivX",
        },
      }
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
