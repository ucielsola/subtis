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
    const apiRoutes = api.routes.map(({ method, path }) => ({ method, path }))
    expect(apiRoutes).toEqual([
      {
        method: 'OPTIONS',
        path: '/',
      },
      {
        method: 'OPTIONS',
        path: '/*',
      },
      {
        method: 'GET',
        path: '/v1/docs',
      },
      {
        method: 'GET',
        path: '/v1/docs/json',
      },
      {
        method: 'POST',
        path: '/v1/subtitles/movie',
      },
      {
        method: 'POST',
        path: '/v1/subtitles/trending',
      },
      {
        method: 'POST',
        path: '/v1/subtitles/file',
      },
      {
        method: 'POST',
        path: '/v1/movies/title',
      },
      {
        method: 'POST',
        path: '/v1/movies/recent',
      },
      {
        method: 'POST',
        path: '/v1/metrics/download',
      },
    ])
  })
})
