import invariant from 'tiny-invariant'

// db
import type { SupabaseClient } from 'db'

// constants
export const RELEASE_GROUPS = {
  YTS_MX: {
    name: 'YTS-MX',
    fileAttribute: 'YTS.MX',
    isSupported: true,
    website: 'https://yts.mx',
    searchableSubDivXName: 'YTS MX',
    searchableArgenteamName: 'YIFY',
    searchableOpenSubtitlesName: 'YTS.MX',
  },
  CODY: {
    name: 'CODY',
    website: '',
    isSupported: true,
    fileAttribute: 'CODY',
    searchableSubDivXName: 'H265-CODY',
    searchableArgenteamName: 'CODY',
    searchableOpenSubtitlesName: 'CODY',
  },
  GALAXY_RG: {
    name: 'GalaxyRG',
    website: '',
    isSupported: true,
    fileAttribute: 'GalaxyRG',
    searchableSubDivXName: 'GalaxyRG',
    searchableArgenteamName: 'GalaxyRG',
    searchableOpenSubtitlesName: 'GalaxyRG',
  },
  RIGHTNOW: {
    name: 'RiGHTNOW',
    website: '',
    isSupported: true,
    fileAttribute: 'RiGHTNOW',
    searchableSubDivXName: 'RIGHTNOW',
    searchableArgenteamName: 'RiGHTNOW',
    searchableOpenSubtitlesName: 'RiGHTNOW',
  },
  AMZN: {
    name: 'AMZN',
    website: '',
    isSupported: true,
    fileAttribute: 'AMZN',
    searchableSubDivXName: 'amzn',
    searchableArgenteamName: 'AMZN',
    searchableOpenSubtitlesName: 'AMAZN',
  },
} as const

// types
export type ReleaseGroup = {
  name: string
  website: string
  fileAttribute: string
  searchableSubDivXName: string
}

export type ReleaseGroupMap = {
  [key in ReleaseGroupNames]: ReleaseGroup & { id: number, created_at: string };
}

export type ReleaseGroupNames = (typeof RELEASE_GROUPS)[keyof typeof RELEASE_GROUPS]['name']

type ReleaseGroupKeys = keyof typeof RELEASE_GROUPS

// utils
export async function saveReleaseGroupsToDb(supabaseClient: SupabaseClient): Promise<void> {
  for (const releaseGroupKey in RELEASE_GROUPS) {
    const releaseGroup = RELEASE_GROUPS[releaseGroupKey as ReleaseGroupKeys]
    await supabaseClient.from('ReleaseGroups').insert(releaseGroup)
  }
}

// core
export async function getReleaseGroups(supabaseClient: SupabaseClient): Promise<ReleaseGroupMap> {
  const { data } = await supabaseClient.from('ReleaseGroups').select('*')
  invariant(data, 'ReleaseGroups not found in database')

  const releaseGroups = data.reduce((acc, releaseGroup) => ({ ...acc, [releaseGroup.name]: releaseGroup }), {})

  return releaseGroups as ReleaseGroupMap
}
