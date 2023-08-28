import { describe, it } from "vitest";

import { getFullImdbId } from "../imdb";

describe("getFullImdbId", () => {
  it("should return full imdb id", ({ expect }) => {
    const fullImdbId = getFullImdbId(17053204);
    expect(fullImdbId).toBe("tt17053204");
  });

  it("should return full imdb id", ({ expect }) => {
    const fullImdbId = getFullImdbId(11710248);
    expect(fullImdbId).toBe("tt11710248");
  });

  it("should return full imdb id", ({ expect }) => {
    const fullImdbId = getFullImdbId(26675777);
    expect(fullImdbId).toBe("tt26675777");
  });
});
