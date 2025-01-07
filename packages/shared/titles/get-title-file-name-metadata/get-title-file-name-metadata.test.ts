import { describe, expect, test } from "bun:test";

// indexer
import type { ReleaseGroup } from "@subtis/indexer/release-groups";

// shared
import { getTitleFileNameMetadata } from "./get-title-file-name-metadata";

describe("getTitleFileNameMetadata", () => {
  test("Unsupported file extension", () => {
    expect(() => {
      getTitleFileNameMetadata({
        titleFileName: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].zip",
      });
    }).toThrow();
  });

  test("No file extension", () => {
    expect(() =>
      getTitleFileNameMetadata({
        titleFileName: "Avatar (2009) 1080p YTS.MX",
      }),
    ).toThrow();
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 1080p)", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4",
    });

    expect(data).toEqual({
      year: 2023,
      ripType: "bluray",
      resolution: "1080",
      releaseGroup: {
        is_supported: true,
        release_group_name: "YTS",
        matches: [
          "YTS",
          "(YTS)",
          "YTS.LT",
          "YTS.AG",
          "YTS.AM",
          "YTS.MX",
          "YTS MX",
          "[YTS.MX]",
          "YIFY",
          "1-[YTS.MX]",
          "x264-[YTS.AM]",
          "x264-[YTS.AG]",
          "x264-[YTS.LT]",
          "AAC-[YTS.MX]",
          "{{YIFY torrent}}",
        ],
      },
      currentSeason: null,
      currentEpisode: null,
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 720p)", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX].mp4",
    });

    expect(data).toEqual({
      year: 2023,
      ripType: "bluray",
      resolution: "720",
      releaseGroup: {
        is_supported: true,
        release_group_name: "YTS",
        matches: [
          "YTS",
          "(YTS)",
          "YTS.LT",
          "YTS.AG",
          "YTS.AM",
          "YTS.MX",
          "YTS MX",
          "[YTS.MX]",
          "YIFY",
          "1-[YTS.MX]",
          "x264-[YTS.AM]",
          "x264-[YTS.AG]",
          "x264-[YTS.LT]",
          "AAC-[YTS.MX]",
          "{{YIFY torrent}}",
        ],
      },
      currentSeason: null,
      currentEpisode: null,
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 1080p)", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4",
    });

    expect(data).toEqual({
      year: 2023,
      ripType: "bluray",
      resolution: "1080",
      releaseGroup: {
        is_supported: true,
        release_group_name: "YTS",
        matches: [
          "YTS",
          "(YTS)",
          "YTS.LT",
          "YTS.AG",
          "YTS.AM",
          "YTS.MX",
          "YTS MX",
          "[YTS.MX]",
          "YIFY",
          "1-[YTS.MX]",
          "x264-[YTS.AM]",
          "x264-[YTS.AG]",
          "x264-[YTS.LT]",
          "AAC-[YTS.MX]",
          "{{YIFY torrent}}",
        ],
      },
      currentSeason: null,
      currentEpisode: null,
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 2160p)", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX].mp4",
    });

    expect(data).toEqual({
      year: 2023,
      ripType: "bluray",
      resolution: "2160",
      releaseGroup: {
        is_supported: true,
        release_group_name: "YTS",
        matches: [
          "YTS",
          "(YTS)",
          "YTS.LT",
          "YTS.AG",
          "YTS.AM",
          "YTS.MX",
          "YTS MX",
          "[YTS.MX]",
          "YIFY",
          "1-[YTS.MX]",
          "x264-[YTS.AM]",
          "x264-[YTS.AG]",
          "x264-[YTS.LT]",
          "AAC-[YTS.MX]",
          "{{YIFY torrent}}",
        ],
      },
      currentSeason: null,
      currentEpisode: null,
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 3D)", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX].mp4",
    });

    expect(data).toEqual({
      year: 2023,
      ripType: "bluray",
      resolution: "3D",
      releaseGroup: {
        is_supported: true,
        release_group_name: "YTS",
        matches: [
          "YTS",
          "(YTS)",
          "YTS.LT",
          "YTS.AG",
          "YTS.AM",
          "YTS.MX",
          "YTS MX",
          "[YTS.MX]",
          "YIFY",
          "1-[YTS.MX]",
          "x264-[YTS.AM]",
          "x264-[YTS.AG]",
          "x264-[YTS.LT]",
          "AAC-[YTS.MX]",
          "{{YIFY torrent}}",
        ],
      },
      currentSeason: null,
      currentEpisode: null,
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
    });
  });

  test("The Super Mario Bros | 2023 | CODY", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY.mkv",
    });

    expect(data).toEqual({
      year: 2023,
      ripType: "webrip",
      resolution: "1080",
      releaseGroup: {
        is_supported: true,
        release_group_name: "CODY",
        matches: ["CODY", "H265-CODY"],
      },
      currentSeason: null,
      currentEpisode: null,
      fileNameWithoutExtension: "The.Super.Mario.Bros.Movie.2023.1080p.WEBRip.H265-CODY",
      name: "The Super Mario Bros Movie",
    });
  });

  test("Evil Dead Rise | 2023 | GalaxyRG", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv",
    });

    const releaseGroup: ReleaseGroup = {
      is_supported: true,
      release_group_name: "GalaxyRG",
      matches: [
        "GalaxyRG",
        "x264-Galax",
        "x265-Galax",
        "x264-GalaxyRG",
        "x265-GalaxyRG",
        "Galaxy",
        "10bit-GalaxyRG265",
        "10bit-GalaxyRG264",
      ],
    };

    expect(data).toEqual({
      year: 2023,
      ripType: "webrip",
      resolution: "1080",
      releaseGroup,
      currentSeason: null,
      currentEpisode: null,
      fileNameWithoutExtension: "Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG",
      name: "Evil Dead Rise",
    });
  });

  test("The Flash | 2023 | RiGHTNOW", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW.mkv",
    });

    const releaseGroup: ReleaseGroup = {
      is_supported: true,
      release_group_name: "RiGHTNOW",
      matches: ["RiGHTNOW"],
    };

    expect(data).toEqual({
      year: 2023,
      ripType: "web-dl",
      resolution: "1080",
      releaseGroup,
      currentSeason: null,
      currentEpisode: null,
      fileNameWithoutExtension: "The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW",
      name: "The Flash",
    });
  });

  test("should correctly parse a movie string with year and resolution", () => {
    const result = getTitleFileNameMetadata({
      titleFileName: "Avatar (2009) 1080p x264 YTS.MX.mp4",
    });

    expect(result).toEqual({
      year: 2009,
      ripType: "",
      resolution: "1080",
      releaseGroup: {
        is_supported: true,
        release_group_name: "YTS",
        matches: [
          "YTS",
          "(YTS)",
          "YTS.LT",
          "YTS.AG",
          "YTS.AM",
          "YTS.MX",
          "YTS MX",
          "[YTS.MX]",
          "YIFY",
          "1-[YTS.MX]",
          "x264-[YTS.AM]",
          "x264-[YTS.AG]",
          "x264-[YTS.LT]",
          "AAC-[YTS.MX]",
          "{{YIFY torrent}}",
        ],
      },
      currentSeason: null,
      currentEpisode: null,
      fileNameWithoutExtension: "Avatar.(2009).1080p.x264.YTS.MX",
      name: "Avatar",
    });
  });

  test("should recognize release groups not supported in the DB", () => {
    const result = getTitleFileNameMetadata({
      titleFileName: "Avatar (2009) 1080p x264 UNKNOWN.mp4",
    });

    expect(result).toMatchObject({
      year: 2009,
      ripType: "",
      resolution: "1080",
      releaseGroup: undefined,
      currentSeason: null,
      currentEpisode: null,
      fileNameWithoutExtension: "Avatar.(2009).1080p.x264.UNKNOWN",
      name: "Avatar",
    });
  });
});
