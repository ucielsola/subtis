import invariant from "tiny-invariant";

// db
import type { SupabaseClient } from "@subtis/db";

// constants
export const RELEASE_GROUPS = {
	AOC: {
		fileAttributes: ["H264-AOC", "H265-AOC", "x264-AOC", "x265-AOC"],
		isSupported: true,
		name: "AOC",
		searchableOpenSubtitlesName: ["AOC"],
		searchableSubDivXName: ["AOC"],
	},
	AccomplishedYak: {
		fileAttributes: ["H264-AccomplishedYak", "H265-AccomplishedYak", "x264-AccomplishedYak", "x265-AccomplishedYak"],
		isSupported: true,
		name: "AccomplishedYak",
		searchableOpenSubtitlesName: ["AccomplishedYak"],
		searchableSubDivXName: ["AccomplishedYak"],
	},
	CODY: {
		fileAttributes: ["CODY"],
		isSupported: true,
		name: "CODY",
		searchableOpenSubtitlesName: ["CODY"],
		searchableSubDivXName: ["H265-CODY"],
	},
	EDITH: {
		fileAttributes: ["h264-EDITH"],
		isSupported: true,
		name: "EDITH",
		searchableOpenSubtitlesName: ["EDITH"],
		searchableSubDivXName: ["edith"],
	},
	ETHEL: {
		fileAttributes: ["h264-ETHEL","h265-ETHEL"],
		isSupported: true,
		name: "ETHEL",
		searchableOpenSubtitlesName: ["ETHEL"],
		searchableSubDivXName: ["ETHEL","H264-ETHEL", "H265-ETHEL"],
	},
	REVILS: {
		fileAttributes: ["h264-REVILS"],
		isSupported: true,
		name: "REVILS",
		searchableOpenSubtitlesName: ["REVILS"],
		searchableSubDivXName: ["REVILS"],
	},
	SHITBOX: {
		fileAttributes: ["x264-SHITBOX", "0-SHITBOX", "1-SHITBOX"],
		isSupported: true,
		name: "SHITBOX",
		searchableOpenSubtitlesName: ["SHITBOX"],
		searchableSubDivXName: ["SHITBOX"],
	},
	PiGNUS: {
		fileAttributes: ["x264-pignus"],
		isSupported: true,
		name: "PiGNUS",
		searchableOpenSubtitlesName: ["PiGNUS"],
		searchableSubDivXName: ["PiGNUS"],
	},
	EniaHD: {
		fileAttributes: ["264-EniaHD", "265-EniaHD", "x264-EniaHD", "x265-EniaHD"],
		isSupported: true,
		name: "EniaHD",
		searchableOpenSubtitlesName: ["EniaHD"],
		searchableSubDivXName: ["EniaHD"],
	},
	APEX: {
		fileAttributes: ["264-APEX", "265-APEX"],
		isSupported: true,
		name: "APEX",
		searchableOpenSubtitlesName: ["APEX"],
		searchableSubDivXName: ["APEX", "265-APEX", "264-APEX"],
	},
	FLUX: {
		fileAttributes: ["FLUX", "265-Flux", "264-Flux"],
		isSupported: true,
		name: "FLUX",
		searchableOpenSubtitlesName: ["FLUX"],
		searchableSubDivXName: ["FLUX", "265-FLUX", "264-FLUX"],
	},
	FLUX8: {
		fileAttributes: ["FLUX8"],
		isSupported: true,
		name: "FLUX8",
		searchableOpenSubtitlesName: ["FLUX8"],
		searchableSubDivXName: ["FLUX8"],
	},
	GalaxyRG: {
		fileAttributes: ["GalaxyRG"],
		isSupported: true,
		name: "GalaxyRG",
		searchableOpenSubtitlesName: ["GalaxyRG"],
		searchableSubDivXName: ["GalaxyRG"],
	},
	"HDRip-C1NEM4": {
		fileAttributes: ["HDRip-C1NEM4"],
		isSupported: true,
		name: "HDRip-C1NEM4",
		searchableOpenSubtitlesName: ["HDRip-C1NEM4"],
		searchableSubDivXName: ["HDRip-C1NEM4"],
	},
	"HEVC-CMRG": {
		fileAttributes: ["HEVC-CMRG"],
		isSupported: true,
		name: "HEVC-CMRG",
		searchableOpenSubtitlesName: ["HEVC-CMRG"],
		searchableSubDivXName: ["cmrg"],
	},
	"HEVC-PSA": {
		fileAttributes: ["HEVC-PSA"],
		isSupported: true,
		name: "HEVC-PSA",
		searchableOpenSubtitlesName: ["HEVC-PSA"],
		searchableSubDivXName: ["hevc-psa"],
	},
	"HEVC-EVO": {
		fileAttributes: ["HEVC-EVO"],
		isSupported: true,
		name: "HEVC-EVO",
		searchableOpenSubtitlesName: ["HEVC-EVO"],
		searchableSubDivXName: ["HEVC-EVO"],
	},
	ACEM: {
		fileAttributes: ["264-ACEM", "265-ACEM"],
		isSupported: true,
		name: "ACEM",
		searchableOpenSubtitlesName: ["ACEM"],
		searchableSubDivXName: ["ACEM"],
	},
	REMUX: {
		fileAttributes: ["REMUX"],
		isSupported: true,
		name: "REMUX",
		searchableOpenSubtitlesName: ["REMUX"],
		searchableSubDivXName: ["REMUX"],
	},
	EVO: {
		fileAttributes: ["x264-EVO", "x265-EVO"],
		isSupported: true,
		name: "EVO",
		searchableOpenSubtitlesName: ["EVO"],
		searchableSubDivXName: ["EVO"],
	},
	'Atmos-SWTYBLZ': {
		fileAttributes: ["Atmos-SWTYBLZ"],
		isSupported: true,
		name: "Atmos-SWTYBLZ",
		searchableOpenSubtitlesName: ["Atmos-SWTYBLZ"],
		searchableSubDivXName: ["Atmos-SWTYBLZ"],
	},
	'Atmos-MRCS': {
		fileAttributes: ["x264-MRCS"],
		isSupported: true,
		name: "Atmos-MRCS",
		searchableOpenSubtitlesName: ["MRCS"],
		searchableSubDivXName: ["MRCS"],
	},
	KBOX: {
		fileAttributes: ["h264-kbox", "h265-kbox"],
		isSupported: true,
		name: "KBOX",
		searchableOpenSubtitlesName: ["KBOX"],
		searchableSubDivXName: ["KBOX"],
	},
	BYNDR: {
		fileAttributes: ["264-BYNDR"],
		isSupported: true,
		name: "BYNDR",
		searchableOpenSubtitlesName: ["H264-BYNDR"],
		searchableSubDivXName: ["H264-BYNDR"],
	},
	RABiDS: {
		fileAttributes: ["H264-RABiDS"],
		isSupported: true,
		name: "RABiDS",
		searchableOpenSubtitlesName: ["RABiDS"],
		searchableSubDivXName: ["RABiDS"],
	},
	SLOT: {
		fileAttributes: ["h264-slot", "h265-slot"],
		isSupported: true,
		name: "SLOT",
		searchableOpenSubtitlesName: ["SLOT"],
		searchableSubDivXName: ["SLOT"],
	},
	KNiVES: {
		fileAttributes: ["KNiVES"],
		isSupported: true,
		name: "KNiVES",
		searchableOpenSubtitlesName: ["KNiVES"],
		searchableSubDivXName: ["KNiVES"],
	},
	LAMA: {
		fileAttributes: ["x264-LAMA"],
		isSupported: true,
		name: "LAMA",
		searchableOpenSubtitlesName: ["LAMA"],
		searchableSubDivXName: ["LAMA"],
	},
	LiLKiM: {
		fileAttributes: ["h265-lilkim", "h264-lilkim"],
		isSupported: true,
		name: "LiLKiM",
		searchableOpenSubtitlesName: ["LiLKiM"],
		searchableSubDivXName: ["LiLKiM"],
	},
	RiGHTNOW: {
		fileAttributes: ["RiGHTNOW"],
		isSupported: true,
		name: "RiGHTNOW",
		searchableOpenSubtitlesName: ["RiGHTNOW"],
		searchableSubDivXName: ["RIGHTNOW"],
	},
	"YTS-MX": {
		fileAttributes: ["YTS.MX"],
		isSupported: true,
		name: "YTS-MX",
		searchableOpenSubtitlesName: ["YTS.MX"],
		searchableSubDivXName: ["YTS MX", "YTS.MX", "YTS"],
	},
} as const;

// types
export type ReleaseGroup = {
	fileAttributes: string[];
	isSupported: boolean;
	name: string;
	searchableOpenSubtitlesName: string[];
	searchableSubDivXName: string[];
	website: string;
};

export type ReleaseGroupMap = {
	[key in ReleaseGroupNames]: ReleaseGroup & { created_at: string; id: number };
};

export type ReleaseGroupNames = (typeof RELEASE_GROUPS)[keyof typeof RELEASE_GROUPS]["name"];

export type ReleaseGroupKeys = keyof typeof RELEASE_GROUPS;

// utils
export async function saveReleaseGroupsToDb(supabaseClient: SupabaseClient): Promise<void> {
	const { data } = await supabaseClient.from("ReleaseGroups").select("*");

	for (const releaseGroupKey in RELEASE_GROUPS) {
		const releaseGroup = RELEASE_GROUPS[releaseGroupKey as ReleaseGroupKeys];

		const releaseGroupExists = data?.find((releaseGroupInDb) => releaseGroupInDb.name === releaseGroup.name);
		if (releaseGroupExists) {
			continue;
		}

		await supabaseClient.from("ReleaseGroups").insert(releaseGroup);
	}
}

// core
export async function getReleaseGroups(supabaseClient: SupabaseClient): Promise<ReleaseGroupMap> {
	const { data } = await supabaseClient.from("ReleaseGroups").select("*");
	invariant(data, "ReleaseGroups not found in database");

	const releaseGroups = data.reduce((acc, releaseGroup) => ({ ...acc, [releaseGroup.name]: releaseGroup }), {});

	return releaseGroups as ReleaseGroupMap;
}
