import { expect, test } from "bun:test";

// shared
import { getTitleFileNameMetadata } from "@subtis/shared";

// internals
import { getSubDivXSubtitle } from "../subdivx";

test('should return an search params for "Guardians of the Galaxy Vol 3 (2023)" for page 1', async () => {
  const titleFileNameMetadata = getTitleFileNameMetadata({
    titleFileName: "Guardians.Of.The.Galaxy.Vol..3.2023.720p.WEBRip.x264.AAC-[YTS.MX].mp4",
  });
  const subtitle = await getSubDivXSubtitle({
    titleFileNameMetadata,
    titleProviderQuery: "Guardians of the Galaxy Vol 3 2023",
  });

  expect(subtitle).toEqual({
    downloadFileName: "Guardians.Of.The.Galaxy.Vol..3.2023.720p.WEBRip.x264.AAC-[YTS.MX].srt",
    fileExtension: "zip",
    subtitleCompressedFileName: "guardians-of-the-galaxy-vol-3-720p-yts-subdivx.zip",
    subtitleFileNameWithoutExtension: "guardians-of-the-galaxy-vol-3-720p-yts-subdivx",
    subtitleGroupName: "SubDivX",
    subtitleLink: "https://subdivx.com/sub9/666540.zip",
    subtitleSrtFileName: "guardians-of-the-galaxy-vol-3-720p-yts-subdivx.srt",
    lang: "es",
  });
});
