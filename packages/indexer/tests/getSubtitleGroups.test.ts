import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test'

// db
import { getSupabaseEnvironmentVariables, supabase } from 'db'

// internals
import { getSubtitleGroups } from '../subtitle-groups'

// constants
const { supabaseBaseUrl } = getSupabaseEnvironmentVariables()

// mocks
const SUBTITLE_GROUPS_MOCK = {
  Argenteam: {
    created_at: '2023-12-07T20:33:29.333364+00:00',
    id: 37,
    name: 'Argenteam',
    website: 'https://argenteam.net',
  },
  OpenSubtitles: {
    created_at: '2023-12-07T20:33:29.493883+00:00',
    id: 38,
    name: 'OpenSubtitles',
    website: 'https://www.opensubtitles.org',
  },
  SubDivX: {
    created_at: '2023-12-07T20:33:29.16+00:00',
    id: 36,
    name: 'SubDivX',
    website: 'https://subdivx.com',
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
