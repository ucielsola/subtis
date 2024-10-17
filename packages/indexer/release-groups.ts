import invariant from "tiny-invariant";

// db
import type { SupabaseClient } from "@subtis/db";

// constants
export const RELEASE_GROUPS = {
  AOC: {
    file_attributes: ["H264-AOC", "H265-AOC", "x264-AOC", "x265-AOC"],
    is_supported: true,
    release_group_name: "AOC",
    query_matches: ["AOC"],
  },
  AccomplishedYak: {
    file_attributes: ["H264-AccomplishedYak", "H265-AccomplishedYak", "x264-AccomplishedYak", "x265-AccomplishedYak"],
    is_supported: true,
    release_group_name: "AccomplishedYak",
    query_matches: ["AccomplishedYak"],
  },
  CODY: {
    file_attributes: ["CODY"],
    is_supported: true,
    release_group_name: "CODY",
    query_matches: ["CODY", "H265-CODY"],
  },
  EDITH: {
    file_attributes: ["h264-EDITH"],
    is_supported: true,
    release_group_name: "EDITH",
    query_matches: ["EDITH"],
  },
  ETHEL: {
    file_attributes: ["h264-ETHEL", "h265-ETHEL"],
    is_supported: true,
    release_group_name: "ETHEL",
    query_matches: ["ETHEL", "H264-ETHEL", "H265-ETHEL"],
  },
  REVILS: {
    file_attributes: ["h264-REVILS"],
    is_supported: true,
    release_group_name: "REVILS",
    query_matches: ["REVILS"],
  },
  SHITBOX: {
    file_attributes: ["x264-SHITBOX", "x265-SHITBOX", "0-SHITBOX", "1-SHITBOX"],
    is_supported: true,
    release_group_name: "SHITBOX",
    query_matches: ["SHITBOX"],
  },
  PiGNUS: {
    file_attributes: ["x264-pignus"],
    is_supported: true,
    release_group_name: "PiGNUS",
    query_matches: ["PiGNUS"],
  },
  EniaHD: {
    file_attributes: ["264-EniaHD", "265-EniaHD", "x264-EniaHD", "x265-EniaHD"],
    is_supported: true,
    release_group_name: "EniaHD",
    query_matches: ["EniaHD"],
  },
  APEX: {
    file_attributes: ["264-APEX", "265-APEX"],
    is_supported: true,
    release_group_name: "APEX",
    query_matches: ["APEX", "265-APEX", "264-APEX"],
  },
  FLUX: {
    file_attributes: ["FLUX", "265-Flux", "264-Flux"],
    is_supported: true,
    release_group_name: "FLUX",
    query_matches: ["FLUX", "265-FLUX", "264-FLUX"],
  },
  FLUX8: {
    file_attributes: ["FLUX8"],
    is_supported: true,
    release_group_name: "FLUX8",
    query_matches: ["FLUX8"],
  },
  GalaxyRG: {
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
  },
  "HDRip-C1NEM4": {
    file_attributes: ["HDRip-C1NEM4"],
    is_supported: true,
    release_group_name: "HDRip-C1NEM4",
    query_matches: ["HDRip-C1NEM4"],
  },
  "HEVC-CMRG": {
    file_attributes: ["HEVC-CMRG", "x264-CMRG", "x265-CMRG"],
    is_supported: true,
    release_group_name: "HEVC-CMRG",
    query_matches: ["HEVC-CMRG", "CMRG"],
  },
  "HEVC-CM": {
    file_attributes: ["HEVC-CM", "x264-CM", "x265-CM"],
    is_supported: true,
    release_group_name: "HEVC-CM",
    query_matches: ["HEVC-CM"],
  },
  "HEVC-PSA": {
    file_attributes: ["HEVC-PSA"],
    is_supported: true,
    release_group_name: "HEVC-PSA",
    query_matches: ["HEVC-PSA"],
  },
  "HEVC-EVO": {
    file_attributes: ["HEVC-EVO"],
    is_supported: true,
    release_group_name: "HEVC-EVO",
    query_matches: ["HEVC-EVO"],
  },
  ACEM: {
    file_attributes: ["264-ACEM", "265-ACEM"],
    is_supported: true,
    release_group_name: "ACEM",
    query_matches: ["ACEM"],
  },
  REMUX: {
    file_attributes: ["REMUX"],
    is_supported: true,
    release_group_name: "REMUX",
    query_matches: ["REMUX"],
  },
  EVO: {
    file_attributes: ["x264-EVO", "x265-EVO", "264-EVO[TGx]", "265-EVO[TGx]"],
    is_supported: true,
    release_group_name: "EVO",
    query_matches: ["EVO", "264-EVO", "265-EVO", "x264-EVO", "x265-EVO"],
  },
  "Atmos-SWTYBLZ": {
    file_attributes: ["Atmos-SWTYBLZ"],
    is_supported: true,
    release_group_name: "Atmos-SWTYBLZ",
    query_matches: ["Atmos-SWTYBLZ"],
  },
  "Atmos-MRCS": {
    file_attributes: ["x264-MRCS"],
    is_supported: true,
    release_group_name: "Atmos-MRCS",
    query_matches: ["MRCS"],
  },
  KBOX: {
    file_attributes: ["h264-kbox", "h265-kbox"],
    is_supported: true,
    release_group_name: "KBOX",
    query_matches: ["KBOX"],
  },
  BYNDR: {
    file_attributes: ["264-BYNDR"],
    is_supported: true,
    release_group_name: "BYNDR",
    query_matches: ["H264-BYNDR", "BYNDR"],
  },
  RABiDS: {
    file_attributes: ["H264-RABiDS"],
    is_supported: true,
    release_group_name: "RABiDS",
    query_matches: ["RABiDS"],
  },
  SLOT: {
    file_attributes: ["h264-slot", "h265-slot"],
    is_supported: true,
    release_group_name: "SLOT",
    query_matches: ["SLOT"],
  },
  KNiVES: {
    file_attributes: ["KNiVES"],
    is_supported: true,
    release_group_name: "KNiVES",
    query_matches: ["KNiVES"],
  },
  LAMA: {
    file_attributes: ["x264-LAMA", "AAC-LAMA"],
    is_supported: true,
    release_group_name: "LAMA",
    query_matches: ["LAMA"],
  },
  LiLKiM: {
    file_attributes: ["h265-lilkim", "h264-lilkim"],
    is_supported: true,
    release_group_name: "LiLKiM",
    query_matches: ["LiLKiM"],
  },
  RiGHTNOW: {
    file_attributes: ["RiGHTNOW"],
    is_supported: true,
    release_group_name: "RiGHTNOW",
    query_matches: ["RiGHTNOW"],
  },
  YTS: {
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
  RMTeam: {
    file_attributes: ["x265.rmteam", "x265-rmteam"],
    is_supported: true,
    release_group_name: "RMTeam",
    query_matches: ["x265-rmteam", "rmteam"],
  },
  BobDobbs: {
    file_attributes: ["H264-BobDobbs"],
    is_supported: true,
    release_group_name: "BobDobbs",
    query_matches: ["H264-BobDobbs", "BobDobbs"],
  },
  SPARKS: {
    file_attributes: ["x264-sparks"],
    is_supported: true,
    release_group_name: "SPARKS",
    query_matches: ["x264-SPARKS", "SPARKS"],
  },
  MADSKY: {
    file_attributes: ["264-MADSKY", "265-MADSKY"],
    is_supported: true,
    release_group_name: "MADSKY",
    query_matches: ["x264-MADSKY", "x265-MADSKY", "MADSKY"],
  },
  HUZZAH: {
    file_attributes: ["h264-huzzah", "h265-huzzah"],
    is_supported: true,
    release_group_name: "HUZZAH",
    query_matches: ["HUZZAH"],
  },
  ETRG: {
    file_attributes: ["x264-ETRG", "x265-ETRG"],
    is_supported: true,
    release_group_name: "ETRG",
    query_matches: ["ETRG", "AAC-ETRG"],
  },
  NTB: {
    file_attributes: ["264-NTb", "265-NTb"],
    is_supported: true,
    release_group_name: "NTB",
    query_matches: ["NTb", "264-NTb"],
  },
  SuccessfulCrab: {
    file_attributes: ["H264-SuccessfulCrab", "H265-SuccessfulCrab"],
    is_supported: true,
    release_group_name: "SuccessfulCrab",
    query_matches: ["H264-SuccessfulCrab", "H265-SuccessfulCrab", "SuccessfulCrab", "(SuccessfulCrab)"],
  },
  TorrentGalaxy: {
    file_attributes: ["x264-TORRENTGALAXY"],
    is_supported: true,
    release_group_name: "TorrentGalaxy",
    query_matches: ["x264-TORRENTGALAXY"],
  },
  MeGusta: {
    file_attributes: ["x265-MeGusta"],
    is_supported: true,
    release_group_name: "MeGusta",
    query_matches: ["x265-MeGusta", "MeGusta"],
  },
  MinX: {
    file_attributes: ["x264-MinX", "x265-MinX"],
    is_supported: true,
    release_group_name: "MinX",
    query_matches: ["x264-MinX", "x265-MinX"],
  },
  TheCuteness: {
    file_attributes: ["h264-thecuteness", "h265-thecuteness"],
    is_supported: true,
    release_group_name: "TheCuteness",
    query_matches: ["TheCuteness"],
  },
  HHWEB: {
    file_attributes: ["264-hhweb", "265-hhweb", "aac-hhweb"],
    is_supported: true,
    release_group_name: "HHWEB",
    query_matches: ["HHWEB", "265-HHWEB"],
  },
  BenTheMen: {
    file_attributes: ["264-BEN.THE.MEN", "MP4-BEN.THE.MEN", "BEN.THE.MEN,", "265-BEN.THE.MEN", "MKV-BEN.THE.MEN"],
    is_supported: true,
    release_group_name: "BEN THE MEN",
    query_matches: ["BEN THE MEN", "BEN.THE.MEN,"],
  },
  GODZiLLA: {
    file_attributes: ["264-GODZiLLA"],
    is_supported: true,
    release_group_name: "GODZiLLA",
    query_matches: ["WEB-DL GODZiLLA"],
  },
  POKE: {
    file_attributes: ["H265-POKE", "H264-POKE"],
    is_supported: true,
    release_group_name: "POKE",
    query_matches: ["H265-POKE", "H264-POKE", "POKE"],
  },
  NellTigerFree: {
    file_attributes: ["h265-nelltigerfree"],
    is_supported: true,
    release_group_name: "NellTigerFree",
    query_matches: ["H265-NellTigerFree"],
  },
  Xebec: {
    file_attributes: ["XEBEC", "264-XEBEC", "265-XEBEC"],
    is_supported: true,
    release_group_name: "Xebec",
    query_matches: ["XEBEC"],
  },
  Byndr: {
    file_attributes: ["Byndr", "h264-byndr", "h265-byndr"],
    is_supported: true,
    release_group_name: "Byndr",
    query_matches: ["265-BYNDR", "264-BYNDR", "BYNDR"],
  },
  DualYG: {
    file_attributes: ["Dual.YG"],
    is_supported: true,
    release_group_name: "Dual YG",
    query_matches: ["Dual YG", "Dual.YG"],
  },
  playWEB: {
    file_attributes: ["playWEB", "264-playWEB”,”265-playWEB"],
    is_supported: true,
    release_group_name: "playWEB",
    query_matches: ["DSNP playWEB”, ”playWEB"],
  },
  LightSaber: {
    file_attributes: ["lightsaber", "h264-lightsaber”, ”h265-lightsaber"],
    is_supported: true,
    release_group_name: "LightSaber",
    query_matches: ["LightSaber", "HETEL-LightSaber", "H264-lightsaber", "H265-lightsaber"],
  },
  ORGANiC: {
    file_attributes: ["ORGANiC", "H264-ORGANiC", "H265-ORGANiC"],
    is_supported: true,
    release_group_name: "ORGANiC",
    query_matches: ["ORGANIC"],
  },
  ELiTE: {
    file_attributes: ["h264-ELiTE", "h265-ELiTE", "x264-ELiTE", "x265-ELiTE", "ELiTE"],
    is_supported: true,
    release_group_name: "ELiTE",
    query_matches: ["h264-ELiTE", "h265-ELiTE", "x264-ELiTE", "x265-ELiTE", "ELiTE"],
  },
  NHTFS: {
    file_attributes: ["h264-nhtfs", "h265-nhtfs", "nhtfs"],
    is_supported: true,
    release_group_name: "NHTFS",
    query_matches: ["h264-NHTFS", "h265-NHTFS", "NHTFS"],
  },
  ROEN: {
    file_attributes: ["x264-ROEN", "x265-ROEN"],
    is_supported: true,
    release_group_name: "roen",
    query_matches: ["ROEN", "x264-ROEN", "x265-ROEN"],
  },
  Asiimov: {
    file_attributes: ["Asiimov", "x265-Asiimov", "x264-Asiimov"],
    is_supported: true,
    release_group_name: "Asiimov",
    query_matches: ["Asiimov", "x265-Asiimov"],
  },
  Dolores: {
    file_attributes: ["h264-DOLORES", "h265-DOLORES", "DOLORES"],
    is_supported: true,
    release_group_name: "DOLORES",
    query_matches: ["DOLORES"],
  },
  Will1869: {
    file_attributes: ["Will1869"],
    is_supported: true,
    release_group_name: "Will1869",
    query_matches: ["Will1869"],
  },
  itspee: {
    file_attributes: ["itspee", "h265-itspee", "h264-itspee"],
    is_supported: true,
    release_group_name: "itspee",
    query_matches: ["itspee", "h265-itspee", "h264-itspee"],
  },
  ZoroSenpai: {
    file_attributes: ["x264-ZoroSenpai", "x265-ZoroSenpai", "ZoroSenpai"],
    is_supported: true,
    release_group_name: "ZoroSenpai",
    query_matches: ["x264-ZoroSenpai", "x265-ZoroSenpai", "ZoroSenpai"],
  },
  thismoviewillblowyouaway: {
    file_attributes: ["thismoviewillblowyouaway", "h264-thismoviewillblowyouaway", "h265-thismoviewillblowyouaway"],
    is_supported: true,
    release_group_name: "thismoviewillblowyouaway",
    query_matches: ["thismoviewillblowyouaway", "h264-thismoviewillblowyouaway", "h265-thismoviewillblowyouaway"],
  },
  privateberyloysterofdemocracy: {
    file_attributes: [
      "privateberyloysterofdemocracy",
      "h264-privateberyloysterofdemocracy",
      "h265-privateberyloysterofdemocracy",
    ],
    is_supported: true,
    release_group_name: "privateberyloysterofdemocracy",
    query_matches: [
      "privateberyloysterofdemocracy",
      "h264-privateberyloysterofdemocracy",
      "h265-privateberyloysterofdemocracy",
    ],
  },
  iseedeadpeople: {
    file_attributes: ["iseedeadpeople", "h264-iseedeadpeople", "h265-iseedeadpeople"],
    is_supported: true,
    release_group_name: "iseedeadpeople",
    query_matches: ["iseedeadpeople", "h264-iseedeadpeople", "h265-iseedeadpeople"],
  },
  RARBG: {
    file_attributes: ["x264-RARBG", "x265-RARBG", "AAC-RARBG"],
    is_supported: true,
    release_group_name: "RARBG",
    query_matches: ["RARBG", "AAC-RARBG"],
  },
  HEVC: {
    file_attributes: ["HEVC", "x264-HEVC", "x265-HEVC"],
    is_supported: true,
    release_group_name: "HEVC",
    query_matches: ["HEVC"],
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
  for (const releaseGroupKey in RELEASE_GROUPS) {
    const releaseGroup = RELEASE_GROUPS[releaseGroupKey as ReleaseGroupKeys];

    const { release_group_name, file_attributes, is_supported, query_matches } = releaseGroup;

    // Check if the release group already exists in the database
    const { data: existingGroups } = await supabaseClient
      .from("ReleaseGroups")
      .select("id")
      .eq("release_group_name", release_group_name)
      .single();

    if (existingGroups) {
      await supabaseClient
        .from("ReleaseGroups")
        .update({
          is_supported,
          query_matches: query_matches as unknown as string[],
          file_attributes: file_attributes as unknown as string[],
        })
        .eq("id", existingGroups.id);
    } else {
      await supabaseClient.from("ReleaseGroups").insert({
        is_supported,
        query_matches: query_matches as unknown as string[],
        file_attributes: file_attributes as unknown as string[],
        release_group_name: release_group_name as unknown as string,
      });
    }
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
