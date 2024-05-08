import { expect, test } from "bun:test";

// shared
import type { MovieData } from "@subtis/shared";

import { getOpenSubtitlesSubtitle } from "../opensubtitles";
// internals
import type { ReleaseGroup } from "../release-groups";

test("should return a subtitle link giving a movie, release group and quality", async () => {
  const releaseGroup: ReleaseGroup = {
    file_attributes: [""],
    is_supported: false,
    name: "YTS-MX",
    searchable_opensubtitles_name: ["YTS.MX"],
    searchable_subdivx_name: ["YTS MX"],
  };
  const movieData = {
    fileNameWithoutExtension: "",
    name: "Meg 2 The Trench",
    releaseGroup,
    resolution: "1080p",
    searchableMovieName: "Meg 2 The Trench (2023)",
    year: 2023,
  } as MovieData;

  const subtitle = await getOpenSubtitlesSubtitle({
    imdbId: 9224104,
    movieData,
  });

  expect(subtitle.subtitleLink).toBeTypeOf("string");

  expect(subtitle.fileExtension).toBe("srt");
  expect(subtitle.subtitleGroup).toBe("OpenSubtitles");
  expect(subtitle.subtitleSrtFileName).toBe("meg-2-the-trench-1080p-yts-mx-opensubtitles.srt");
  expect(subtitle.subtitleCompressedFileName).toBe("meg-2-the-trench-1080p-yts-mx-opensubtitles.srt");
  expect(subtitle.subtitleFileNameWithoutExtension).toBe("meg-2-the-trench-1080p-yts-mx-opensubtitles");
});

test("should return a subtitle link giving a movie, release group and quality", async () => {
  const releaseGroup: ReleaseGroup = {
    file_attributes: [""],
    is_supported: false,
    name: "YTS-MX",
    searchable_opensubtitles_name: ["YTS.MX"],
    searchable_subdivx_name: ["YTS MX"],
  };
  const movieData = {
    fileNameWithoutExtension: "",
    name: "Junk Head",
    releaseGroup,
    resolution: "1080p",
    searchableMovieName: "Junk Head (2017)",
    year: 2017,
  } as MovieData;

  const subtitle = await getOpenSubtitlesSubtitle({
    imdbId: 6848928,
    movieData,
  });

  expect(subtitle.subtitleLink).toBeTypeOf("string");

  expect(subtitle.fileExtension).toBe("srt");
  expect(subtitle.subtitleGroup).toBe("OpenSubtitles");
  expect(subtitle.subtitleSrtFileName).toBe("junk-head-1080p-yts-mx-opensubtitles.srt");
  expect(subtitle.subtitleCompressedFileName).toBe("junk-head-1080p-yts-mx-opensubtitles.srt");
  expect(subtitle.subtitleFileNameWithoutExtension).toBe("junk-head-1080p-yts-mx-opensubtitles");
});
