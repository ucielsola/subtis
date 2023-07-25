import { describe, it } from "vitest";

import { getArgenteamSubtitleLink } from "../argenteam";

describe("getArgenteamSubtitleLink", () => {
  it("should return a subtitle link giving a movie, release group and quality", async ({
    expect,
  }) => {
    const subtitleLink = await getArgenteamSubtitleLink(
      "The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW.mkv",
      "tt0439572",
    );

    expect(subtitleLink).toEqual({
      fileExtension: "zip",
      subtitleCompressedFileName: "the-flash-1080p-rightnow-argenteam.zip",
      subtitleFileNameWithoutExtension: "the-flash-1080p-rightnow-argenteam",
      subtitleLink:
        "https://argenteam.net/subtitles/90162/The.Flash.%282023%29.WEB-DL.H264.1080p-RiGHTNOW",
      subtitleSrtFileName: "the-flash-1080p-rightnow-argenteam.srt",
    });
  });

  // TODO: Add 3-4 more tests cases
});
