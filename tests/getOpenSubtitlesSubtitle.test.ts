import { describe, it } from "vitest";

import { ReleaseGroupNames } from "../release-groups";
import { getOpenSubtitlesSubtitle } from "../opensubtitles";

describe("getOpenSubtitlesSubtitle", () => {
  it("should return a subtitle link giving a movie, release group and quality", async ({
    expect,
  }) => {
    const movieData = {
      name: "Meg 2 The Trench",
      searchableMovieName: "Meg 2 The Trench (2023)",
      year: 2023,
      resolution: "1080p",
      searchableSubDivXName: "YTS MX",
      searchableArgenteamName: "YIFY",
      searchableOpenSubtitlesName: "YTS.MX",
      releaseGroup: "YTS-MX" as ReleaseGroupNames,
    };

    const subtitle = await getOpenSubtitlesSubtitle(movieData, 9224104);

    expect(subtitle.subtitleLink).toBeTypeOf("string");
    expect(subtitle).toContain({
      fileExtension: "srt",
      subtitleGroup: "OpenSubtitles",
      subtitleSrtFileName: "meg-2-the-trench-1080p-yts-mx-opensubtitles.srt",
      subtitleCompressedFileName:
        "meg-2-the-trench-1080p-yts-mx-opensubtitles.srt",
      subtitleFileNameWithoutExtension:
        "meg-2-the-trench-1080p-yts-mx-opensubtitles",
    });
  });

  it("should return a subtitle link giving a movie, release group and quality", async ({
    expect,
  }) => {
    const movieData = {
      name: "Junk Head",
      searchableMovieName: "Junk Head (2017)",
      year: 2017,
      resolution: "1080p",
      searchableSubDivXName: "YTS MX",
      searchableArgenteamName: "YIFY",
      searchableOpenSubtitlesName: "YTS.MX",
      releaseGroup: "YTS-MX" as ReleaseGroupNames,
    };

    const subtitle = await getOpenSubtitlesSubtitle(movieData, 6848928);

    expect(subtitle.subtitleLink).toBeTypeOf("string");
    expect(subtitle).toContain({
      fileExtension: "srt",
      subtitleGroup: "OpenSubtitles",
      subtitleSrtFileName: "junk-head-1080p-yts-mx-opensubtitles.srt",
      subtitleCompressedFileName: "junk-head-1080p-yts-mx-opensubtitles.srt",
      subtitleFileNameWithoutExtension: "junk-head-1080p-yts-mx-opensubtitles",
    });
  });
});
