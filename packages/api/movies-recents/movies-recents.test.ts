import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /movies/recent", () => {
	afterAll(() => app.stop());

	it("return the last two recent movies", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies/recent`, {
			method: "POST",
			body: JSON.stringify({ limit: 2 }),
			headers: { "Content-Type": "application/json" },
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual([
			{
				id: 3359350,
				year: 2024,
				name: "Road House",
				rating: 7.067,
				releaseDate: "2024-03-08",
			},
			{
				id: 21692408,
				year: 2024,
				name: "Kung Fu Panda 4",
				rating: 7.126,
				releaseDate: "2024-03-02",
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
