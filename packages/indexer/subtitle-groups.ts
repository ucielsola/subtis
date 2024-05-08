import invariant from "tiny-invariant";

// db
import type { SupabaseClient } from "@subtis/db";

import { getOpenSubtitlesSubtitle } from "./opensubtitles";
// internals
import { getSubDivXSubtitle } from "./subdivx";

// constants
export const SUBTITLE_GROUPS = {
  OPEN_SUBTITLES: {
    name: "OpenSubtitles",
    website: "https://www.opensubtitles.org",
  },
  SUBDIVX: {
    name: "SubDivX",
    website: "https://subdivx.com",
  },
} as const;

export const SUBTITLE_GROUPS_ARRAY = Object.values(SUBTITLE_GROUPS);

const SUBTITLE_GROUPS_GETTERS = {
  OpenSubtitles: getOpenSubtitlesSubtitle,
  SubDivX: getSubDivXSubtitle,
} as const;

// types
export type SubtitleGroup = {
  name: string;
  website: string;
};

export type SubtitleGroupMap = {
  [key in SubtitleGroupNames]: SubtitleGroup & {
    created_at: string;
    id: number;
  };
};

export type SubtitleGroupNames = (typeof SUBTITLE_GROUPS)[keyof typeof SUBTITLE_GROUPS]["name"];

type SubtitleGroupKeys = keyof typeof SUBTITLE_GROUPS;

// utils
export async function saveSubtitleGroupsToDb(supabaseClient: SupabaseClient): Promise<void> {
  const { data } = await supabaseClient.from("SubtitleGroups").select("*");

  for (const subtitleGroupKey in SUBTITLE_GROUPS) {
    const subtitleGroup = SUBTITLE_GROUPS[subtitleGroupKey as SubtitleGroupKeys];

    const subtitleGroupExists = data?.find((subtitleGrouInDb) => subtitleGrouInDb.name === subtitleGroup.name);
    if (subtitleGroupExists) {
      continue;
    }

    await supabaseClient.from("SubtitleGroups").insert(subtitleGroup);
  }
}

export function getEnabledSubtitleProviders(subtitleGroups: SubtitleGroupMap, providers: SubtitleGroupNames[]) {
  return Object.values(subtitleGroups)
    .map((subtitleGroup) => {
      const subtitleGroupGetter = SUBTITLE_GROUPS_GETTERS[subtitleGroup.name as SubtitleGroupNames];
      return { ...subtitleGroup, getSubtitleFromProvider: subtitleGroupGetter };
    })
    .filter((subtitleGroup) => providers.includes(subtitleGroup.name));
}

// core
export async function getSubtitleGroups(supabaseClient: SupabaseClient): Promise<SubtitleGroupMap> {
  const { data } = await supabaseClient.from("SubtitleGroups").select("*");
  invariant(data, "SubtitleGroups not found in database");

  const subtitleGroups = data.reduce((acc, subtitleGroup) => ({ ...acc, [subtitleGroup.name]: subtitleGroup }), {});

  return subtitleGroups as SubtitleGroupMap;
}
