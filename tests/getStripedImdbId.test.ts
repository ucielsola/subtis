import { describe, it } from "vitest";

import { getStripedImdbId } from "../imdb";

describe("getStripedImdbId", () => {
  it("should return striped imdb id without 'tt' prefix", ({ expect }) => {
    const stripedImdbId = getStripedImdbId("tt17053204");
    expect(stripedImdbId).toBe(17053204);
  });

  it("should return striped imdb id without 'tt' prefix", ({ expect }) => {
    const stripedImdbId = getStripedImdbId("11710248");
    expect(stripedImdbId).toBe(11710248);
  });

  it("should return striped imdb id without 'tt' prefix", ({ expect }) => {
    const stripedImdbId = getStripedImdbId("26675777");
    expect(stripedImdbId).toBe(26675777);
  });
});
