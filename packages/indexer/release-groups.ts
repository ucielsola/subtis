import invariant from "tiny-invariant";

// db
import type { SupabaseClient } from "@subtis/db";

// constants
export const RELEASE_GROUPS = {
  AOC: {
    file_attributes: ["H264-AOC", "H265-AOC", "x264-AOC", "x265-AOC"],
    is_supported: true,
    release_group_name: "AOC",
    searchable_opensubtitles_name: ["AOC"],
    searchable_subdivx_name: ["AOC"],
  },
  AccomplishedYak: {
    file_attributes: ["H264-AccomplishedYak", "H265-AccomplishedYak", "x264-AccomplishedYak", "x265-AccomplishedYak"],
    is_supported: true,
    release_group_name: "AccomplishedYak",
    searchable_opensubtitles_name: ["AccomplishedYak"],
    searchable_subdivx_name: ["AccomplishedYak"],
  },
  CODY: {
    file_attributes: ["CODY"],
    is_supported: true,
    release_group_name: "CODY",
    searchable_opensubtitles_name: ["CODY"],
    searchable_subdivx_name: ["H265-CODY"],
  },
  EDITH: {
    file_attributes: ["h264-EDITH"],
    is_supported: true,
    release_group_name: "EDITH",
    searchable_opensubtitles_name: ["EDITH"],
    searchable_subdivx_name: ["edith"],
  },
  ETHEL: {
    file_attributes: ["h264-ETHEL", "h265-ETHEL"],
    is_supported: true,
    release_group_name: "ETHEL",
    searchable_opensubtitles_name: ["ETHEL"],
    searchable_subdivx_name: ["ETHEL", "H264-ETHEL", "H265-ETHEL"],
  },
  REVILS: {
    file_attributes: ["h264-REVILS"],
    is_supported: true,
    release_group_name: "REVILS",
    searchable_opensubtitles_name: ["REVILS"],
    searchable_subdivx_name: ["REVILS"],
  },
  SHITBOX: {
    file_attributes: ["x264-SHITBOX", "0-SHITBOX", "1-SHITBOX"],
    is_supported: true,
    release_group_name: "SHITBOX",
    searchable_opensubtitles_name: ["SHITBOX"],
    searchable_subdivx_name: ["SHITBOX"],
  },
  PiGNUS: {
    file_attributes: ["x264-pignus"],
    is_supported: true,
    release_group_name: "PiGNUS",
    searchable_opensubtitles_name: ["PiGNUS"],
    searchable_subdivx_name: ["PiGNUS"],
  },
  EniaHD: {
    file_attributes: ["264-EniaHD", "265-EniaHD", "x264-EniaHD", "x265-EniaHD"],
    is_supported: true,
    release_group_name: "EniaHD",
    searchable_opensubtitles_name: ["EniaHD"],
    searchable_subdivx_name: ["EniaHD"],
  },
  APEX: {
    file_attributes: ["264-APEX", "265-APEX"],
    is_supported: true,
    release_group_name: "APEX",
    searchable_opensubtitles_name: ["APEX"],
    searchable_subdivx_name: ["APEX", "265-APEX", "264-APEX"],
  },
  FLUX: {
    file_attributes: ["FLUX", "265-Flux", "264-Flux"],
    is_supported: true,
    release_group_name: "FLUX",
    searchable_opensubtitles_name: ["FLUX"],
    searchable_subdivx_name: ["FLUX", "265-FLUX", "264-FLUX"],
  },
  FLUX8: {
    file_attributes: ["FLUX8"],
    is_supported: true,
    release_group_name: "FLUX8",
    searchable_opensubtitles_name: ["FLUX8"],
    searchable_subdivx_name: ["FLUX8"],
  },
  GalaxyRG: {
    file_attributes: ["GalaxyRG", "x264-Galax", "x265-Galax", "x264-GalaxyRG", "x265-GalaxyRG"],
    is_supported: true,
    release_group_name: "GalaxyRG",
    searchable_opensubtitles_name: ["GalaxyRG"],
    searchable_subdivx_name: ["GalaxyRG"],
  },
  "HDRip-C1NEM4": {
    file_attributes: ["HDRip-C1NEM4"],
    is_supported: true,
    release_group_name: "HDRip-C1NEM4",
    searchable_opensubtitles_name: ["HDRip-C1NEM4"],
    searchable_subdivx_name: ["HDRip-C1NEM4"],
  },
  "HEVC-CMRG": {
    file_attributes: ["HEVC-CMRG", "x264-CMRG", "x265-CMRG"],
    is_supported: true,
    release_group_name: "HEVC-CMRG",
    searchable_opensubtitles_name: ["HEVC-CMRG"],
    searchable_subdivx_name: ["cmrg"],
  },
  "HEVC-PSA": {
    file_attributes: ["HEVC-PSA"],
    is_supported: true,
    release_group_name: "HEVC-PSA",
    searchable_opensubtitles_name: ["HEVC-PSA"],
    searchable_subdivx_name: ["hevc-psa"],
  },
  "HEVC-EVO": {
    file_attributes: ["HEVC-EVO"],
    is_supported: true,
    release_group_name: "HEVC-EVO",
    searchable_opensubtitles_name: ["HEVC-EVO"],
    searchable_subdivx_name: ["HEVC-EVO"],
  },
  ACEM: {
    file_attributes: ["264-ACEM", "265-ACEM"],
    is_supported: true,
    release_group_name: "ACEM",
    searchable_opensubtitles_name: ["ACEM"],
    searchable_subdivx_name: ["ACEM"],
  },
  REMUX: {
    file_attributes: ["REMUX"],
    is_supported: true,
    release_group_name: "REMUX",
    searchable_opensubtitles_name: ["REMUX"],
    searchable_subdivx_name: ["REMUX"],
  },
  EVO: {
    file_attributes: ["x264-EVO", "x265-EVO"],
    is_supported: true,
    release_group_name: "EVO",
    searchable_opensubtitles_name: ["EVO"],
    searchable_subdivx_name: ["EVO"],
  },
  "Atmos-SWTYBLZ": {
    file_attributes: ["Atmos-SWTYBLZ"],
    is_supported: true,
    release_group_name: "Atmos-SWTYBLZ",
    searchable_opensubtitles_name: ["Atmos-SWTYBLZ"],
    searchable_subdivx_name: ["Atmos-SWTYBLZ"],
  },
  "Atmos-MRCS": {
    file_attributes: ["x264-MRCS"],
    is_supported: true,
    release_group_name: "Atmos-MRCS",
    searchable_opensubtitles_name: ["MRCS"],
    searchable_subdivx_name: ["MRCS"],
  },
  KBOX: {
    file_attributes: ["h264-kbox", "h265-kbox"],
    is_supported: true,
    release_group_name: "KBOX",
    searchable_opensubtitles_name: ["KBOX"],
    searchable_subdivx_name: ["KBOX"],
  },
  BYNDR: {
    file_attributes: ["264-BYNDR"],
    is_supported: true,
    release_group_name: "BYNDR",
    searchable_opensubtitles_name: ["H264-BYNDR", "BYNDR"],
    searchable_subdivx_name: ["H264-BYNDR", "BYNDR"],
  },
  RABiDS: {
    file_attributes: ["H264-RABiDS"],
    is_supported: true,
    release_group_name: "RABiDS",
    searchable_opensubtitles_name: ["RABiDS"],
    searchable_subdivx_name: ["RABiDS"],
  },
  SLOT: {
    file_attributes: ["h264-slot", "h265-slot"],
    is_supported: true,
    release_group_name: "SLOT",
    searchable_opensubtitles_name: ["SLOT"],
    searchable_subdivx_name: ["SLOT"],
  },
  KNiVES: {
    file_attributes: ["KNiVES"],
    is_supported: true,
    release_group_name: "KNiVES",
    searchable_opensubtitles_name: ["KNiVES"],
    searchable_subdivx_name: ["KNiVES"],
  },
  LAMA: {
    file_attributes: ["x264-LAMA"],
    is_supported: true,
    release_group_name: "LAMA",
    searchable_opensubtitles_name: ["LAMA"],
    searchable_subdivx_name: ["LAMA"],
  },
  LiLKiM: {
    file_attributes: ["h265-lilkim", "h264-lilkim"],
    is_supported: true,
    release_group_name: "LiLKiM",
    searchable_opensubtitles_name: ["LiLKiM"],
    searchable_subdivx_name: ["LiLKiM"],
  },
  RiGHTNOW: {
    file_attributes: ["RiGHTNOW"],
    is_supported: true,
    release_group_name: "RiGHTNOW",
    searchable_opensubtitles_name: ["RiGHTNOW"],
    searchable_subdivx_name: ["RIGHTNOW"],
  },
  YTS: {
    file_attributes: ["YTS.MX", "YTS.LT", "YIFY", "YTS.AM"],
    is_supported: true,
    release_group_name: "YTS",
    searchable_opensubtitles_name: [
      "YTS MX",
      "YTS.MX",
      "YTS",
      "YTS.LT",
      "x264-[YTS.LT]",
      "YTS.AM",
      "x264-[YTS.AM]",
      "YIFY",
    ],
    searchable_subdivx_name: ["YTS MX", "YTS.MX", "YTS", "YTS.LT", "x264-[YTS.LT]", "YTS.AM", "x264-[YTS.AM]", "YIFY"],
  },
  RMTeam: {
    file_attributes: ["x265.rmteam", "x265-rmteam"],
    is_supported: true,
    release_group_name: "RMTeam",
    searchable_opensubtitles_name: ["x265-rmteam", "rmteam"],
    searchable_subdivx_name: ["x265-rmteam", "rmteam"],
  },
  BobDobbs: {
    file_attributes: ["H264-BobDobbs"],
    is_supported: true,
    release_group_name: "BobDobbs",
    searchable_opensubtitles_name: ["H264-BobDobbs", "BobDobbs"],
    searchable_subdivx_name: ["H264-BobDobbs", "BobDobbs"],
  },
  SPARKS: {
    file_attributes: ["x264-sparks"],
    is_supported: true,
    release_group_name: "SPARKS",
    searchable_opensubtitles_name: ["x264-SPARKS", "SPARKS"],
    searchable_subdivx_name: ["x264-SPARKS", "SPARKS"],
  },
  MADSKY: {
    file_attributes: ["264-MADSKY", "265-MADSKY"],
    is_supported: true,
    release_group_name: "MADSKY",
    searchable_opensubtitles_name: ["x264-MADSKY", "x265-MADSKY", "MADSKY"],
    searchable_subdivx_name: ["x264-MADSKY", "x265-MADSKY", "MADSKY"],
  },
  HUZZAH: {
    file_attributes: ["h264-huzzah", "h265-huzzah"],
    is_supported: true,
    release_group_name: "HUZZAH",
    searchable_opensubtitles_name: ["HUZZAH"],
    searchable_subdivx_name: ["HUZZAH"],
  },
  ETRG: {
    file_attributes: ["x264-ETRG", "x265-ETRG"],
    is_supported: true,
    release_group_name: "ETRG",
    searchable_opensubtitles_name: ["ETRG", "AAC-ETRG"],
    searchable_subdivx_name: ["ETRG", "AAC-ETRG"],
  },
  NTB: {
    file_attributes: ["264-NTb", "265-NTb"],
    is_supported: true,
    release_group_name: "NTB",
    searchable_opensubtitles_name: ["NTb", "264-NTb"],
    searchable_subdivx_name: ["NTb", "264-NTb"],
  },
  SuccessfulCrab: {
    file_attributes: ["H264-SuccessfulCrab", "H265-SuccessfulCrab"],
    is_supported: true,
    release_group_name: "SuccessfulCrab",
    searchable_opensubtitles_name: ["H264-SuccessfulCrab", "H265-SuccessfulCrab", "SuccessfulCrab", "(SuccessfulCrab)"],
    searchable_subdivx_name: ["H264-SuccessfulCrab", "H265-SuccessfulCrab", "SuccessfulCrab", "(SuccessfulCrab)"],
  },
  TorrentGalaxy: {
    file_attributes: ["x264-TORRENTGALAXY"],
    is_supported: true,
    release_group_name: "TorrentGalaxy",
    searchable_opensubtitles_name: ["x264-TORRENTGALAXY"],
    searchable_subdivx_name: ["x264-TORRENTGALAXY"],
  },
  MeGusta: {
    file_attributes: ["x265-MeGusta"],
    is_supported: true,
    release_group_name: "MeGusta",
    searchable_opensubtitles_name: ["x265-MeGusta", "MeGusta"],
    searchable_subdivx_name: ["x265-MeGusta", "MeGusta"],
  },
  MinX: {
    file_attributes: ["x264-MinX", "x265-MinX"],
    is_supported: true,
    release_group_name: "MinX",
    searchable_opensubtitles_name: ["x264-MinX", "x265-MinX"],
    searchable_subdivx_name: ["x264-MinX", "x265-MinX"],
  },
  TheCuteness: {
    file_attributes: ["h264-thecuteness", "h265-thecuteness"],
    is_supported: true,
    release_group_name: "TheCuteness",
    searchable_opensubtitles_name: ["TheCuteness"],
    searchable_subdivx_name: ["TheCuteness"],
  },
  HHWEB: {
    file_attributes: ["264-hhweb", "265-hhweb", "aac-hhweb"],
    is_supported: true,
    release_group_name: "HHWEB",
    searchable_opensubtitles_name: ["HHWEB", "265-HHWEB"],
    searchable_subdivx_name: ["HHWEB", "265-HHWEB"],
  },
  BenTheMen: {
    file_attributes: ["264-BEN.THE.MEN"],
    is_supported: true,
    release_group_name: "BEN THE MEN",
    searchable_opensubtitles_name: ["BEN THE MEN"],
    searchable_subdivx_name: ["BEN THE MEN"],
  },
  GODZiLLA: {
    file_attributes: ["264-GODZiLLA"],
    is_supported: true,
    release_group_name: "GODZiLLA",
    searchable_opensubtitles_name: ["WEB-DL GODZiLLA"],
    searchable_subdivx_name: ["WEB-DL GODZiLLA"],
  },
  POKE: {
    file_attributes: ["H265-POKE", "H264-POKE"],
    is_supported: true,
    release_group_name: "POKE",
    searchable_opensubtitles_name: ["H265-POKE", "H264-POKE", "POKE"],
    searchable_subdivx_name: ["H265-POKE", "H264-POKE", "POKE"],
  },
  NellTigerFree: {
    file_attributes: ["h265-nelltigerfree"],
    is_supported: true,
    release_group_name: "NellTigerFree",
    searchable_opensubtitles_name: ["H265-NellTigerFree"],
    searchable_subdivx_name: ["H265-NellTigerFree"],
  },
} as const;

// types
export type ReleaseGroup = (typeof RELEASE_GROUPS)[keyof typeof RELEASE_GROUPS];

export type ReleaseGroupMap = {
  [key in ReleaseGroupNames]: ReleaseGroup & { created_at: string; id: number };
};

export type ReleaseGroupNames = (typeof RELEASE_GROUPS)[keyof typeof RELEASE_GROUPS]["release_group_name"];

export type ReleaseGroupKeys = keyof typeof RELEASE_GROUPS;

// utils
export async function saveReleaseGroupsToDb(supabaseClient: SupabaseClient): Promise<void> {
  const { data } = await supabaseClient.from("ReleaseGroups").select("*");

  for (const releaseGroupKey in RELEASE_GROUPS) {
    const releaseGroup = RELEASE_GROUPS[releaseGroupKey as ReleaseGroupKeys];

    const releaseGroupExists = data?.find(
      (releaseGroupInDb) => releaseGroupInDb.release_group_name === releaseGroup.release_group_name,
    );
    if (releaseGroupExists) {
      continue;
    }

    // @ts-ignore
    await supabaseClient.from("ReleaseGroups").upsert(releaseGroup);
  }
}

// core
export async function getReleaseGroups(supabaseClient: SupabaseClient): Promise<ReleaseGroupMap> {
  const { data } = await supabaseClient.from("ReleaseGroups").select("*");
  invariant(data, "ReleaseGroups not found in database");

  const releaseGroups = data.reduce(
    (acc, releaseGroup) => ({ ...acc, [releaseGroup.release_group_name]: releaseGroup }),
    {},
  );

  return releaseGroups as ReleaseGroupMap;
}
