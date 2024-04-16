import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /links", () => {
	afterAll(() => app.stop());

	it("return a redirected response with corret full link", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/2503`);

		const response = await app.handle(request);
		const data = await response.text();

		const fullLink =
			"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-galaxyrg-subdivx.srt?download=Road.House.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt";

		expect(response.status).toBe(302);
		expect(response.headers.get("location")).toBe(fullLink);
		expect(data).toBe(fullLink);
	});

	it("return a response for an 404 error for a non existant subtitle", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/999999999999999999999`);

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Subtitle not found for id",
		});
	});
});
