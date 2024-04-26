import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { shortener } from "./shortener";

describe("API | /:id", () => {
	test("Valid Param Request with existing subtitleId", async () => {
		const request = {
			method: "GET",
		};

		const response = await shortener.request("/2748", request, getMockEnv());

		expect(response.status).toBe(302);
	});

	test("Valid Param Request with non-existing subtitleId", async () => {
		const request = {
			method: "GET",
		};

		const response = await shortener.request("/27422324", request, getMockEnv());
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Subtitle not found for id",
		});
	});
});
