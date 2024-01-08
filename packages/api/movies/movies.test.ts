import { afterAll, describe, expect, it } from 'bun:test'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

describe('API | /movies', () => {
  afterAll(() => app.stop())

  it('return a movies response for a movie name query', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieName: 'Rebel' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        id: 14998742,
        name: 'Rebel Moon - Part One: A Child of Fire',
        year: 2023,
      },
    ])
  })

  it('return a movies response for a movie name query with fuzzy search', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieName: 'one' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        id: 14998742,
        name: 'Rebel Moon - Part One: A Child of Fire',
        year: 2023,
      },
    ])
  })

  it('return a movies response for a movie name query with lowercase', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieName: 'rebel' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        id: 14998742,
        name: 'Rebel Moon - Part One: A Child of Fire',
        year: 2023,
      },
    ])
  })

  it('return a response for an 404 error for a non existant movie name', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieName: 'zxsa' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({
      message: 'Movies not found for query zxsa',
    })
  })

  it('return a response for an 400 error for a bad payload', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movie: 'zxsa' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toMatchObject({
      type: 'body',
      at: 'movieName',
      message: 'Required property',
      expected: {
        movieName: '',
      },
    })
  })
})
