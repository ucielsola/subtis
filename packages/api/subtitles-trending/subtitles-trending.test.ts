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
				id: 2505,
				resolution: "1080p",
				subtitleLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/kung-fu-panda-4-1080p-yts-subdivx.srt?download=Kung.Fu.Panda.4.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				movieFileName: "Kung.Fu.Panda.4.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
				subtitleFileName: "Kung.Fu.Panda.4.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				releaseGroup: {
					name: "YTS",
				},
				subtitleGroup: {
					name: "SubDivX",
				},
				movie: {
					name: "Kung Fu Panda 4",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
				},
			},
			{
				id: 2504,
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
