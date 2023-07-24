import { SupabaseClient } from '@supabase/supabase-js';

export const RELEASE_GROUPS = {
  YTS_MX: {
    name: 'YTS-MX',
    fileAttribute: 'YTS.MX',
    website: 'https://yts.mx',
    searchableSubDivXName: 'YTS MX',
  },
  CODY: {
    name: 'CODY',
    website: '',
    fileAttribute: 'CODY',
    searchableSubDivXName: 'H265-CODY',
  },
} as const;

export type ReleaseGroup = {
  name: string;
  website: string;
  fileAttribute: string;
  searchableSubDivXName: string;
};

export type ReleaseGroupMap = { [key in ReleaseGroupNames]: ReleaseGroup & { id: number; created_at: string } };

export type ReleaseGroupNames = (typeof RELEASE_GROUPS)[keyof typeof RELEASE_GROUPS]['name'];

type ReleaseGroupKeys = keyof typeof RELEASE_GROUPS;

// run only once
export async function saveReleaseGroupsToDb(supabaseClient: SupabaseClient): Promise<void> {
  for (const releaseGroupKey in RELEASE_GROUPS) {
    const releaseGroup = RELEASE_GROUPS[releaseGroupKey as ReleaseGroupKeys];
    await supabaseClient.from('ReleaseGroups').insert(releaseGroup);
  }
}

export async function getReleaseGroupsFromDb(supabaseClient: SupabaseClient): Promise<ReleaseGroupMap> {
  const { data } = await supabaseClient.from('ReleaseGroups').select('*');
  const releaseGroups = data.reduce((acc, releaseGroup) => ({ ...acc, [releaseGroup.name]: releaseGroup }), {});

  return releaseGroups as ReleaseGroupMap;
}
