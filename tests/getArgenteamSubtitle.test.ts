import { describe, it } from "vitest";

import { getArgenteamSubtitle } from "../argenteam";

describe("getArgenteamSubtitle", () => {
  it("should return a subtitle link giving a movie, release group and quality", async ({
    expect,
  }) => {
    const subtitleLink = await getArgenteamSubtitle(
      "tt0439572",
      "RiGHTNOW",
      "1080p",
    );

    expect(subtitleLink).toBe(
      "https://argenteam.net/subtitles/90162/The.Flash.%282023%29.WEB-DL.H264.1080p-RiGHTNOW",
    );
  });

  // TODO: Add 3-4 more tests cases
});
