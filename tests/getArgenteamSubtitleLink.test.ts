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
      subtitleGroup: "Argenteam",
      subtitleCompressedFileName: "the-flash-1080p-rightnow-argenteam.zip",
      subtitleFileNameWithoutExtension: "the-flash-1080p-rightnow-argenteam",
      subtitleLink:
        "https://argenteam.net/subtitles/90162/The.Flash.%282023%29.WEB-DL.H264.1080p-RiGHTNOW",
      subtitleSrtFileName: "the-flash-1080p-rightnow-argenteam.srt",
    });
  });

  it("should support YIFY group", async ({ expect }) => {
    const subtitleLink = await getArgenteamSubtitleLink(
      "Gremlins.1984.720p.x264.YIFY.mkv",
      "tt0087363",
    );

    expect(subtitleLink).toEqual({
      subtitleLink:
        "https://argenteam.net/subtitles/64042/Gremlins.%281984%29.BDRip.x264.720p.AAC-YIFY",
      fileExtension: "zip",
      subtitleGroup: "Argenteam",
      subtitleSrtFileName: "gremlins-720p-yify-argenteam.srt",
      subtitleCompressedFileName: "gremlins-720p-yify-argenteam.zip",
      subtitleFileNameWithoutExtension: "gremlins-720p-yify-argenteam",
    });
  });

  // TODO: Add 3-4 more tests cases
});
