import { afterAll, describe, expect, it } from 'bun:test'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

describe('API | /subtitles', () => {
  afterAll(() => app.stop())

  it('return a subtitles response for a specific movie', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId: '5537002' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        id: 1366,
        subtitleShortLink: 'https://tinyurl.com/ymaah64s',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/killers-of-the-flower-moon-720p-galaxyrg-subdivx.srt?download=Killers.Of.The.Flower.Moon.2023.720p.WEBRip.900MB.x264-GalaxyRG.srt',
        resolution: '720p',
        fileName: 'Killers.Of.The.Flower.Moon.2023.720p.WEBRip.900MB.x264-GalaxyRG.mkv',
        Movies: {
          name: 'Killers of the Flower Moon',
          year: 2023,
        },
        ReleaseGroups: {
          name: 'GalaxyRG',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
      },
      {
        id: 1364,
        subtitleShortLink: 'https://tinyurl.com/yuo4llr2',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/killers-of-the-flower-moon-1080p-galaxyrg-subdivx.srt?download=Killers.Of.The.Flower.Moon.2023.1080p.WEBRip.1600MB.DD5.1.x264-GalaxyRG.srt',
        resolution: '1080p',
        fileName: 'Killers.Of.The.Flower.Moon.2023.1080p.WEBRip.1600MB.DD5.1.x264-GalaxyRG.mkv',
        Movies: {
          name: 'Killers of the Flower Moon',
          year: 2023,
        },
        ReleaseGroups: {
          name: 'GalaxyRG',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
      },
    ])
  })

  it('return a response for an 404 error for a non existant movie id', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId: '17913a50' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({
      message: 'Subtitles not found for movie',
    })
  })

  it('return a response for an 400 error for a bad payload', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movie: '123' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toMatchObject({
      type: 'body',
      at: 'movieId',
      message: 'Required property',
      expected: {
        movieId: '',
      },
    },
    )
  })
})
