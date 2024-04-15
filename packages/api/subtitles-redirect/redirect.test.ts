import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /links", () => {
	afterAll(() => app.stop());

	it("return a response for an existant subtitle with correct title", async () => {
		const request = new Request(
			`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/links/2458`,
		);

		const response = await app.handle(request);
		const data = await response.text();

		expect(response.status).toBe(302);
		expect(response.headers.get('location')).toBe("https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/kung-fu-panda-4-1080p-galaxyrg-subdivx.srt?download=Kung.Fu.Panda.4.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt");
		expect(data).toBeTypeOf("string");
	});

	it("return a response for an 404 error for a non existant subtitle", async () => {
		const request = new Request(
			`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/links/999999999999999999999`,
		);

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Subtitle not found for id",
		});
	});
});
