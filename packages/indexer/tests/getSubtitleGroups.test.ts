import { expect, test } from 'bun:test'

// db
import { supabase } from '@subtis/db'

// internals
import { getSubtitleGroups } from '../subtitle-groups'

// mocks
const SUBTITLE_GROUPS_MOCK = {
  SubDivX: {
    id: 39,
    created_at: '2024-01-08T01:10:30.01214+00:00',
    name: 'SubDivX',
    website: 'https://subdivx.com',
  },
  OpenSubtitles: {
    id: 40,
    created_at: '2024-01-08T01:10:30.090311+00:00',
    name: 'OpenSubtitles',
    website: 'https://www.opensubtitles.org',
  },
}

test('Indexer | should return a list of subtitle groups', async () => {
  const subtitleGroups = await getSubtitleGroups(supabase)
  expect(subtitleGroups).toEqual(SUBTITLE_GROUPS_MOCK)
})
