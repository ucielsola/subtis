import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test'

// db
import { getSupabaseEnvironmentVariables, supabase } from '@subtis/db'

// internals
import { getReleaseGroups } from '../release-groups'

// constants
const { supabaseBaseUrl } = getSupabaseEnvironmentVariables()

// mocks
const RELEASE_GROUPS_MOCK = {
  'YTS-MX': {
    id: 47,
    created_at: '2024-01-08T01:10:30.014218+00:00',
    name: 'YTS-MX',
    website: 'https://yts.mx',
    fileAttribute: 'YTS.MX',
    searchableSubDivXName: 'YTS MX',
    searchableOpenSubtitlesName: 'YTS.MX',
    isSupported: true,
  },
  'CODY': {
    id: 48,
    created_at: '2024-01-08T01:10:30.087887+00:00',
    name: 'CODY',
    website: '',
    fileAttribute: 'CODY',
    searchableSubDivXName: 'H265-CODY',
    searchableOpenSubtitlesName: 'CODY',
    isSupported: true,
  },
  'GalaxyRG': {
    id: 49,
    created_at: '2024-01-08T01:10:30.160003+00:00',
    name: 'GalaxyRG',
    website: '',
    fileAttribute: 'GalaxyRG',
    searchableSubDivXName: 'GalaxyRG',
    searchableOpenSubtitlesName: 'GalaxyRG',
    isSupported: true,
  },
  'RiGHTNOW': {
    id: 50,
    created_at: '2024-01-08T01:10:30.232275+00:00',
    name: 'RiGHTNOW',
    website: '',
    fileAttribute: 'RiGHTNOW',
    searchableSubDivXName: 'RIGHTNOW',
    searchableOpenSubtitlesName: 'RiGHTNOW',
    isSupported: true,
  },
  'FLUX': {
    id: 51,
    created_at: '2024-01-08T01:10:30.311959+00:00',
    name: 'FLUX',
    website: '',
    fileAttribute: 'FLUX',
    searchableSubDivXName: 'FLUX',
    searchableOpenSubtitlesName: 'FLUX',
    isSupported: true,
  },
  'EDITH': {
    id: 52,
    created_at: '2024-01-08T01:10:30.390009+00:00',
    name: 'EDITH',
    website: '',
    fileAttribute: 'h264-EDITH',
    searchableSubDivXName: 'edith',
    searchableOpenSubtitlesName: 'EDITH',
    isSupported: true,
  },
  'HEVC-CMRG': {
    id: 53,
    created_at: '2024-01-08T01:10:30.471626+00:00',
    name: 'HEVC-CMRG',
    website: '',
    fileAttribute: 'HEVC-CMRG',
    searchableSubDivXName: 'cmrg',
    searchableOpenSubtitlesName: 'HEVC-CMRG',
    isSupported: true,
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

test('Indexer | should return a list of release groups', async () => {
  const releaseGroups = await getReleaseGroups(supabase)
  expect(releaseGroups).toEqual(RELEASE_GROUPS_MOCK)
})
