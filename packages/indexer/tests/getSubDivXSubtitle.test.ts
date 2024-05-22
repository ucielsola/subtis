import { expect, test } from "bun:test";

// shared
import { getTitleFileNameMetadata } from "@subtis/shared";

// internals
import type { CurrentTitle } from "../app";
import { getSubDivXSubtitle } from "../subdivx";
import { getQueryForTorrentProvider } from "../utils/query";

test('should return a subtitle metadata for "Guardians of the Galaxy Vol 3"', async () => {
  const titleFileNameMetadata = getTitleFileNameMetadata({
    titleFileName: "Guardians.Of.The.Galaxy.Vol..3.2023.720p.WEBRip.x264.AAC-[YTS.MX].mp4",
  });

  const titleProviderQuery = getQueryForTorrentProvider({
    name: titleFileNameMetadata.name,
    year: titleFileNameMetadata.year,
    episode: null,
  } as CurrentTitle);

  const subtitle = await getSubDivXSubtitle({
    titleFileNameMetadata,
    titleProviderQuery,
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

test('should return a subtitle metadata for "Shogun S01E01"', async () => {
  const titleFileNameMetadata = getTitleFileNameMetadata({
    titleFileName: "shogun.2024.s01e01.1080p.web.h264-successfulcrab.mkv",
  });

  const titleProviderQuery = getQueryForTorrentProvider({
    name: titleFileNameMetadata.name,
    year: titleFileNameMetadata.year,
    episode: "S01E01",
  } as CurrentTitle);

  const subtitle = await getSubDivXSubtitle({
    titleFileNameMetadata,
    titleProviderQuery,
  });

  expect(subtitle).toEqual({
    lang: "es",
    subtitleLink: "https://subdivx.com/sub9/676012.zip",
    fileExtension: "zip",
    subtitleGroupName: "SubDivX",
    downloadFileName: "shogun.2024.s01e01.1080p.web.h264-successfulcrab.srt",
    subtitleSrtFileName: "shogun-1080p-successfulcrab-subdivx.srt",
    subtitleCompressedFileName: "shogun-1080p-successfulcrab-subdivx.zip",
    subtitleFileNameWithoutExtension: "shogun-1080p-successfulcrab-subdivx",
  });
});
