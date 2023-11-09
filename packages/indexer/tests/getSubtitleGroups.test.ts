import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test'

import { getSupabaseEnvironmentVariables, supabase } from 'db'
import { getSubtitleGroups } from '../subtitle-groups'

// constants
const { supabaseBaseUrl } = getSupabaseEnvironmentVariables()

// mocks
const SUBTITLE_GROUPS_MOCK = {
  Argenteam: {
    id: 34,
    name: 'Argenteam',
    website: 'https://argenteam.net',
    created_at: '2023-09-18T02:01:56.838121+00:00',
  },
  OpenSubtitles: {
    id: 35,
    name: 'OpenSubtitles',
    website: 'https://www.opensubtitles.org',
    created_at: '2023-09-18T02:01:56.969959+00:00',
  },
  SubDivX: {
    id: 33,
    name: 'SubDivX',
    website: 'https://subdivx.com',
    created_at: '2023-09-18T02:01:56.7104+00:00',
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

test('should return a list of release groups', async () => {
  const releaseGroups = await getSubtitleGroups(supabase)
  expect(releaseGroups).toEqual(SUBTITLE_GROUPS_MOCK)
})
