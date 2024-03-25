import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /movies/recent", () => {
	afterAll(() => app.stop());

	it("return the last two trending subtitles", async () => {
		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies/recent`, {
			body: JSON.stringify({ limit: 2 }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(data).toEqual([
			{
				id: 13452446,
				name: "Damsel",
				rating: 7.201,
				release_date: "2024-03-08",
				year: 2024,
			},
			{
				id: 11057302,
				name: "Madame Web",
				rating: 5.602,
				release_date: "2024-02-14",
				year: 2024,
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
