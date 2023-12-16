import invariant from 'tiny-invariant'

// db
import type { SupabaseClient } from 'db'

// internals
import { getSubDivXSubtitle } from './subdivx'
import { getArgenteamSubtitle } from './argenteam'
import { getOpenSubtitlesSubtitle } from './opensubtitles'

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
} as const

export const SUBTITLE_GROUPS_ARRAY = Object.values(SUBTITLE_GROUPS)

const SUBTITLE_GROUPS_GETTERS = {
  SubDivX: getSubDivXSubtitle,
  Argenteam: getArgenteamSubtitle,
  OpenSubtitles: getOpenSubtitlesSubtitle,
} as const

// types
export type SubtitleGroup = {
  name: string
  website: string
}

export type SubtitleGroupMap = {
  [key in SubtitleGroupNames]: SubtitleGroup & {
    id: number
    created_at: string
  };
}

export type SubtitleGroupNames = (typeof SUBTITLE_GROUPS)[keyof typeof SUBTITLE_GROUPS]['name']

type SubtitleGroupKeys = keyof typeof SUBTITLE_GROUPS

// utils
export async function saveSubtitleGroupsToDb(supabaseClient: SupabaseClient): Promise<void> {
  for (const subtitleGroupKey in SUBTITLE_GROUPS) {
    const { name, website } = SUBTITLE_GROUPS[subtitleGroupKey as SubtitleGroupKeys]
    await supabaseClient.from('SubtitleGroups').insert({ name, website })
  }
}

export function getEnabledSubtitleProviders(subtitleGroups: SubtitleGroupMap, providers: SubtitleGroupNames[]) {
  return Object.values(subtitleGroups).map((subtitleGroup) => {
    const subtitleGroupGetter = SUBTITLE_GROUPS_GETTERS[subtitleGroup.name as SubtitleGroupNames]
    return { ...subtitleGroup, getSubtitleFromProvider: subtitleGroupGetter }
  }).filter(subtitleGroup => providers.includes(subtitleGroup.name))
}

// core
export async function getSubtitleGroups(supabaseClient: SupabaseClient): Promise<SubtitleGroupMap> {
  const { data } = await supabaseClient.from('SubtitleGroups').select('*')
  invariant(data, 'SubtitleGroups not found in database')

  const subtitleGroups = data.reduce((acc, subtitleGroup) => ({ ...acc, [subtitleGroup.name]: subtitleGroup }), {})

  return subtitleGroups as SubtitleGroupMap
}
