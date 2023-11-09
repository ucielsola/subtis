import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test'

import { getSupabaseEnvironmentVariables, supabase } from 'db'
import { getReleaseGroups } from '../release-groups'

// constants
const { supabaseBaseUrl } = getSupabaseEnvironmentVariables()

// mocks
const RELEASE_GROUPS_MOCK = {
  'CODY': {
    id: 30,
    website: '',
    name: 'CODY',
    fileAttribute: 'CODY',
    searchableArgenteamName: 'CODY',
    searchableSubDivXName: 'H265-CODY',
    searchableOpenSubtitlesName: 'CODY',
    created_at: '2023-09-18T02:01:56.800708+00:00',
  },
  'GalaxyRG': {
    id: 31,
    website: '',
    name: 'GalaxyRG',
    fileAttribute: 'GalaxyRG',
    searchableSubDivXName: 'GalaxyRG',
    searchableArgenteamName: 'GalaxyRG',
    searchableOpenSubtitlesName: 'GalaxyRG',
    created_at: '2023-09-18T02:01:56.987645+00:00',
  },
  'RiGHTNOW': {
    id: 32,
    name: 'RiGHTNOW',
    website: '',
    fileAttribute: 'RiGHTNOW',
    searchableSubDivXName: 'RIGHTNOW',
    searchableArgenteamName: 'RiGHTNOW',
    searchableOpenSubtitlesName: 'RiGHTNOW',
    created_at: '2023-09-18T02:01:57.174522+00:00',
  },
  'YTS-MX': {
    id: 29,
    name: 'YTS-MX',
    fileAttribute: 'YTS.MX',
    website: 'https://yts.mx',
    searchableArgenteamName: 'YIFY',
    searchableSubDivXName: 'YTS MX',
    searchableOpenSubtitlesName: 'YTS.MX',
    created_at: '2023-09-18T02:01:56.644634+00:00',
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
