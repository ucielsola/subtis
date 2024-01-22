import invariant from 'tiny-invariant'

// db
import type { SupabaseClient } from '@subtis/db'

// constants
export const RELEASE_GROUPS = {
  'YTS-MX': {
    name: 'YTS-MX',
    fileAttribute: 'YTS.MX',
    isSupported: true,
    website: 'https://yts.mx',
    searchableSubDivXName: 'YTS MX',
    searchableOpenSubtitlesName: 'YTS.MX',
  },
  'CODY': {
    name: 'CODY',
    website: '',
    isSupported: true,
    fileAttribute: 'CODY',
    searchableSubDivXName: 'H265-CODY',
    searchableOpenSubtitlesName: 'CODY',
  },
  'GalaxyRG': {
    name: 'GalaxyRG',
    website: '',
    isSupported: true,
    fileAttribute: 'GalaxyRG',
    searchableSubDivXName: 'GalaxyRG',
    searchableOpenSubtitlesName: 'GalaxyRG',
  },
  'RiGHTNOW': {
    name: 'RiGHTNOW',
    website: '',
    isSupported: true,
    fileAttribute: 'RiGHTNOW',
    searchableSubDivXName: 'RIGHTNOW',
    searchableOpenSubtitlesName: 'RiGHTNOW',
  },
  'FLUX': {
    name: 'FLUX',
    website: '',
    isSupported: true,
    fileAttribute: 'FLUX',
    searchableSubDivXName: 'FLUX',
    searchableOpenSubtitlesName: 'FLUX',
  },
  'EDITH': {
    name: 'EDITH',
    website: '',
    isSupported: true,
    fileAttribute: 'h264-EDITH',
    searchableSubDivXName: 'edith',
    searchableOpenSubtitlesName: 'EDITH', // TODO: Check in OpenSubtitles if this is correct
  },
  'HEVC-CMRG': {
    name: 'HEVC-CMRG',
    website: '',
    isSupported: true,
    fileAttribute: 'HEVC-CMRG',
    searchableSubDivXName: 'cmrg',
    searchableOpenSubtitlesName: 'HEVC-CMRG', // TODO: Check in OpenSubtitles if this is correct
  },
  'HEVC-PSA': {
    name: 'HEVC-PSA',
    website: '',
    isSupported: true,
    fileAttribute: 'HEVC-PSA',
    searchableSubDivXName: 'hevc-psa',
    searchableOpenSubtitlesName: 'HEVC-PSA', // TODO: Check in OpenSubtitles if this is correct
  },
} as const

// types
export type ReleaseGroup = {
  name: string
  website: string
  isSupported: boolean
  fileAttribute: string
  searchableSubDivXName: string
  searchableOpenSubtitlesName: string
}

export type ReleaseGroupMap = {
  [key in ReleaseGroupNames]: ReleaseGroup & { id: number, created_at: string };
}

export type ReleaseGroupNames = (typeof RELEASE_GROUPS)[keyof typeof RELEASE_GROUPS]['name']

export type ReleaseGroupKeys = keyof typeof RELEASE_GROUPS

// utils
export async function saveReleaseGroupsToDb(supabaseClient: SupabaseClient): Promise<void> {
  const { data } = await supabaseClient.from('ReleaseGroups').select('*')

  for (const releaseGroupKey in RELEASE_GROUPS) {
    const releaseGroup = RELEASE_GROUPS[releaseGroupKey as ReleaseGroupKeys]

    const releaseGroupExists = data?.find(releaseGroupInDb => releaseGroupInDb.name === releaseGroup.name)
    if (releaseGroupExists) {
      continue
    }

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
