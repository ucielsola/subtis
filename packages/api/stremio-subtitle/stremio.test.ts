import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /integrations/stremio", () => {
	afterAll(() => app.stop());

	it("return a response for an existant subtitle with correct title", async () => {
		const request = new Request(
			`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/integrations/stremio/2442029036/Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4`,
		);

		const response = await app.handle(request);
		const data = await response.text();

		expect(data).toBeTypeOf("string");
	});

	it("return a response for an 415 error for non supported file extensions", async () => {
		const request = new Request(
			`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/integrations/stremio/2442029036/Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3`,
		);

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(415);
		expect(data).toEqual({
			message: "File extension not supported",
		});
	});

	it("return a response for an 200 for a file with changed name but with correct bytes", async () => {
		const request = new Request(
			`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/integrations/stremio/2442029036/Road.Hose.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4`,
		);

		const response = await app.handle(request);
		const data = await response.text();

		expect(response.status).toBe(200);
		expect(data).toBeTypeOf("string");
	});

	it("return a response for an 404 error for a non existant subtitle", async () => {
		const request = new Request(
			`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/integrations/stremio/244029036/Rad.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4`,
		);

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Subtitle not found for file",
		});
	});
});
