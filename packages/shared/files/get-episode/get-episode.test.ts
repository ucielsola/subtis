import { describe, expect, test } from "bun:test";

// internals
import { getEpisode } from "./get-episode";

describe("getEpisode", () => {
  test("extracts episode from standard format", () => {
    expect(getEpisode("Show.Name.S01E02.1080p")).toBe("S01E02");
  });

  test("extracts episode from mixed case format", () => {
    expect(getEpisode("Show.Name.S01E02.1080p")).toBe("S01E02");
  });

  test("extracts episode from uppercase format", () => {
    expect(getEpisode("Show.Name.S01E02")).toBe("S01E02");
  });

  test("returns empty string when no episode pattern found", () => {
    expect(getEpisode("Movie.Name.2023.1080p")).toBe("");
  });

  test("handles multiple season/episode patterns and returns first match", () => {
    expect(getEpisode("Show.S01E02.S01E03.1080p")).toBe("S01E02");
  });

  test("handles double-digit season and episode numbers", () => {
    expect(getEpisode("Show.Name.S12E15.1080p")).toBe("S12E15");
  });
});
