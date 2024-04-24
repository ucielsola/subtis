import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { metrics } from "./metrics";

describe("API | /metrics/download", () => {
	test("Valid JSON Request with existing fileName", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ fileName: "Road.House.2024.1080p.WEB.h264-ETHEL.mkv" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await metrics.request("/download", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual({ ok: true });
	});

	test("Invalid JSON Request (missing fileName)", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		};

		const response = await metrics.request("/download", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			success: false,
			error: {
				issues: [
					{
						code: "invalid_type",
						expected: "string",
						received: "undefined",
						path: ["fileName"],
						message: "Required",
					},
				],
				name: "ZodError",
			},
		});
	});

	test("Invalid JSON Request (invalid fileName type)", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ fileName: "Road.House.2024.1080p.WEB.h264-ETHEL.mp3" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await metrics.request("/download", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(415);
		expect(data).toEqual({
			message: "File extension not supported",
		});
	});
});
