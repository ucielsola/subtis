import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test'

// db
import { getSupabaseEnvironmentVariables, supabase } from '@subtis/db'

// internals
import { getSubtitleGroups } from '../subtitle-groups'

// constants
const { supabaseBaseUrl } = getSupabaseEnvironmentVariables()

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

const server = setupServer(
  rest.all(`${supabaseBaseUrl}/rest/v1/SubtitleGroups`, async (req, res, ctx) => {
    switch (req.method) {
      case 'GET':
        return res(ctx.json(SUBTITLE_GROUPS_MOCK))
      default:
        return res(ctx.json('Unhandled method'))
    }
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('Indexer | should return a list of subtitle groups', async () => {
  const subtitleGroups = await getSubtitleGroups(supabase)
  expect(subtitleGroups).toEqual(SUBTITLE_GROUPS_MOCK)
})
