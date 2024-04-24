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
		const data = await response.text();

		expect(response.status).toBe(200);
		expect(data).toBe(
			"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/road-house-1080p-yts-subdivx.srt?download=Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
		);
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
