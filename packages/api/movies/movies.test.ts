import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { movies } from "./movies";

describe("API | /movies/title", () => {
	test("Valid JSON Request with existing movieTitle", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ movieTitle: "Road House" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await movies.request("/title", request, getMockEnv());
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

	test("Invalid JSON Request (missing movieTitle)", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		};

		const response = await movies.request("/title", request, getMockEnv());
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
						path: ["movieTitle"],
						message: "Required",
					},
				],
				name: "ZodError",
			},
		});
	});

	test("Invalid JSON Request (invalid movieTitle)", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ movieTitle: null }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await movies.request("/title", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			success: false,
			error: {
				issues: [
					{
						code: "invalid_type",
						expected: "string",
						received: "null",
						path: ["movieTitle"],
						message: "Expected string, received null",
					},
				],
				name: "ZodError",
			},
		});
	});
});

describe("API | /movies/recent", () => {
	test("Valid JSON Request with existing limit", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ limit: 2 }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await movies.request("/recent", request, getMockEnv());
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

	test("Invaling JSON Request (missing limit)", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({}),
			headers: { "Content-Type": "application/json" },
		};

		const response = await movies.request("/recent", request, getMockEnv());
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
						path: ["limit"],
						message: "Required",
					},
				],
				name: "ZodError",
			},
		});
	});

	test("Invaling JSON Request (invalid limit)", async () => {
		const request = {
			method: "POST",
			body: JSON.stringify({ limit: "2" }),
			headers: { "Content-Type": "application/json" },
		};

		const response = await movies.request("/recent", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({
			success: false,
			error: {
				issues: [
					{
						code: "invalid_type",
						expected: "number",
						received: "string",
						path: ["limit"],
						message: "Expected number, received string",
					},
				],
				name: "ZodError",
			},
		});
	});
});
