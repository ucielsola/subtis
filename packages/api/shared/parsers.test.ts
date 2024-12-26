import { describe, expect, test } from "bun:test";

// internals
import { getParsedRipType } from "./parsers";

describe("getParsedRipType", () => {
  test("returns null for null input", () => {
    expect(getParsedRipType(null)).toBe(null);
  });

  test("correctly parses BluRay variants", () => {
    expect(getParsedRipType("bluray")).toBe("BluRay");
    expect(getParsedRipType("blu-ray")).toBe("BluRay");
  });

  test("correctly parses HDRip", () => {
    expect(getParsedRipType("hdrip")).toBe("HDRip");
  });

  test("correctly parses Theater", () => {
    expect(getParsedRipType("theater")).toBe("Theater");
  });

  test("correctly parses BrRip", () => {
    expect(getParsedRipType("brrip")).toBe("BrRip");
  });

  test("correctly parses web variants", () => {
    expect(getParsedRipType("webrip")).toBe("WEBRip");
    expect(getParsedRipType("web-dl")).toBe("Web-DL");
    expect(getParsedRipType("web")).toBe("WEB");
  });

  test("throws error for unknown rip type", () => {
    expect(() => getParsedRipType("unknown")).toThrow("Unknown rip type: unknown");
  });
});
