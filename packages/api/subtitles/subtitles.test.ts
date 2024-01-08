import { afterAll, describe, expect, it } from 'bun:test'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

describe('API | /subtitles', () => {
  afterAll(() => app.stop())

  it('return a subtitles response for a specific movie', async () => {
    const movieId = '14998742'

    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        id: 1376,
        subtitleShortLink: 'https://tinyurl.com/yotkzhod',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/rebel-moon-part-one-a-child-of-fire-1080p-galaxyrg-subdivx.srt?download=Rebel.Moon.Part.One.A.Child.of.Fire.2023.1080p.NF.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt',
        resolution: '1080p',
        fileName: 'Rebel.Moon.Part.One.A.Child.of.Fire.2023.1080p.NF.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.mkv',
        Movies: {
          name: 'Rebel Moon - Part One: A Child of Fire',
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
        id: 1374,
        subtitleShortLink: 'https://tinyurl.com/yp8eg3mp',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/rebel-moon-part-one-a-child-of-fire-1080p-galaxyrg-subdivx.srt?download=Rebel.Moon.Part.One.A.Child.of.Fire.2023.1080p.NF.WEBRip.1600MB.DD5.1.x264-GalaxyRG.srt',
        resolution: '1080p',
        fileName: 'Rebel.Moon.Part.One.A.Child.of.Fire.2023.1080p.NF.WEBRip.1600MB.DD5.1.x264-GalaxyRG.mkv',
        Movies: {
          name: 'Rebel Moon - Part One: A Child of Fire',
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
        id: 1375,
        subtitleShortLink: 'https://tinyurl.com/ytydb3l3',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/rebel-moon-part-one-a-child-of-fire-720p-galaxyrg-subdivx.srt?download=Rebel.Moon.Part.One.A.Child.of.Fire.2023.720p.NF.WEBRip.900MB.x264-GalaxyRG.srt',
        resolution: '720p',
        fileName: 'Rebel.Moon.Part.One.A.Child.of.Fire.2023.720p.NF.WEBRip.900MB.x264-GalaxyRG.mkv',
        Movies: {
          name: 'Rebel Moon - Part One: A Child of Fire',
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
