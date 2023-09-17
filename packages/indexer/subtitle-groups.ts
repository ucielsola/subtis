import invariant from 'tiny-invariant';

import { SupabaseClient } from 'db';

// constants
export const SUBTITLE_GROUPS = {
  SUBDIVX: {
    name: 'SubDivX',
    website: 'https://subdivx.com',
  },
  ARGENTEAM: {
    name: 'Argenteam',
    website: 'https://argenteam.net',
  },
  OPEN_SUBTITLES: {
    name: 'OpenSubtitles',
    website: 'https://www.opensubtitles.org',
  },
} as const;

// type definitions
export type SubtitleGroup = {
  name: string;
  website: string;
};

export type SubtitleGroupMap = {
  [key in SubtitleGroupNames]: SubtitleGroup & {
    id: number;
    created_at: string;
  };
};

export type SubtitleGroupNames = (typeof SUBTITLE_GROUPS)[keyof typeof SUBTITLE_GROUPS]['name'];

type SubtitleGroupKeys = keyof typeof SUBTITLE_GROUPS;

// utils
export async function saveSubtitleGroupsToDb(supabaseClient: SupabaseClient): Promise<void> {
  for (const subtitleGroupKey in SUBTITLE_GROUPS) {
    const subtitleGroup = SUBTITLE_GROUPS[subtitleGroupKey as SubtitleGroupKeys];
    await supabaseClient.from('SubtitleGroups').insert(subtitleGroup);
  }
}

// main
export async function getSubtitleGroups(supabaseClient: SupabaseClient): Promise<SubtitleGroupMap> {
  const { data } = await supabaseClient.from('SubtitleGroups').select('*');
  invariant(data, 'SubtitleGroups not found in database');

  const subtitleGroups = data.reduce((acc, subtitleGroup) => ({ ...acc, [subtitleGroup.name]: subtitleGroup }), {});

  return subtitleGroups as SubtitleGroupMap;
}
