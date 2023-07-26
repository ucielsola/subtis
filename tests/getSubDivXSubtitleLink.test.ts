import { describe, it } from "vitest";

import { getSubDivXSubtitleLink } from "../subdivx";

describe("getSubDivXSubtitleLink", () => {
  it('should return an search params for "Guardians of the Galaxy Vol 3 (2023)" for page 1', async ({
    expect,
  }) => {
    const subtitleLink = await getSubDivXSubtitleLink(
      "Guardians.Of.The.Galaxy.Vol..3.2023.720p.WEBRip.x264.AAC-[YTS.MX].mp4",
    );

    expect(subtitleLink).toEqual({
      subtitleGroup: "SubDivX",
      subtitleLink: "https://subdivx.com/sub9/666540.zip",
      subtitleSrtFileName:
        "guardians-of-the-galaxy-vol-3-720p-yts-mx-subdivx.srt",
      subtitleCompressedFileName:
        "guardians-of-the-galaxy-vol-3-720p-yts-mx-subdivx.zip",
      subtitleFileNameWithoutExtension:
        "guardians-of-the-galaxy-vol-3-720p-yts-mx-subdivx",
      fileExtension: "zip",
    });
  });
});
