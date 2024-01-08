import Elysia from 'elysia'
import { describe, expect, it } from 'bun:test'

// internals
import { runApi } from './app'

// constants
const api = runApi(true, 8080)

describe('API | runApi', () => {
  it('returns a Elysia instance', () => {
    expect(api).toBeInstanceOf(Elysia)
  })

  it('returns all defined routes', () => {
    const apiRoutes = api.routes.map(({ path, method }) => ({ path, method }))
    expect(apiRoutes).toEqual([
      {
        path: '/',
        method: 'OPTIONS',
      },
      {
        path: '/*',
        method: 'OPTIONS',
      },
      {
        path: '/v1/docs',
        method: 'GET',
      },
      {
        path: '/v1/docs/json',
        method: 'GET',
      },
      {
        path: '/v1/movies',
        method: 'POST',
      },
      {
        path: '/v1/download',
        method: 'POST',
      },
      {
        path: '/v1/subtitle',
        method: 'POST',
      },
      {
        path: '/v1/subtitles',
        method: 'POST',
      },
      {
        path: '/v1/trending',
        method: 'POST',
      },
    ])
  })
})
