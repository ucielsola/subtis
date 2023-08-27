import { describe, it } from "vitest";

import { getImdbLink, getFullImdbId } from "../imdb";

describe("getImdbLink", () => {
  it("should return striped imdb id without 'tt' prefix", ({ expect }) => {
    const imdbId = 17053204;
    const imdbLink = getImdbLink(imdbId);
    const fullImdbId = getFullImdbId(imdbId);

    expect(imdbLink).toBe(`https://www.imdb.com/title/${fullImdbId}`);
  });

  it("should return striped imdb id without 'tt' prefix", ({ expect }) => {
    const imdbId = 11710248;
    const imdbLink = getImdbLink(imdbId);
    const fullImdbId = getFullImdbId(imdbId);

    expect(imdbLink).toBe(`https://www.imdb.com/title/${fullImdbId}`);
  });

  it("should return striped imdb id without 'tt' prefix", ({ expect }) => {
    const imdbId = 26675777;
    const imdbLink = getImdbLink(imdbId);
    const fullImdbId = getFullImdbId(imdbId);

    expect(imdbLink).toBe(`https://www.imdb.com/title/${fullImdbId}`);
  });
});
