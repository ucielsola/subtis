import { expect, test } from "bun:test";

// internals
import { getSubtitleShortLink } from "./links";

test("getSubtitleShortLink", () => {
	expect(getSubtitleShortLink(123)).toBe("http://localhost:5173/123");
});
