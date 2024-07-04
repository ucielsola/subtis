import invariant from "tiny-invariant";

// db
import type { SupabaseClient } from "@subtis/db";

// constants
export const SUBTITLE_GROUPS = {
  SUBDIVX: {
    subtitle_group_name: "SubDivX",
    website: "https://subdivx.com",
  },
  OPEN_SUBTITLES: {
    subtitle_group_name: "OpenSubtitles",
    website: "https://www.opensubtitles.org",
  },
} as const;

export const SUBTITLE_GROUPS_ARRAY = Object.values(SUBTITLE_GROUPS);

// const SUBTITLE_GROUPS_GETTERS = {
//   OpenSubtitles: getOpenSubtitlesSubtitle,
// } as const;

// types
export type SubtitleGroup = {
  subtitle_group_name: string;
  website: string;
};

export type SubtitleGroupMap = {
  [key in SubtitleGroupNames]: SubtitleGroup & {
    created_at: string;
    id: number;
  };
};

export type SubtitleGroupNames = (typeof SUBTITLE_GROUPS)[keyof typeof SUBTITLE_GROUPS]["subtitle_group_name"];

type SubtitleGroupKeys = keyof typeof SUBTITLE_GROUPS;

// utils
export async function saveSubtitleGroupsToDb(supabaseClient: SupabaseClient): Promise<void> {
  const { data } = await supabaseClient.from("SubtitleGroups").select("*");

  for (const subtitleGroupKey in SUBTITLE_GROUPS) {
    const subtitleGroup = SUBTITLE_GROUPS[subtitleGroupKey as SubtitleGroupKeys];

    const subtitleGroupExists = data?.find(
      (subtitleGrouInDb) => subtitleGrouInDb.subtitle_group_name === subtitleGroup.subtitle_group_name,
    );
    if (subtitleGroupExists) {
      continue;
    }

    await supabaseClient.from("SubtitleGroups").upsert(subtitleGroup);
  }
}

// export function getEnabledSubtitleProviders(subtitleGroups: SubtitleGroupMap, providers: SubtitleGroupNames[]) {
//   return Object.values(subtitleGroups)
//     .map((subtitleGroup) => {
//       const subtitleGroupGetter = SUBTITLE_GROUPS_GETTERS[subtitleGroup.subtitle_group_name as SubtitleGroupNames];
//       return { ...subtitleGroup, getSubtitleFromProvider: subtitleGroupGetter };
//     })
//     .filter((subtitleGroup) => providers.includes(subtitleGroup.subtitle_group_name));
// }

// core
export async function getSubtitleGroups(supabaseClient: SupabaseClient): Promise<SubtitleGroupMap> {
  const { data } = await supabaseClient.from("SubtitleGroups").select("*");
  invariant(data, "SubtitleGroups not found in database");

  const subtitleGroups = data.reduce(
    (acc, subtitleGroup) => ({ ...acc, [subtitleGroup.subtitle_group_name]: subtitleGroup }),
    {},
  );

  return subtitleGroups as SubtitleGroupMap;
}
