import { describe, expect, it } from "bun:test";

import type { CurrentTitle } from "../app";
import { getQueryForTorrentProvider } from "../utils/query";

describe("getQueryForTorrentProvider", () => {
  it("should return the name and year when episode is null", () => {
    const title = { name: "Example's Movie", year: 2021, episode: null };
    const result = getQueryForTorrentProvider(title as CurrentTitle);
    expect(result).toBe("examples movie 2021");
  });

  it("should return the name and episode when episode is a string", () => {
    const title = { name: "Example's Show", year: 2021, episode: "S01E01" };
    const result = getQueryForTorrentProvider(title as CurrentTitle);
    expect(result).toBe("examples show S01E01");
  });

  it("should handle names with special characters", () => {
    const title = { name: "Café & Croissants", year: 2021, episode: null };
    const result = getQueryForTorrentProvider(title as CurrentTitle);
    expect(result).toBe("cafe & croissants 2021");
  });

  it("should handle names with apostrophes", () => {
    const title = { name: "O'Brien's Adventure", year: 2021, episode: null };
    const result = getQueryForTorrentProvider(title as CurrentTitle);
    expect(result).toBe("obriens adventure 2021");
  });
});
