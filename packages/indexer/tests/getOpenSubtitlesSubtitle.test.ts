import { expect, test } from "bun:test";

// internals
import { getOpenSubtitlesSubtitle } from "../opensubtitles";

test("should return a subtitle link giving a movie, release group and quality", async () => {
  const releaseGroup = {
    file_attributes: [""],
    is_supported: false,
    release_group_name: "YTS-MX",
    searchable_opensubtitles_name: ["YTS.MX"],
    searchable_subdivx_name: ["YTS MX"],
  };
  const titleFileNameMetadata = {
    fileNameWithoutExtension: "",
    name: "Meg 2 The Trench",
    releaseGroup,
    resolution: "1080p",
    searchableQuery: "Meg 2 The Trench (2023)",
    year: 2023,
  };

  const subtitle = await getOpenSubtitlesSubtitle({
    imdbId: 9224104,
    titleFileNameMetadata,
    // biome-ignore lint/suspicious/noExplicitAny: only for testing purposes
  } as any);

  expect(subtitle.subtitleLink).toBeTypeOf("string");

  expect(subtitle.fileExtension).toBe("srt");
  expect(subtitle.subtitleGroupName).toBe("OpenSubtitles");
  expect(subtitle.subtitleSrtFileName).toBe("meg-2-the-trench-1080p-yts-mx-opensubtitles.srt");
  expect(subtitle.subtitleCompressedFileName).toBe("meg-2-the-trench-1080p-yts-mx-opensubtitles.srt");
  expect(subtitle.subtitleFileNameWithoutExtension).toBe("meg-2-the-trench-1080p-yts-mx-opensubtitles");
});

test("should return a subtitle link giving a movie, release group and quality", async () => {
  const releaseGroup = {
    file_attributes: [""],
    is_supported: false,
    release_group_name: "YTS-MX",
    searchable_opensubtitles_name: ["YTS.MX"],
    searchable_subdivx_name: ["YTS MX"],
  };
  const titleFileNameMetadata = {
    fileNameWithoutExtension: "",
    name: "Junk Head",
    releaseGroup,
    resolution: "1080p",
    searchableQuery: "Junk Head (2017)",
    year: 2017,
  };

  const subtitle = await getOpenSubtitlesSubtitle({
    imdbId: 6848928,
    titleFileNameMetadata,
    // biome-ignore lint/suspicious/noExplicitAny: only for testing purposes
  } as any);

  expect(subtitle.subtitleLink).toBeTypeOf("string");

  expect(subtitle.fileExtension).toBe("srt");
  expect(subtitle.subtitleGroupName).toBe("OpenSubtitles");
  expect(subtitle.subtitleSrtFileName).toBe("junk-head-1080p-yts-mx-opensubtitles.srt");
  expect(subtitle.subtitleCompressedFileName).toBe("junk-head-1080p-yts-mx-opensubtitles.srt");
  expect(subtitle.subtitleFileNameWithoutExtension).toBe("junk-head-1080p-yts-mx-opensubtitles");
});
