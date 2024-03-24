import { describe, expect, test } from "bun:test";

// indexer
import type { ReleaseGroup } from "@subtis/indexer/release-groups";

// shared
import { getMovieMetadata } from "./get-movie-metadata";

describe("getMovieMetadata", () => {
	test("Unsupported year movie", () => {
		expect(() => {
			getMovieMetadata("The.Super.Mario.Bros..Movie.1788.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4");
		}).toThrow("Unsupported year movie");
	});

	test("Unsupported file extension", () => {
		expect(() => {
			getMovieMetadata("The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].zip");
		}).toThrow("Unsupported file extension");
	});

	test("No file extension", () => {
		expect(() => getMovieMetadata("Avatar (2009) 1080p YTS.MX")).toThrow("Unsupported file extension");
	});

	test("The Super Mario Bros | 2023 | YTS-MX | (in 1080p)", () => {
		const data = getMovieMetadata("The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4");

		expect(data).toEqual({
			fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]",
			name: "The Super Mario Bros Movie",
			releaseGroup: {
				fileAttributes: ["YTS.MX"],
				isSupported: true,
				name: "YTS-MX",
				searchableOpenSubtitlesName: ["YTS.MX"],
				searchableSubDivXName: ["YTS MX", "YTS.MX", "YTS"],
				website: "https://yts.mx",
			},
			resolution: "1080p",
			searchableMovieName: "The Super Mario Bros Movie (2023)",
			year: 2023,
		});
	});

	test("The Super Mario Bros | 2023 | YTS-MX | (in 720p)", () => {
		const data = getMovieMetadata("The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX].mp4");

		expect(data).toEqual({
			fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX]",
			name: "The Super Mario Bros Movie",
			releaseGroup: {
				fileAttributes: ["YTS.MX"],
				isSupported: true,
				name: "YTS-MX",
				searchableOpenSubtitlesName: ["YTS.MX"],
				searchableSubDivXName: ["YTS MX", "YTS.MX", "YTS"],
				website: "https://yts.mx",
			},
			resolution: "720p",
			searchableMovieName: "The Super Mario Bros Movie (2023)",
			year: 2023,
		});
	});

	test("The Super Mario Bros | 2023 | YTS-MX | (in 1080p)", () => {
		const data = getMovieMetadata("The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4");

		expect(data).toEqual({
			fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]",
			name: "The Super Mario Bros Movie",
			releaseGroup: {
				fileAttributes: ["YTS.MX"],
				isSupported: true,
				name: "YTS-MX",
				searchableOpenSubtitlesName: ["YTS.MX"],
				searchableSubDivXName: ["YTS MX", "YTS.MX", "YTS"],
				website: "https://yts.mx",
			},
			resolution: "1080p",
			searchableMovieName: "The Super Mario Bros Movie (2023)",
			year: 2023,
		});
	});

	test("The Super Mario Bros | 2023 | YTS-MX | (in 2160p)", () => {
		const data = getMovieMetadata("The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX].mp4");

		expect(data).toEqual({
			fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX]",
			name: "The Super Mario Bros Movie",
			releaseGroup: {
				fileAttributes: ["YTS.MX"],
				isSupported: true,
				name: "YTS-MX",
				searchableOpenSubtitlesName: ["YTS.MX"],
				searchableSubDivXName: ["YTS MX", "YTS.MX", "YTS"],
				website: "https://yts.mx",
			},
			resolution: "2160p",
			searchableMovieName: "The Super Mario Bros Movie (2023)",
			year: 2023,
		});
	});

	test("The Super Mario Bros | 2023 | YTS-MX | (in 3D)", () => {
		const data = getMovieMetadata("The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX].mp4");

		expect(data).toEqual({
			fileNameWithoutExtension: "The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX]",
			name: "The Super Mario Bros Movie",
			releaseGroup: {
				fileAttributes: ["YTS.MX"],
				isSupported: true,
				name: "YTS-MX",
				searchableOpenSubtitlesName: ["YTS.MX"],
				searchableSubDivXName: ["YTS MX", "YTS.MX", "YTS"],
				website: "https://yts.mx",
			},
			resolution: "3D",
			searchableMovieName: "The Super Mario Bros Movie (2023)",
			year: 2023,
		});
	});

	test("The Super Mario Bros | 2023 | CODY", () => {
		const data = getMovieMetadata("The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY.mkv");

		expect(data).toEqual({
			fileNameWithoutExtension: "The.Super.Mario.Bros.Movie.2023.1080p.WEBRip.H265-CODY",
			name: "The Super Mario Bros Movie",
			releaseGroup: {
				fileAttributes: ["CODY"],
				isSupported: true,
				name: "CODY",
				searchableOpenSubtitlesName: ["CODY"],
				searchableSubDivXName: ["H265-CODY"],
				website: "",
			},
			resolution: "1080p",
			searchableMovieName: "The Super Mario Bros Movie (2023)",
			year: 2023,
		});
	});

	test("Evil Dead Rise | 2023 | GalaxyRG", () => {
		const data = getMovieMetadata("Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv");

		const releaseGroup: ReleaseGroup = {
			fileAttributes: ["GalaxyRG"],
			isSupported: true,
			name: "GalaxyRG",
			searchableOpenSubtitlesName: ["GalaxyRG"],
			searchableSubDivXName: ["GalaxyRG"],
			website: "",
		};
		expect(data).toEqual({
			fileNameWithoutExtension: "Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG",
			name: "Evil Dead Rise",
			releaseGroup,
			resolution: "1080p",
			searchableMovieName: "Evil Dead Rise (2023)",
			year: 2023,
		});
	});

	test("The Flash | 2023 | RiGHTNOW", () => {
		const data = getMovieMetadata("The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW.mkv");

		const releaseGroup: ReleaseGroup = {
			fileAttributes: ["RiGHTNOW"],
			isSupported: true,
			name: "RiGHTNOW",
			searchableOpenSubtitlesName: ["RiGHTNOW"],
			searchableSubDivXName: ["RIGHTNOW"],
			website: "",
		};
		expect(data).toEqual({
			fileNameWithoutExtension: "The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW",
			name: "The Flash",
			releaseGroup,
			resolution: "1080p",
			searchableMovieName: "The Flash (2023)",
			year: 2023,
		});
	});

	test("should correctly parse a movie string with year and resolution", () => {
		const result = getMovieMetadata("Avatar (2009) 1080p x264 YTS.MX.mp4");

		expect(result).toEqual({
			fileNameWithoutExtension: "Avatar.(2009).1080p.x264.YTS.MX",
			name: "Avatar",
			releaseGroup: {
				fileAttributes: ["YTS.MX"],
				isSupported: true,
				name: "YTS-MX",
				searchableOpenSubtitlesName: ["YTS.MX"],
				searchableSubDivXName: ["YTS MX", "YTS.MX", "YTS"],
				website: "https://yts.mx",
			},
			resolution: "1080p",
			searchableMovieName: "Avatar (2009)",
			year: 2009,
		});
	});

	test("should recognize release groups not supported in the DB", () => {
		const result = getMovieMetadata("Avatar (2009) 1080p x264 UNKNOWN.mp4");
		expect(result).toMatchObject({
			name: "Avatar",
			releaseGroup: undefined,
			resolution: "1080p",
			year: 2009,
		});
	});
});
