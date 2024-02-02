import invariant from 'tiny-invariant'

// db
import type { SupabaseClient } from '@subtis/db'

// constants
export const RELEASE_GROUPS = {
  'AAC': {
    fileAttribute: 'AAC',
    isSupported: true,
    name: 'AAC',
    searchableOpenSubtitlesName: 'AAC', // TODO: Check in OpenSubtitles if this is correct
    searchableSubDivXName: 'aac',
    website: '',
  },
  'CODY': {
    fileAttribute: 'CODY',
    isSupported: true,
    name: 'CODY',
    searchableOpenSubtitlesName: 'CODY',
    searchableSubDivXName: 'H265-CODY',
    website: '',
  },
  'EDITH': {
    fileAttribute: 'h264-EDITH',
    isSupported: true,
    name: 'EDITH',
    searchableOpenSubtitlesName: 'EDITH', // TODO: Check in OpenSubtitles if this is correct
    searchableSubDivXName: 'edith',
    website: '',
  },
  'FLUX': {
    fileAttribute: 'FLUX',
    isSupported: true,
    name: 'FLUX',
    searchableOpenSubtitlesName: 'FLUX',
    searchableSubDivXName: 'FLUX',
    website: '',
  },
  'GalaxyRG': {
    fileAttribute: 'GalaxyRG',
    isSupported: true,
    name: 'GalaxyRG',
    searchableOpenSubtitlesName: 'GalaxyRG',
    searchableSubDivXName: 'GalaxyRG',
    website: '',
  },
  'HEVC-CMRG': {
    fileAttribute: 'HEVC-CMRG',
    isSupported: true,
    name: 'HEVC-CMRG',
    searchableOpenSubtitlesName: 'HEVC-CMRG', // TODO: Check in OpenSubtitles if this is correct
    searchableSubDivXName: 'cmrg',
    website: '',
  },
  'HEVC-PSA': {
    fileAttribute: 'HEVC-PSA',
    isSupported: true,
    name: 'HEVC-PSA',
    searchableOpenSubtitlesName: 'HEVC-PSA', // TODO: Check in OpenSubtitles if this is correct
    searchableSubDivXName: 'hevc-psa',
    website: '',
  },
  'RiGHTNOW': {
    fileAttribute: 'RiGHTNOW',
    isSupported: true,
    name: 'RiGHTNOW',
    searchableOpenSubtitlesName: 'RiGHTNOW',
    searchableSubDivXName: 'RIGHTNOW',
    website: '',
  },
  'YTS-MX': {
    fileAttribute: 'YTS.MX',
    isSupported: true,
    name: 'YTS-MX',
    searchableOpenSubtitlesName: 'YTS.MX',
    searchableSubDivXName: 'YTS MX',
    website: 'https://yts.mx',
  },
} as const

// types
export type ReleaseGroup = {
  fileAttribute: string
  isSupported: boolean
  name: string
  searchableOpenSubtitlesName: string
  searchableSubDivXName: string
  website: string
}

export type ReleaseGroupMap = {
  [key in ReleaseGroupNames]: ReleaseGroup & { created_at: string, id: number };
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
