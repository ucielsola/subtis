import invariant from 'tiny-invariant'

// db
import type { SupabaseClient } from '@subtis/db'

// constants
export const RELEASE_GROUPS = {
  // 'AAC': {
  //   fileAttributes: ['AAC'],
  //   isSupported: true,
  //   name: 'AAC',
  //   searchableOpenSubtitlesName: ['AAC'],
  //   searchableSubDivXName: ['aac'],
  //   website: '',
  // },
  'CODY': {
    fileAttributes: ['CODY'],
    isSupported: true,
    name: 'CODY',
    searchableOpenSubtitlesName: ['CODY'],
    searchableSubDivXName: ['H265-CODY'],
    website: '',
  },
  'EDITH': {
    fileAttributes: ['h264-EDITH'],
    isSupported: true,
    name: 'EDITH',
    searchableOpenSubtitlesName: ['EDITH'],
    searchableSubDivXName: ['edith'],
    website: '',
  },
  'ETHEL': {
    fileAttributes: ['h265-ETHEL'],
    isSupported: true,
    name: 'ETHEL',
    searchableOpenSubtitlesName: ['ETHEL'],
    searchableSubDivXName: ['H265-ETHEL'],
    website: '',
  },
  'FLUX': {
    fileAttributes: ['FLUX', '265-Flux'],
    isSupported: true,
    name: 'FLUX',
    searchableOpenSubtitlesName: ['FLUX'],
    searchableSubDivXName: ['FLUX', '265-FLUX'],
    website: '',
  },
  'FLUX8': {
    fileAttributes: ['FLUX8'],
    isSupported: true,
    name: 'FLUX8',
    searchableOpenSubtitlesName: ['FLUX8'],
    searchableSubDivXName: ['FLUX8'],
    website: '',
  },
  'GalaxyRG': {
    fileAttributes: ['GalaxyRG'],
    isSupported: true,
    name: 'GalaxyRG',
    searchableOpenSubtitlesName: ['GalaxyRG'],
    searchableSubDivXName: ['GalaxyRG'],
    website: '',
  },
  'HEVC-CMRG': {
    fileAttributes: ['HEVC-CMRG'],
    isSupported: true,
    name: 'HEVC-CMRG',
    searchableOpenSubtitlesName: ['HEVC-CMRG'],
    searchableSubDivXName: ['cmrg'],
    website: '',
  },
  'HEVC-PSA': {
    fileAttributes: ['HEVC-PSA'],
    isSupported: true,
    name: 'HEVC-PSA',
    searchableOpenSubtitlesName: ['HEVC-PSA'],
    searchableSubDivXName: ['hevc-psa'],
    website: '',
  },
  'KBOX': {
    fileAttributes: ['h264-kbox', 'h265-kbox'],
    isSupported: true,
    name: 'KBOX',
    searchableOpenSubtitlesName: ['KBOX'],
    searchableSubDivXName: ['KBOX'],
    website: '',
  },
  'LAMA': {
    fileAttributes: ['x264-LAMA'],
    isSupported: true,
    name: 'LAMA',
    searchableOpenSubtitlesName: ['LAMA'],
    searchableSubDivXName: ['LAMA'],
    website: '',
  },
  'LiLKiM': {
    fileAttributes: ['h265-lilkim', 'h264-lilkim'],
    isSupported: true,
    name: 'LiLKiM',
    searchableOpenSubtitlesName: ['LiLKiM'],
    searchableSubDivXName: ['LiLKiM'],
    website: '',
  },
  'RiGHTNOW': {
    fileAttributes: ['RiGHTNOW'],
    isSupported: true,
    name: 'RiGHTNOW',
    searchableOpenSubtitlesName: ['RiGHTNOW'],
    searchableSubDivXName: ['RIGHTNOW'],
    website: '',
  },
  'YTS-MX': {
    fileAttributes: ['YTS.MX'],
    isSupported: true,
    name: 'YTS-MX',
    searchableOpenSubtitlesName: ['YTS.MX'],
    searchableSubDivXName: ['YTS MX', 'YTS.MX', 'YTS'],
    website: 'https://yts.mx',
  },
} as const

// types
export type ReleaseGroup = {
  fileAttributes: string[]
  isSupported: boolean
  name: string
  searchableOpenSubtitlesName: string[]
  searchableSubDivXName: string[]
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
