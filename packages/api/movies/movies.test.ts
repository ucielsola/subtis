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
				id: 30150907,
				year: 2024,
				name: "Justice League: Crisis on Infinite Earths Part Two",
				rating: 6.216,
				release_date: "2024-04-22",
			},
			{
				id: 20221690,
				year: 2024,
				name: "Woody Woodpecker Goes to Camp",
				rating: 6.884,
				release_date: "2024-04-12",
			},
		]);
	});
});
