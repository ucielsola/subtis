import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test'

// db
import { getSupabaseEnvironmentVariables, supabase } from 'db'

// internals
import { getReleaseGroups } from '../release-groups'

// constants
const { supabaseBaseUrl } = getSupabaseEnvironmentVariables()

// mocks
const RELEASE_GROUPS_MOCK = {
  'CODY': {
    created_at: '2023-12-07T20:33:29.445402+00:00',
    fileAttribute: 'CODY',
    id: 35,
    isSupported: true,
    name: 'CODY',
    searchableArgenteamName: 'CODY',
    searchableOpenSubtitlesName: 'CODY',
    searchableSubDivXName: 'H265-CODY',
    website: '',
  },
  'EDITH': {
    created_at: '2023-12-07T20:33:29.827751+00:00',
    fileAttribute: 'h264-EDITH',
    id: 39,
    isSupported: true,
    name: 'EDITH',
    searchableArgenteamName: 'EDITH',
    searchableOpenSubtitlesName: 'EDITH',
    searchableSubDivXName: 'edith',
    website: '',
  },
  'FLUX': {
    created_at: '2023-12-07T20:33:29.735611+00:00',
    fileAttribute: 'FLUX',
    id: 38,
    isSupported: true,
    name: 'FLUX',
    searchableArgenteamName: 'FLUX',
    searchableOpenSubtitlesName: 'FLUX',
    searchableSubDivXName: 'FLUX',
    website: '',
  },
  'GalaxyRG': {
    created_at: '2023-12-07T20:33:29.550034+00:00',
    fileAttribute: 'GalaxyRG',
    id: 36,
    isSupported: true,
    name: 'GalaxyRG',
    searchableArgenteamName: 'GalaxyRG',
    searchableOpenSubtitlesName: 'GalaxyRG',
    searchableSubDivXName: 'GalaxyRG',
    website: '',
  },
  'RiGHTNOW': {
    created_at: '2023-12-07T20:33:29.644475+00:00',
    fileAttribute: 'RiGHTNOW',
    id: 37,
    isSupported: true,
    name: 'RiGHTNOW',
    searchableArgenteamName: 'RiGHTNOW',
    searchableOpenSubtitlesName: 'RiGHTNOW',
    searchableSubDivXName: 'RIGHTNOW',
    website: '',
  },
  'YTS-MX': {
    created_at: '2023-12-07T20:33:29.264805+00:00',
    fileAttribute: 'YTS.MX',
    id: 34,
    isSupported: true,
    name: 'YTS-MX',
    searchableArgenteamName: 'YIFY',
    searchableOpenSubtitlesName: 'YTS.MX',
    searchableSubDivXName: 'YTS MX',
    website: 'https://yts.mx',
  },
}

const server = setupServer(
  rest.all(`${supabaseBaseUrl}/rest/v1/ReleaseGroups`, async (req, res, ctx) => {
    switch (req.method) {
      case 'GET':
        return res(ctx.json(RELEASE_GROUPS_MOCK))
      default:
        return res(ctx.json('Unhandled method'))
    }
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('should return a list of release groups', async () => {
  const releaseGroups = await getReleaseGroups(supabase)
  expect(releaseGroups).toEqual(RELEASE_GROUPS_MOCK)
})
