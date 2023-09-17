import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { expect, test, afterEach, beforeAll, afterAll } from 'bun:test';

import { getReleaseGroups } from '../release-groups';
import { getSupabaseEnvironmentVariables, supabase } from 'db';

// constants
const { supabaseBaseUrl } = getSupabaseEnvironmentVariables();

// mocks
const RELEASE_GROUPS_MOCK = {
  'YTS-MX': {
    id: 25,
    created_at: '2023-08-12T05:34:40.596247+00:00',
    name: 'YTS-MX',
    website: 'https://yts.mx',
    fileAttribute: 'YTS.MX',
    searchableSubDivXName: 'YTS MX',
    searchableArgenteamName: 'YIFY',
    searchableOpenSubtitlesName: 'YTS.MX',
  },
  CODY: {
    id: 26,
    created_at: '2023-08-12T05:34:40.831697+00:00',
    name: 'CODY',
    website: '',
    fileAttribute: 'CODY',
    searchableSubDivXName: 'H265-CODY',
    searchableArgenteamName: 'CODY',
    searchableOpenSubtitlesName: 'CODY',
  },
  GalaxyRG: {
    id: 27,
    created_at: '2023-08-12T05:34:40.925356+00:00',
    name: 'GalaxyRG',
    website: '',
    fileAttribute: 'GalaxyRG',
    searchableSubDivXName: 'GalaxyRG',
    searchableArgenteamName: 'GalaxyRG',
    searchableOpenSubtitlesName: 'GalaxyRG',
  },
  RiGHTNOW: {
    id: 28,
    created_at: '2023-08-12T05:34:41.020789+00:00',
    name: 'RiGHTNOW',
    website: '',
    fileAttribute: 'RiGHTNOW',
    searchableSubDivXName: 'RIGHTNOW',
    searchableArgenteamName: 'RiGHTNOW',
    searchableOpenSubtitlesName: 'RiGHTNOW',
  },
};

const server = setupServer(
  rest.all(`${supabaseBaseUrl}/rest/v1/ReleaseGroups`, async (req, res, ctx) => {
    switch (req.method) {
      case 'GET':
        return res(ctx.json(RELEASE_GROUPS_MOCK));
      default:
        return res(ctx.json('Unhandled method'));
    }
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('should return a list of release groups', async () => {
  const releaseGroups = await getReleaseGroups(supabase);
  expect(releaseGroups).toEqual(RELEASE_GROUPS_MOCK);
});
