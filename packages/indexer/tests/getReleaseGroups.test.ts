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
    created_at: '2023-12-20T15:14:25.959454+00:00',
    fileAttribute: 'CODY',
    id: 41,
    isSupported: true,
    name: 'CODY',
    searchableArgenteamName: 'CODY',
    searchableOpenSubtitlesName: 'CODY',
    searchableSubDivXName: 'H265-CODY',
    website: '',
  },
  'EDITH': {
    created_at: '2023-12-20T15:14:26.360214+00:00',
    fileAttribute: 'h264-EDITH',
    id: 45,
    isSupported: true,
    name: 'EDITH',
    searchableArgenteamName: 'EDITH',
    searchableOpenSubtitlesName: 'EDITH',
    searchableSubDivXName: 'edith',
    website: '',
  },
  'FLUX': {
    created_at: '2023-12-20T15:14:26.264292+00:00',
    fileAttribute: 'FLUX',
    id: 44,
    isSupported: true,
    name: 'FLUX',
    searchableArgenteamName: 'FLUX',
    searchableOpenSubtitlesName: 'FLUX',
    searchableSubDivXName: 'FLUX',
    website: '',
  },
  'GalaxyRG': {
    created_at: '2023-12-20T15:14:26.053702+00:00',
    fileAttribute: 'GalaxyRG',
    id: 42,
    isSupported: true,
    name: 'GalaxyRG',
    searchableArgenteamName: 'GalaxyRG',
    searchableOpenSubtitlesName: 'GalaxyRG',
    searchableSubDivXName: 'GalaxyRG',
    website: '',
  },
  'HEVC-CMRG': {
    created_at: '2023-12-20T15:14:26.478045+00:00',
    fileAttribute: 'HEVC-CMRG',
    id: 46,
    isSupported: true,
    name: 'HEVC-CMRG',
    searchableArgenteamName: 'HEVC-CMRG',
    searchableOpenSubtitlesName: 'HEVC-CMRG',
    searchableSubDivXName: 'cmrg',
    website: '',
  },
  'RiGHTNOW': {
    created_at: '2023-12-20T15:14:26.170684+00:00',
    fileAttribute: 'RiGHTNOW',
    id: 43,
    isSupported: true,
    name: 'RiGHTNOW',
    searchableArgenteamName: 'RiGHTNOW',
    searchableOpenSubtitlesName: 'RiGHTNOW',
    searchableSubDivXName: 'RIGHTNOW',
    website: '',
  },
  'YTS-MX': {
    created_at: '2023-12-20T15:14:25.792392+00:00',
    fileAttribute: 'YTS.MX',
    id: 40,
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
