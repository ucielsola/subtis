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
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY", "YTS.AM", "YTS.AG"],
        is_supported: true,
        release_group_name: "YTS",
        query_matches: [
          "YTS MX",
          "YTS.MX",
          "YTS",
          "YTS.LT",
          "x264-[YTS.LT]",
          "YTS.AM",
          "x264-[YTS.AM]",
          "YIFY",
          "[YTS.MX]",
          "x264-[YTS.AG]",
          "(YTS)",
        ],
      },
      resolution: "1080p",
      year: 2023,
      currentSeason: null,
      currentEpisode: null,
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 720p)", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX].mp4",
    });

    expect(data).toEqual({
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY", "YTS.AM", "YTS.AG"],
        is_supported: true,
        release_group_name: "YTS",
        query_matches: [
          "YTS MX",
          "YTS.MX",
          "YTS",
          "YTS.LT",
          "x264-[YTS.LT]",
          "YTS.AM",
          "x264-[YTS.AM]",
          "YIFY",
          "[YTS.MX]",
          "x264-[YTS.AG]",
          "(YTS)",
        ],
      },
      resolution: "720p",
      year: 2023,
      currentSeason: null,
      currentEpisode: null,
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 1080p)", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4",
    });

    expect(data).toEqual({
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY", "YTS.AM", "YTS.AG"],
        is_supported: true,
        release_group_name: "YTS",
        query_matches: [
          "YTS MX",
          "YTS.MX",
          "YTS",
          "YTS.LT",
          "x264-[YTS.LT]",
          "YTS.AM",
          "x264-[YTS.AM]",
          "YIFY",
          "[YTS.MX]",
          "x264-[YTS.AG]",
          "(YTS)",
        ],
      },
      resolution: "1080p",
      year: 2023,
      currentSeason: null,
      currentEpisode: null,
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 2160p)", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX].mp4",
    });

    expect(data).toEqual({
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY", "YTS.AM", "YTS.AG"],
        is_supported: true,
        release_group_name: "YTS",
        query_matches: [
          "YTS MX",
          "YTS.MX",
          "YTS",
          "YTS.LT",
          "x264-[YTS.LT]",
          "YTS.AM",
          "x264-[YTS.AM]",
          "YIFY",
          "[YTS.MX]",
          "x264-[YTS.AG]",
          "(YTS)",
        ],
      },
      resolution: "2160p",
      year: 2023,
      currentSeason: null,
      currentEpisode: null,
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 3D)", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX].mp4",
    });

    expect(data).toEqual({
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY", "YTS.AM", "YTS.AG"],
        is_supported: true,
        release_group_name: "YTS",
        query_matches: [
          "YTS MX",
          "YTS.MX",
          "YTS",
          "YTS.LT",
          "x264-[YTS.LT]",
          "YTS.AM",
          "x264-[YTS.AM]",
          "YIFY",
          "[YTS.MX]",
          "x264-[YTS.AG]",
          "(YTS)",
        ],
      },
      resolution: "3D",
      year: 2023,
      currentSeason: null,
      currentEpisode: null,
    });
  });

  test("The Super Mario Bros | 2023 | CODY", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY.mkv",
    });

    expect(data).toEqual({
      fileNameWithoutExtension: "The.Super.Mario.Bros.Movie.2023.1080p.WEBRip.H265-CODY",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["CODY"],
        is_supported: true,
        release_group_name: "CODY",
        query_matches: ["CODY", "H265-CODY"],
      },
      resolution: "1080p",
      year: 2023,
      currentSeason: null,
      currentEpisode: null,
    });
  });

  test("Evil Dead Rise | 2023 | GalaxyRG", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv",
    });

    const releaseGroup: ReleaseGroup = {
      file_attributes: [
        "GalaxyRG",
        "x264-Galax",
        "x265-Galax",
        "x264-GalaxyRG",
        "x265-GalaxyRG",
        "Galaxy",
        "10bit-GalaxyRG265",
        "10bit-GalaxyRG264",
      ],
      is_supported: true,
      release_group_name: "GalaxyRG",
      query_matches: ["GalaxyRG"],
    };
    expect(data).toEqual({
      fileNameWithoutExtension: "Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG",
      name: "Evil Dead Rise",
      releaseGroup,
      resolution: "1080p",
      year: 2023,
      currentSeason: null,
      currentEpisode: null,
    });
  });

  test("The Flash | 2023 | RiGHTNOW", () => {
    const data = getTitleFileNameMetadata({
      titleFileName: "The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW.mkv",
    });

    const releaseGroup: ReleaseGroup = {
      file_attributes: ["RiGHTNOW"],
      is_supported: true,
      release_group_name: "RiGHTNOW",
      query_matches: ["RiGHTNOW"],
    };
    expect(data).toEqual({
      fileNameWithoutExtension: "The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW",
      name: "The Flash",
      releaseGroup,
      resolution: "1080p",
      year: 2023,
      currentSeason: null,
      currentEpisode: null,
    });
  });

  test("should correctly parse a movie string with year and resolution", () => {
    const result = getTitleFileNameMetadata({
      titleFileName: "Avatar (2009) 1080p x264 YTS.MX.mp4",
    });

    expect(result).toEqual({
      fileNameWithoutExtension: "Avatar.(2009).1080p.x264.YTS.MX",
      name: "Avatar",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY", "YTS.AM", "YTS.AG"],
        is_supported: true,
        release_group_name: "YTS",
        query_matches: [
          "YTS MX",
          "YTS.MX",
          "YTS",
          "YTS.LT",
          "x264-[YTS.LT]",
          "YTS.AM",
          "x264-[YTS.AM]",
          "YIFY",
          "[YTS.MX]",
          "x264-[YTS.AG]",
          "(YTS)",
        ],
      },
      resolution: "1080p",
      year: 2009,
      currentSeason: null,
      currentEpisode: null,
    });
  });

  test("should recognize release groups not supported in the DB", () => {
    const result = getTitleFileNameMetadata({
      titleFileName: "Avatar (2009) 1080p x264 UNKNOWN.mp4",
    });
    expect(result).toMatchObject({
      name: "Avatar",
      releaseGroup: undefined,
      resolution: "1080p",
      year: 2009,
    });
  });
});
