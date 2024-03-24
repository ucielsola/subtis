import { afterAll, beforeEach, describe, expect, it, spyOn } from "bun:test";

// db
import { supabase } from "@subtis/db";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

// mocks
const supabaseSpy = spyOn(supabase, "rpc");

describe("API | /metrics/download", () => {
	afterAll(() => app.stop());

	beforeEach(() => {
		supabaseSpy.mockClear();
	});

	it("return a ok response for a specific movie", async () => {
		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/metrics/download`, {
			body: JSON.stringify({
				fileName: "Wonka.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(supabaseSpy).toHaveBeenCalledWith("update_subtitle_info", {
			file_name: "Wonka.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
		});
		expect(data).toEqual({ ok: true });
	});

	it("return a response for an 415 error for non supported file extensions", async () => {
		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/metrics/download`, {
			body: JSON.stringify({
				fileName: "Wonk.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3",
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(supabaseSpy).not.toHaveBeenCalled();
		expect(response.status).toBe(415);
		expect(data).toEqual({
			message: "File extension not supported",
		});
	});

	it("return a response for an 400 error for a bad payload", async () => {
		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/metrics/download`, {
			body: JSON.stringify({ file: "123" }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(supabaseSpy).not.toHaveBeenCalled();
		expect(response.status).toBe(400);
		expect(data).toMatchObject({
			expected: {
				fileName: "",
			},
			message: "Required property",
			type: "body",
		});
	});
});
