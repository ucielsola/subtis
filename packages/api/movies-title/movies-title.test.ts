import { afterAll, describe, expect, it, spyOn, beforeEach } from "bun:test";

// db
import { supabase } from "@subtis/db";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

// mocks
const supabaseSpy = spyOn(supabase, "rpc");

describe("API | /movies/title", () => {
	afterAll(() => app.stop());

	beforeEach(() => {
		supabaseSpy.mockClear();
	});

	it("return a movies response for a movie name query", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies/title`, {
			body: JSON.stringify({ movieTitle: "Road" }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(supabaseSpy).toHaveBeenCalledTimes(1);
		expect(response.status).toBe(200);
		expect(data).toEqual([
			{
				id: 3359350,
				name: "Road House",
				year: 2024,
			},
		]);
	});

	it("return a movies response for a movie name query with fuzzy search", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies/title`, {
			body: JSON.stringify({ movieTitle: "rod house" }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(supabaseSpy).toHaveBeenCalledTimes(1);
		expect(response.status).toBe(200);
		expect(data).toEqual([
			{
				id: 3359350,
				name: "Road House",
				year: 2024,
			},
		]);
	});

	it("return a movies response for a movie name query with lowercase", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies/title`, {
			body: JSON.stringify({ movieTitle: "road" }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(supabaseSpy).toHaveBeenCalledTimes(1);
		expect(response.status).toBe(200);
		expect(data).toEqual([
			{
				id: 3359350,
				name: "Road House",
				year: 2024,
			},
		]);
	});

	it("return a response for an 404 error for a non existant movie name", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies/title`, {
			body: JSON.stringify({ movieTitle: "zxsa" }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(supabaseSpy).toHaveBeenCalledTimes(1);
		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Movies not found for query zxsa",
		});
	});

	it("return a response for an 422 error for a bad payload", async () => {
		const request = new Request(`${process.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies/title`, {
			body: JSON.stringify({ movie: "zxsa" }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(422);
		expect(data).toMatchObject({
			expected: {
				movieTitle: "",
			},
			message: "Required property",
			type: "validation",
		});
	});
});
