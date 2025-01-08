import invariant from "tiny-invariant";

// db
import type { SupabaseClient } from "@subtis/db";

// constants
export const RELEASE_GROUPS = {
  AOC: {
    is_supported: true,
    release_group_name: "AOC",
    matches: ["AOC", "H264-AOC", "H265-AOC", "x264-AOC", "x265-AOC"],
  },
  AccomplishedYak: {
    is_supported: true,
    release_group_name: "AccomplishedYak",
    matches: [
      "AccomplishedYak",
      "H264-AccomplishedYak",
      "H265-AccomplishedYak",
      "x264-AccomplishedYak",
      "x265-AccomplishedYak",
    ],
  },
  VPPV: {
    is_supported: true,
    release_group_name: "VPPV",
    matches: ["VPPV"],
  },
  SBR: {
    is_supported: true,
    release_group_name: "SBR",
    matches: ["SBR", "x264-SBR", "x265-SBR", "264-SBR", "265-SBR"],
  },
  FW: {
    is_supported: true,
    release_group_name: "FW",
    matches: ["FW", "H264-FW", "H265-FW"],
  },
  NDD: {
    is_supported: true,
    release_group_name: "NDD",
    matches: ["NDD", "x264-NDD", "x265-NDD"],
  },
  DTOne: {
    is_supported: true,
    release_group_name: "DTOne",
    matches: ["DTOne", "0-DTOne", "1-DTOne", "0 -DTOne", "1 -DTOne", "1 -DDR", "0 -DDR"],
  },
  XoXo: {
    is_supported: true,
    release_group_name: "XoXo",
    matches: ["XoXo", "x264-XoXo", "x265-XoXo", "H264-XoXo", "H265-XoXo"],
  },
  CiNT: {
    is_supported: true,
    release_group_name: "CiNT",
    matches: ["CiNT", "AC3-CiNT", "XviD-CiNT"],
  },
  "AV1-WhiskeyJack": {
    is_supported: true,
    release_group_name: "AV1-WhiskeyJack",
    matches: ["AV1-WhiskeyJack"],
  },
  "AAC-VXT": {
    is_supported: true,
    release_group_name: "AAC-VXT",
    matches: ["AAC-VXT"],
  },
  "AV1-DiN": {
    is_supported: true,
    release_group_name: "AV1-DiN",
    matches: ["AV1-DiN"],
  },
  "AC3-TuKCo": {
    is_supported: true,
    release_group_name: "AC3-TuKCo",
    matches: ["AC3-TuKCo"],
  },
  DH: {
    is_supported: true,
    release_group_name: "DH",
    matches: ["DH", "265-DH", "264-DH"],
  },
  WAR: {
    is_supported: true,
    release_group_name: "WAR",
    matches: ["WAR", "265-WAR", "264-WAR"],
  },
  Rapta: {
    is_supported: true,
    release_group_name: "Rapta",
    matches: ["Rapta", "x265-Rapta", "x264-Rapta"],
  },
  FHC: {
    is_supported: true,
    release_group_name: "FHC",
    matches: ["FHC", "H264-FHC", "H265-FHC", "x264-FHC", "x265-FHC", "264-FHC", "265-FHC"],
  },
  HUD: {
    is_supported: true,
    release_group_name: "HUD",
    matches: ["HUD", "AC3-HUD"],
  },
  playHD: {
    is_supported: true,
    release_group_name: "playHD",
    matches: ["playHD", "x264-playHD", "x265-playHD", "x264-playHD_EniaHD", "x265-playHD_EniaHD"],
  },
  WORLD: {
    is_supported: true,
    release_group_name: "WORLD",
    matches: ["WORLD", "x264-WORLD", "x265-WORLD", "1-WORLD"],
  },
  IAMABLE: {
    is_supported: true,
    release_group_name: "IAMABLE",
    matches: ["IAMABLE", "x264-IAMABLE", "x265-IAMABLE", "X265-IAMABLE[EtHD]", "X264-IAMABLE[EtHD]"],
  },
  ShAaNiG: {
    is_supported: true,
    release_group_name: "ShAaNiG",
    matches: ["ShAaNiG", "x264.ShAaNiG", "x265.ShAaNiG"],
  },
  NAHOM: {
    is_supported: true,
    release_group_name: "NAHOM",
    matches: ["NAHOM", "x264-NAHOM", "x265-NAHOM"],
  },
  OFT: {
    is_supported: true,
    release_group_name: "OFT",
    matches: ["OFT", "x264-OFT", "x265-OFT"],
  },
  "Atmos-FGT": {
    is_supported: true,
    release_group_name: "Atmos-FGT",
    matches: ["Atmos-FGT", "1-FGT"],
  },
  ESiR: {
    is_supported: true,
    release_group_name: "ESiR",
    matches: ["1-ESiR", "x264-ESiR", "x265-ESiR"],
  },
  USURY: {
    is_supported: true,
    release_group_name: "USURY",
    matches: ["USURY", "x264-USURY", "x265-USURY"],
  },
  beetlejuice: {
    is_supported: true,
    release_group_name: "beetlejuice",
    matches: ["h264-beetlejuice", "h265-beetlejuice"],
  },
  COLLECTiVE: {
    is_supported: true,
    release_group_name: "COLLECTiVE",
    matches: ["COLLECTiVE", "x264-COLLECTiVE", "x265-COLLECTiVE"],
  },
  CODY: {
    is_supported: true,
    release_group_name: "CODY",
    matches: ["CODY", "H265-CODY"],
  },
  CYBER: {
    is_supported: true,
    release_group_name: "CYBER",
    matches: ["CYBER", "x264-CYBER", "x265-CYBER"],
  },
  EDITH: {
    is_supported: true,
    release_group_name: "EDITH",
    matches: ["EDITH", "h264-EDITH"],
  },
  ETHEL: {
    is_supported: true,
    release_group_name: "ETHEL",
    matches: ["ETHEL", "H264-ETHEL", "H265-ETHEL"],
  },
  REVILS: {
    is_supported: true,
    release_group_name: "REVILS",
    matches: ["REVILS", "h264-REVILS"],
  },
  SHITBOX: {
    is_supported: true,
    release_group_name: "SHITBOX",
    matches: ["SHITBOX", "x264-SHITBOX", "x265-SHITBOX", "0-SHITBOX", "1-SHITBOX"],
  },
  PiGNUS: {
    is_supported: true,
    release_group_name: "PiGNUS",
    matches: ["PiGNUS", "x264-pignus"],
  },
  ExKinoRay: {
    is_supported: true,
    release_group_name: "ExKinoRay",
    matches: ["ExKinoRay", "ExKinoRay", "x264-ExKinoRay", "x265-ExKinoRay"],
  },
  EniaHD: {
    is_supported: true,
    release_group_name: "EniaHD",
    matches: ["EniaHD", "264-EniaHD", "265-EniaHD", "x264-EniaHD", "x265-EniaHD"],
  },
  APEX: {
    is_supported: true,
    release_group_name: "APEX",
    matches: ["APEX", "265-APEX", "264-APEX"],
  },
  FLUX: {
    is_supported: true,
    release_group_name: "FLUX",
    matches: ["FLUX", "265-Flux", "264-Flux"],
  },
  FLUX8: {
    is_supported: true,
    release_group_name: "FLUX8",
    matches: ["FLUX8"],
  },
  GalaxyRG: {
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
  },
  "HDRip-C1NEM4": {
    is_supported: true,
    release_group_name: "HDRip-C1NEM4",
    matches: ["HDRip-C1NEM4"],
  },
  "HEVC-GOPIHD": {
    is_supported: true,
    release_group_name: "HEVC-GOPIHD",
    matches: ["HEVC-GOPIHD"],
  },
  "HEVC-ZiroMB": {
    is_supported: true,
    release_group_name: "HEVC-ZiroMB",
    matches: ["HEVC-ZiroMB", "[ZiroMB]", "ZiroMB"],
  },
  "HEVC-CMRG": {
    is_supported: true,
    release_group_name: "HEVC-CMRG",
    matches: ["HEVC-CMRG", "CMRG", "x264-CMRG", "x265-CMRG", "H264-CMRG", "H265-CMRG"],
  },
  "HEVC-CM": {
    is_supported: true,
    release_group_name: "HEVC-CM",
    matches: ["HEVC-CM", "x264-CM", "x265-CM"],
  },
  "HEVC-PSA": {
    is_supported: true,
    release_group_name: "HEVC-PSA",
    matches: ["HEVC-PSA"],
  },
  "HEVC-EVO": {
    is_supported: true,
    release_group_name: "HEVC-EVO",
    matches: ["HEVC-EVO"],
  },
  ACEM: {
    is_supported: true,
    release_group_name: "ACEM",
    matches: ["ACEM", "264-ACEM", "265-ACEM"],
  },
  EVO: {
    is_supported: true,
    release_group_name: "EVO",
    matches: ["EVO", "264-EVO", "265-EVO", "x264-EVO", "x265-EVO", "264-EVO[TGx]", "265-EVO[TGx]", "AC3-EVO"],
  },
  "Atmos-SWTYBLZ": {
    is_supported: true,
    release_group_name: "Atmos-SWTYBLZ",
    matches: ["Atmos-SWTYBLZ"],
  },
  "Atmos-MRCS": {
    is_supported: true,
    release_group_name: "Atmos-MRCS",
    matches: ["MRCS", "x264-MRCS"],
  },
  KBOX: {
    is_supported: true,
    release_group_name: "KBOX",
    matches: ["KBOX", "h264-kbox", "h265-kbox"],
  },
  BYNDR: {
    is_supported: true,
    release_group_name: "BYNDR",
    matches: ["H264-BYNDR", "BYNDR", "264-BYNDR"],
  },
  RABiDS: {
    is_supported: true,
    release_group_name: "RABiDS",
    matches: ["RABiDS", "H264-RABiDS"],
  },
  SLOT: {
    is_supported: true,
    release_group_name: "SLOT",
    matches: ["SLOT", "h264-slot", "h265-slot"],
  },
  KNiVES: {
    is_supported: true,
    release_group_name: "KNiVES",
    matches: ["KNiVES"],
  },
  LAMA: {
    is_supported: true,
    release_group_name: "LAMA",
    matches: ["LAMA", "x264-LAMA", "AAC-LAMA"],
  },
  LiLKiM: {
    is_supported: true,
    release_group_name: "LiLKiM",
    matches: ["LiLKiM", "h265-lilkim", "h264-lilkim"],
  },
  RiGHTNOW: {
    is_supported: true,
    release_group_name: "RiGHTNOW",
    matches: ["RiGHTNOW"],
  },
  YTS: {
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
  RMTeam: {
    is_supported: true,
    release_group_name: "RMTeam",
    matches: ["x265-rmteam", "x265.rmteam", "rmteam"],
  },
  BobDobbs: {
    is_supported: true,
    release_group_name: "BobDobbs",
    matches: ["H264-BobDobbs", "BobDobbs"],
  },
  SPARKS: {
    is_supported: true,
    release_group_name: "SPARKS",
    matches: ["x264-SPARKS", "SPARKS"],
  },
  MADSKY: {
    is_supported: true,
    release_group_name: "MADSKY",
    matches: ["x264-MADSKY", "x265-MADSKY", "MADSKY", "264-MADSKY", "265-MADSKY"],
  },
  HazMatt: {
    is_supported: true,
    release_group_name: "HazMatt",
    matches: ["HazMatt", "x264-hazmatt", "x265-hazmatt"],
  },
  HUZZAH: {
    is_supported: true,
    release_group_name: "HUZZAH",
    matches: ["HUZZAH", "h264-huzzah", "h265-huzzah"],
  },
  ETRG: {
    is_supported: true,
    release_group_name: "ETRG",
    matches: ["ETRG", "AAC-ETRG", "x264-ETRG", "x265-ETRG"],
  },
  NTB: {
    is_supported: true,
    release_group_name: "NTB",
    matches: ["NTb", "264-NTb", "265-NTb"],
  },
  SuccessfulCrab: {
    is_supported: true,
    release_group_name: "SuccessfulCrab",
    matches: ["H264-SuccessfulCrab", "H265-SuccessfulCrab", "SuccessfulCrab", "(SuccessfulCrab)"],
  },
  TorrentGalaxy: {
    is_supported: true,
    release_group_name: "TorrentGalaxy",
    matches: ["x264-TORRENTGALAXY"],
  },
  MeGusta: {
    is_supported: true,
    release_group_name: "MeGusta",
    matches: ["x265-MeGusta", "MeGusta"],
  },
  MinX: {
    is_supported: true,
    release_group_name: "MinX",
    matches: ["x264-MinX", "x265-MinX"],
  },
  TheCuteness: {
    is_supported: true,
    release_group_name: "TheCuteness",
    matches: ["TheCuteness", "h264-thecuteness", "h265-thecuteness"],
  },
  HHWEB: {
    is_supported: true,
    release_group_name: "HHWEB",
    matches: ["HHWEB", "265-HHWEB", "264-hhweb", "aac-hhweb"],
  },
  BenTheMen: {
    is_supported: true,
    release_group_name: "BEN THE MEN",
    matches: [
      "BEN THE MEN",
      "BEN.THE.MEN,",
      "264-BEN.THE.MEN",
      "265-BEN.THE.MEN",
      "MP4-BEN.THE.MEN",
      "MKV-BEN.THE.MEN",
      "MULTi[Ben The Men]",
      "multi[ben.the.men]",
    ],
  },
  GODZiLLA: {
    is_supported: true,
    release_group_name: "GODZiLLA",
    matches: ["WEB-DL GODZiLLA", "264-GODZiLLA"],
  },
  POKE: {
    is_supported: true,
    release_group_name: "POKE",
    matches: ["H265-POKE", "H264-POKE", "POKE"],
  },
  NellTigerFree: {
    is_supported: true,
    release_group_name: "NellTigerFree",
    matches: ["H265-NellTigerFree"],
  },
  Xebec: {
    is_supported: true,
    release_group_name: "Xebec",
    matches: ["XEBEC", "264-XEBEC", "265-XEBEC"],
  },
  Byndr: {
    is_supported: true,
    release_group_name: "Byndr",
    matches: ["265-BYNDR", "264-BYNDR", "BYNDR", "h264-byndr", "h265-byndr"],
  },
  DualYG: {
    is_supported: true,
    release_group_name: "Dual YG",
    matches: ["Dual YG", "Dual.YG"],
  },
  playWEB: {
    is_supported: true,
    release_group_name: "playWEB",
    matches: ["DSNP playWEB”, ”playWEB", "264-playWEB”,”265-playWEB"],
  },
  LightSaber: {
    is_supported: true,
    release_group_name: "LightSaber",
    matches: ["LightSaber", "HETEL-LightSaber", "H264-lightsaber", "H265-lightsaber"],
  },
  ORGANiC: {
    is_supported: true,
    release_group_name: "ORGANiC",
    matches: ["ORGANIC", "H264-ORGANiC", "H265-ORGANiC"],
  },
  ELiTE: {
    is_supported: true,
    release_group_name: "ELiTE",
    matches: ["h264-ELiTE", "h265-ELiTE", "x264-ELiTE", "x265-ELiTE", "ELiTE"],
  },
  NHTFS: {
    is_supported: true,
    release_group_name: "NHTFS",
    matches: ["h264-NHTFS", "h265-NHTFS", "NHTFS"],
  },
  ROEN: {
    is_supported: true,
    release_group_name: "roen",
    matches: ["ROEN", "x264-ROEN", "x265-ROEN"],
  },
  Asiimov: {
    is_supported: true,
    release_group_name: "Asiimov",
    matches: ["Asiimov", "x265-Asiimov", "x264-Asiimov"],
  },
  Dolores: {
    is_supported: true,
    release_group_name: "DOLORES",
    matches: ["DOLORES", "h264-DOLORES", "h265-DOLORES"],
  },
  Will1869: {
    is_supported: true,
    release_group_name: "Will1869",
    matches: ["Will1869"],
  },
  itspee: {
    is_supported: true,
    release_group_name: "itspee",
    matches: ["itspee", "h265-itspee", "h264-itspee"],
  },
  ZoroSenpai: {
    is_supported: true,
    release_group_name: "ZoroSenpai",
    matches: ["x264-ZoroSenpai", "x265-ZoroSenpai", "ZoroSenpai"],
  },
  thismoviewillblowyouaway: {
    is_supported: true,
    release_group_name: "thismoviewillblowyouaway",
    matches: ["thismoviewillblowyouaway", "h264-thismoviewillblowyouaway", "h265-thismoviewillblowyouaway"],
  },
  privateberyloysterofdemocracy: {
    is_supported: true,
    release_group_name: "privateberyloysterofdemocracy",
    matches: [
      "privateberyloysterofdemocracy",
      "h264-privateberyloysterofdemocracy",
      "h265-privateberyloysterofdemocracy",
    ],
  },
  iseedeadpeople: {
    is_supported: true,
    release_group_name: "iseedeadpeople",
    matches: ["iseedeadpeople", "h264-iseedeadpeople", "h265-iseedeadpeople"],
  },
  RARBG: {
    is_supported: true,
    release_group_name: "RARBG",
    matches: [
      "RARBG",
      "AAC-RARBG",
      "(-MiLLENiUM)(-RARBG)",
      "(-RARBG)",
      " DTS-RARBG",
      "x264-RARBG",
      "x265-RARBG",
      "5.1-RARBG",
    ],
  },
  DEPTH: {
    is_supported: true,
    release_group_name: "DEPTH",
    matches: ["DEPTH", "x264-DEPTH", "x265-DEPTH"],
  },
  Ozlem: {
    is_supported: true,
    release_group_name: "Ozlem",
    matches: ["Ozlem", "AAC - Ozlem"],
  },
  Tigole: {
    is_supported: true,
    release_group_name: "Tigole",
    matches: ["Tigole"],
  },
  Silence: {
    is_supported: true,
    release_group_name: "Silence",
    matches: ["Silence", "x265 Silence", "x264 Silence"],
  },
  AMIABLE: {
    is_supported: true,
    release_group_name: "AMIABLE",
    matches: ["AMIABLE", "X264-AMIABLE", "X265-AMIABLE"],
  },
  HD4U: {
    is_supported: true,
    release_group_name: "HD4U",
    matches: ["hd4u", "x264-hd4u", "x265-hd4u"],
  },
  EDGE2020: {
    is_supported: true,
    release_group_name: "EDGE2020",
    matches: ["EDGE2020", "x264-EDGE2020", "x265-EDGE2020"],
  },
  SiNNERS: {
    is_supported: true,
    release_group_name: "SiNNERS",
    matches: ["SiNNERS", "x264-SiNNERS", "x265-SiNNERS"],
  },
  FAMiLYFOREVER: {
    is_supported: true,
    release_group_name: "FAMiLYFOREVER",
    matches: ["FAMiLYFOREVER", "265-FAMiLYFOREVER", "264-FAMiLYFOREVER"],
  },
  TheBiscuitMan: {
    is_supported: true,
    release_group_name: "TheBiscuitMan",
    matches: ["TheBiscuitMan", "264-TheBiscuitMan", "265-TheBiscuitMan"],
  },
  Chivaman: {
    is_supported: true,
    release_group_name: "Chivaman",
    matches: ["Chivaman", "1-Chivaman"],
  },
  SAMPA: {
    is_supported: true,
    release_group_name: "SAMPA",
    matches: ["SAMPA", "x265 SAMPA", "x264 SAMPA"],
  },
  ViSiON: {
    is_supported: true,
    release_group_name: "ViSiON",
    matches: ["ViSiON", "x264-ViSiON", "x265-ViSiON", "AC3-ViSiON"],
  },
  Grym: {
    is_supported: true,
    release_group_name: "Grym",
    matches: ["Grym", "(Short)-Grym@BTNET", "x264-Grym@BTNET", "x265-Grym@BTNET", "x264-Grym", "x265-Grym"],
  },
  NAISU: {
    is_supported: true,
    release_group_name: "NAISU",
    matches: ["NAISU", "H264-NAISU", "H265-NAISU"],
  },
  NOGRP: {
    is_supported: true,
    release_group_name: "NOGRP",
    matches: ["NOGRP", "x264-NOGRP", "x265-NOGRP", "1-NOGRP"],
  },
  ProLover: {
    is_supported: true,
    release_group_name: "ProLover",
    matches: ["ProLover", "x264 - ProLover"],
  },
  SMURF: {
    is_supported: true,
    release_group_name: "SMURF",
    matches: ["SMURF", "x264-SMURF", "x265-SMURF"],
  },
  RBG: {
    is_supported: true,
    release_group_name: "RBG",
    matches: ["RBG", "x265-RBG", "x264-RBG"],
  },
  CM: {
    is_supported: true,
    release_group_name: "CM",
    matches: ["CM", "H264-CM", "H265-CM"],
  },
  MGHW: {
    is_supported: true,
    release_group_name: "MGHW",
    matches: ["MGHW", "264-MGHW", "265-MGHW"],
  },
  "REMUX-FraMeSToR": {
    is_supported: true,
    release_group_name: "REMUX-FraMeSToR",
    matches: ["REMUX-FraMeSToR"],
  },
  FreeCrystalTarantulaofSunshine: {
    is_supported: true,
    release_group_name: "FreeCrystalTarantulaofSunshine",
    matches: [
      "FreeCrystalTarantulaofSunshine",
      "h264-freecrystaltarantulaofsunshine",
      "h265-freecrystaltarantulaofsunshine",
    ],
  },
  MgB: {
    is_supported: true,
    release_group_name: "MgB",
    matches: ["MgB", "H.265-MgB", "265-MgB", "H265-MgB", "x265-MgB", "H.264-MgB", "264-MgB", "H264-MgB", "x264-MgB"],
  },
  scrupulousslyearwigofmaturity: {
    is_supported: true,
    release_group_name: "scrupulousslyearwigofmaturity",
    matches: [
      "scrupulousslyearwigofmaturity",
      "h264-scrupulousslyearwigofmaturity",
      "h265-scrupulousslyearwigofmaturity",
    ],
  },
  GECKOS: {
    is_supported: true,
    release_group_name: "geckos",
    matches: ["geckos", "x264-geckos", "x265-geckos", "x264-geckos[EtHD]", "x265-geckos[EtHD]"],
  },
  CHD: {
    is_supported: true,
    release_group_name: "CHD",
    matches: ["1-CHD", "DTS-CHD", "x264-CHD"],
  },
  nezu: {
    is_supported: true,
    release_group_name: "nezu",
    matches: ["nezu", "x264-nezu"],
  },
  anoXmous: {
    is_supported: true,
    release_group_name: "anoXmous",
    matches: ["anoXmous", "x264-anoXmous"],
  },
  DAA: {
    is_supported: true,
    release_group_name: "DAA",
    matches: ["DAA", "x264-DAA"],
  },
  TERMiNAL: {
    is_supported: true,
    release_group_name: "TERMiNAL",
    matches: ["TERMiNAL", "x265-TERMiNAL"],
  },
  Joy: {
    is_supported: true,
    release_group_name: "Joy",
    matches: ["Joy", "x264-Joy", "x265-Joy"],
  },
  SURCODE: {
    is_supported: true,
    release_group_name: "SURCODE",
    matches: ["SURCODE", "x264-SURCODE", "x265-SURCODE"],
  },
  KiNGDOM: {
    is_supported: true,
    release_group_name: "KiNGDOM",
    matches: ["KiNGDOM", "DTS-KiNGDOM", "x264-KiNGDOM", "x265-KiNGDOM", "DDP+Atmos-KiNGDOM"],
  },
  PiRaTeS: {
    is_supported: true,
    release_group_name: "PiRaTeS",
    matches: ["PiRaTeS", "265-PiRaTeS", "h265-PiRaTeS"],
  },
  "Atmos-SEMANTiCS": {
    is_supported: true,
    release_group_name: "Atmos-SEMANTiCS",
    matches: ["x264-SEMANTiCS", "x265-SEMANTiCS", "Atmos-SEMANTiCS"],
  },
  PHOENiX: {
    is_supported: true,
    release_group_name: "PHOENiX",
    matches: ["264-PHOENiX", "265-PHOENiX", "PHOENIX"],
  },
  PublicHD: {
    is_supported: true,
    release_group_name: "PublicHD",
    matches: ["PublicHD", "H264-PublicHD", "H265-PublicHD"],
  },
  OMGFR: {
    is_supported: true,
    release_group_name: "OMGFR",
    matches: ["omgfr", "h264-omgfr", "h265-omgfr"],
  },
  B0MBARDiERS: {
    is_supported: true,
    release_group_name: "B0MBARDiERS",
    matches: ["b0mbardiers", "x264-b0mbardiers", "x265-b0mbardiers"],
  },
  HEVC: {
    is_supported: true,
    release_group_name: "HEVC",
    matches: ["HEVC", "x264-HEVC", "x265-HEVC"],
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

    const { release_group_name, matches, is_supported } = releaseGroup;

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
          matches: matches as unknown as string[],
        })
        .eq("id", existingGroups.id);
    } else {
      await supabaseClient.from("ReleaseGroups").insert({
        is_supported,
        matches: matches as unknown as string[],
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
