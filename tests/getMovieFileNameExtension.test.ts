import { describe, it } from "vitest";

import { getMovieFileNameExtension } from "../utils";

describe("getMovieFileNameExtension", () => {
  it('should return mp4 for "Valley.Of.The.Witch.2014.720p.WEBRip.x264.AAC-[YTS.MX].mp4"', async ({
    expect,
  }) => {
    const fileExtension = getMovieFileNameExtension(
      "Valley.Of.The.Witch.2014.720p.WEBRip.x264.AAC-[YTS.MX].mp4",
    );
    expect(fileExtension).toBe("mp4");
  });

  it('should return mp4 for "Lupu.2013.720p.WEBRip.x264.AAC-[YTS.MX].mkv"', async ({
    expect,
  }) => {
    const fileExtension = getMovieFileNameExtension(
      "Lupu.2013.720p.WEBRip.x264.AAC-[YTS.MX].mkv",
    );
    expect(fileExtension).toBe("mkv");
  });
});
