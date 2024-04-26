import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { movies } from "./movies";

describe("API | /movies/title/:movieTitle", () => {
	test("Valid JSON Request with existing movieTitle", async () => {
		const request = {
			method: "GET",
		};

		const response = await movies.request(`/title/${encodeURI("Road House")}`, request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual([
			{
				id: 3359350,
				name: "Road House",
				year: 2024,
			},
		]);
	});
});

describe("API | /movies/recent", () => {
	test("Valid JSON Request with existing limit", async () => {
		const request = {
			method: "GET",
		};

		const response = await movies.request("/recent/2", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveLength(2);
		expect(data).toEqual([
			{
				id: 20221690,
				year: 2024,
				name: "Woody Woodpecker Goes to Camp",
				rating: 7.309,
				releaseDate: "2024-04-12",
			},
			{
				id: 21235248,
				year: 2024,
				name: "Ghostbusters: Frozen Empire",
				rating: 6.519,
				releaseDate: "2024-03-20",
			},
		]);
	});
});
