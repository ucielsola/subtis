import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test'

// db
import { getSupabaseEnvironmentVariables } from '@subtis/db'

// constants
const { supabaseBaseUrl } = getSupabaseEnvironmentVariables()

const server = setupServer(
  rest.all(`${supabaseBaseUrl}/rest/v1/SubtitleGroups`, async (req, res, ctx) => {
    switch (req.method) {
      case 'POST':
        return res(ctx.json({}))
      default:
        return res(ctx.json('Unhandled method'))
    }
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('should return a list of release groups', async () => {
  // const subtitleGrous = await saveSubtitleGroupsToDb(supabase);

  // TODO: Wait for https://github.com/mswjs/msw/issues/1718 to be merged
  expect(undefined).toBe(undefined)
})
