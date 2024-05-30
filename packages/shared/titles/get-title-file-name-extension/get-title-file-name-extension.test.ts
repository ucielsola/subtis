import { describe, expect, test } from "bun:test";

// shared
import { getTitleFileNameExtension } from "./get-title-file-name-extension";

describe("getTitleFileNameExtension", () => {
  test('should return mp4 for "Valley.Of.The.Witch.2014.720p.WEBRip.x264.AAC-[YTS.MX].mp4"', async () => {
    const fileExtension = getTitleFileNameExtension("Valley.Of.The.Witch.2014.720p.WEBRip.x264.AAC-[YTS.MX].mp4");
    expect(fileExtension).toBe("mp4");
  });

  test('should return mp4 for "Lupu.2013.720p.WEBRip.x264.AAC-[YTS.MX].mkv"', async () => {
    const fileExtension = getTitleFileNameExtension("Lupu.2013.720p.WEBRip.x264.AAC-[YTS.MX].mkv");
    expect(fileExtension).toBe("mkv");
  });
});
