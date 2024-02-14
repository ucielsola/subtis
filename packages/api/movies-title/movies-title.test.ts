import { afterAll, describe, expect, it } from 'bun:test'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

describe('API | /movies/title', () => {
  afterAll(() => app.stop())

  it('return a movies response for a movie name query', async () => {
    const request = new Request(`${Bun.env['PUBLIC_API_BASE_URL_DEVELOPMENT']}/v1/movies/title`, {
      body: JSON.stringify({ movieTitle: 'Wonka' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        id: 6166392,
        name: 'Wonka',
        year: 2023,
      },
    ])
  })

  it('return a movies response for a movie name query with fuzzy search', async () => {
    const request = new Request(`${Bun.env['PUBLIC_API_BASE_URL_DEVELOPMENT']}/v1/movies/title`, {
      body: JSON.stringify({ movieTitle: 'nka' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        id: 6166392,
        name: 'Wonka',
        year: 2023,
      },
    ])
  })

  it('return a movies response for a movie name query with lowercase', async () => {
    const request = new Request(`${Bun.env['PUBLIC_API_BASE_URL_DEVELOPMENT']}/v1/movies/title`, {
      body: JSON.stringify({ movieTitle: 'wonka' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        id: 6166392,
        name: 'Wonka',
        year: 2023,
      },
    ])
  })

  it('return a response for an 404 error for a non existant movie name', async () => {
    const request = new Request(`${Bun.env['PUBLIC_API_BASE_URL_DEVELOPMENT']}/v1/movies/title`, {
      body: JSON.stringify({ movieTitle: 'zxsa' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({
      message: 'Movies not found for query zxsa',
    })
  })

  it('return a response for an 400 error for a bad payload', async () => {
    const request = new Request(`${Bun.env['PUBLIC_API_BASE_URL_DEVELOPMENT']}/v1/movies/title`, {
      body: JSON.stringify({ movie: 'zxsa' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toMatchObject({
      at: 'movieTitle',
      expected: {
        movieTitle: '',
      },
      message: 'Required property',
      type: 'body',
    })
  })
})
