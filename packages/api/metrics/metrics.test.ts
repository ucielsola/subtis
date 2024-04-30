import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { metrics } from "./metrics";

describe("API | /metrics/download", () => {
	test("Valid JSON Request with existing subtitleId", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ subtitleId: 2895 }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await metrics.request("/download", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual({ ok: true });
	});

	test("Invalid JSON Request (missing subtitleId)", async () => {
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
						expected: "number",
						received: "undefined",
						path: ["subtitleId"],
						message: "Required",
					},
				],
				name: "ZodError",
			},
		});
	});
});
