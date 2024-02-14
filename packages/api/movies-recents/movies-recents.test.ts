import { afterAll, describe, expect, it } from 'bun:test'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

describe('API | /movies/recent', () => {
  afterAll(() => app.stop())

  it('return the last two trending subtitles', async () => {
    const request = new Request(`${Bun.env['PUBLIC_API_BASE_URL_DEVELOPMENT']}/v1/movies/recent`, {
      body: JSON.stringify({ limit: 2 }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        id: 29722855,
        name: 'Badland Hunters',
        rating: 6.735,
        release_date: '2024-01-26',
        year: 2024,
      },
      {
        id: 9663764,
        name: 'Aquaman and the Lost Kingdom',
        rating: 6.906,
        release_date: '2023-12-20',
        year: 2023,
      },
    ])
  })

  it('return a response for an 400 error for a bad payload', async () => {
    const request = new Request(`${Bun.env['PUBLIC_API_BASE_URL_DEVELOPMENT']}/v1/subtitles/trending`, {
      body: JSON.stringify({ lim: '123' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toMatchObject({
      at: 'limit',
      expected: {
        limit: 0,
      },
      message: 'Required property',
      type: 'body',
    },
    )
  })
})
