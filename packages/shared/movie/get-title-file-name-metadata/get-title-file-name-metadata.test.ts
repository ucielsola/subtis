import { describe, expect, test } from "bun:test";

// indexer
import type { ReleaseGroup } from "@subtis/indexer/release-groups";

// shared
import { getTitleFileNameMetadata } from "./get-title-file-name-metadata";

describe("getTitleFileNameMetadata", () => {
  test("Unsupported year movie", () => {
    expect(() => {
      getTitleFileNameMetadata("The.Super.Mario.Bros..Movie.1788.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4");
    }).toThrow("Unsupported year movie");
  });

  test("Unsupported file extension", () => {
    expect(() => {
      getTitleFileNameMetadata("The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].zip");
    }).toThrow();
  });

  test("No file extension", () => {
    expect(() => getTitleFileNameMetadata("Avatar (2009) 1080p YTS.MX")).toThrow();
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 1080p)", () => {
    const data = getTitleFileNameMetadata("The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4");

    expect(data).toEqual({
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY"],
        is_supported: true,
        name: "YTS",
        searchable_opensubtitles_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
        searchable_subdivx_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
      },
      resolution: "1080p",
      searchableQuery: "The Super Mario Bros Movie (2023)",
      year: 2023,
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 720p)", () => {
    const data = getTitleFileNameMetadata("The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX].mp4");

    expect(data).toEqual({
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY"],
        is_supported: true,
        name: "YTS",
        searchable_opensubtitles_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
        searchable_subdivx_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
      },
      resolution: "720p",
      searchableQuery: "The Super Mario Bros Movie (2023)",
      year: 2023,
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 1080p)", () => {
    const data = getTitleFileNameMetadata("The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4");

    expect(data).toEqual({
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY"],
        is_supported: true,
        name: "YTS",
        searchable_opensubtitles_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
        searchable_subdivx_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
      },
      resolution: "1080p",
      searchableQuery: "The Super Mario Bros Movie (2023)",
      year: 2023,
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 2160p)", () => {
    const data = getTitleFileNameMetadata("The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX].mp4");

    expect(data).toEqual({
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY"],
        is_supported: true,
        name: "YTS",
        searchable_opensubtitles_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
        searchable_subdivx_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
      },
      resolution: "2160p",
      searchableQuery: "The Super Mario Bros Movie (2023)",
      year: 2023,
    });
  });

  test("The Super Mario Bros | 2023 | YTS-MX | (in 3D)", () => {
    const data = getTitleFileNameMetadata("The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX].mp4");

    expect(data).toEqual({
      fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX]",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY"],
        is_supported: true,
        name: "YTS",
        searchable_opensubtitles_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
        searchable_subdivx_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
      },
      resolution: "3D",
      searchableQuery: "The Super Mario Bros Movie (2023)",
      year: 2023,
    });
  });

  test("The Super Mario Bros | 2023 | CODY", () => {
    const data = getTitleFileNameMetadata("The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY.mkv");

    expect(data).toEqual({
      fileNameWithoutExtension: "The.Super.Mario.Bros.Movie.2023.1080p.WEBRip.H265-CODY",
      name: "The Super Mario Bros Movie",
      releaseGroup: {
        file_attributes: ["CODY"],
        is_supported: true,
        name: "CODY",
        searchable_opensubtitles_name: ["CODY"],
        searchable_subdivx_name: ["H265-CODY"],
      },
      resolution: "1080p",
      searchableQuery: "The Super Mario Bros Movie (2023)",
      year: 2023,
    });
  });

  test("Evil Dead Rise | 2023 | GalaxyRG", () => {
    const data = getTitleFileNameMetadata("Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv");

    const releaseGroup: ReleaseGroup = {
      file_attributes: ["GalaxyRG"],
      is_supported: true,
      name: "GalaxyRG",
      searchable_opensubtitles_name: ["GalaxyRG"],
      searchable_subdivx_name: ["GalaxyRG"],
    };
    expect(data).toEqual({
      fileNameWithoutExtension: "Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG",
      name: "Evil Dead Rise",
      releaseGroup,
      resolution: "1080p",
      searchableQuery: "Evil Dead Rise (2023)",
      year: 2023,
    });
  });

  test("The Flash | 2023 | RiGHTNOW", () => {
    const data = getTitleFileNameMetadata("The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW.mkv");

    const releaseGroup: ReleaseGroup = {
      file_attributes: ["RiGHTNOW"],
      is_supported: true,
      name: "RiGHTNOW",
      searchable_opensubtitles_name: ["RiGHTNOW"],
      searchable_subdivx_name: ["RIGHTNOW"],
    };
    expect(data).toEqual({
      fileNameWithoutExtension: "The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW",
      name: "The Flash",
      releaseGroup,
      resolution: "1080p",
      searchableQuery: "The Flash (2023)",
      year: 2023,
    });
  });

  test("should correctly parse a movie string with year and resolution", () => {
    const result = getTitleFileNameMetadata("Avatar (2009) 1080p x264 YTS.MX.mp4");

    expect(result).toEqual({
      fileNameWithoutExtension: "Avatar.(2009).1080p.x264.YTS.MX",
      name: "Avatar",
      releaseGroup: {
        file_attributes: ["YTS.MX", "YTS.LT", "YIFY"],
        is_supported: true,
        name: "YTS",
        searchable_opensubtitles_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
        searchable_subdivx_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YIFY"],
      },
      resolution: "1080p",
      searchableQuery: "Avatar (2009)",
      year: 2009,
    });
  });

  test("should recognize release groups not supported in the DB", () => {
    const result = getTitleFileNameMetadata("Avatar (2009) 1080p x264 UNKNOWN.mp4");
    expect(result).toMatchObject({
      name: "Avatar",
      releaseGroup: undefined,
      resolution: "1080p",
      year: 2009,
    });
  });
});
