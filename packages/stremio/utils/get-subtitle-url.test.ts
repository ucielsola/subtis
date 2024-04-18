import { describe, expect, test } from "bun:test";

// internals
import { getSubtitleUrl } from "./get-subtitle-url";

describe("Stremio | Utils", () => {
	test("getSubtitleUrl", () => {
		const bytes = "123456";
		const fileName = "movie.mp4";
		const url = getSubtitleUrl({ bytes, fileName });

		expect(url).toBe("http://localhost:8787/v1/integrations/stremio/123456/movie.mp4");
	});
});
