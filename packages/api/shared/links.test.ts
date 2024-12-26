import { describe, expect, it } from "bun:test";

// internals
import { getSubtitleShortLink } from "./links";

describe("getSubtitleShortLink", () => {
  it("should generate correct short link format", () => {
    const id = 123456;
    const expectedLink = "https://api.subt.is/v1/subtitle/link/123456";

    const result = getSubtitleShortLink(id);

    expect(result).toBe(expectedLink);
  });

  it("should handle zero id", () => {
    const id = 0;
    const expectedLink = "https://api.subt.is/v1/subtitle/link/0";

    const result = getSubtitleShortLink(id);

    expect(result).toBe(expectedLink);
  });

  it("should handle large numbers", () => {
    const id = 999999999;
    const expectedLink = "https://api.subt.is/v1/subtitle/link/999999999";

    const result = getSubtitleShortLink(id);

    expect(result).toBe(expectedLink);
  });
});
