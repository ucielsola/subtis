import { afterAll, describe, expect, it } from 'bun:test'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

describe('API | /subtitles/movie', () => {
  afterAll(() => app.stop())

  it('return a subtitles response for a specific movie', async () => {
    const movieId = '6166392'

    const request = new Request(`${Bun.env['PUBLIC_API_BASE_URL_DEVELOPMENT']}/v1/subtitles/movie`, {
      body: JSON.stringify({ movieId }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        Movies: {
          name: 'Wonka',
          year: 2023,
        },
        ReleaseGroups: {
          name: 'GalaxyRG',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
        fileName: 'Wonka.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv',
        id: 1519,
        resolution: '1080p',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/wonka-1080p-galaxyrg-subdivx.srt?download=Wonka.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt',
        subtitleShortLink: 'https://tinyurl.com/yp6zuhc5',
      },
      {
        Movies: {
          name: 'Wonka',
          year: 2023,
        },
        ReleaseGroups: {
          name: 'GalaxyRG',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
        fileName: 'Wonka.2023.720p.WEBRip.800MB.x264-GalaxyRG.mkv',
        id: 1520,
        resolution: '720p',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/wonka-720p-galaxyrg-subdivx.srt?download=Wonka.2023.720p.WEBRip.800MB.x264-GalaxyRG.srt',
        subtitleShortLink: 'https://tinyurl.com/ywepv8cn',
      },
      {
        Movies: {
          name: 'Wonka',
          year: 2023,
        },
        ReleaseGroups: {
          name: 'FLUX',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
        fileName: 'Wonka.2023.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.mkv',
        id: 1521,
        resolution: '2160p',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/wonka-2160p-flux-subdivx.srt?download=Wonka.2023.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.srt',
        subtitleShortLink: 'https://tinyurl.com/ylj2estx',
      },
      {
        Movies: {
          name: 'Wonka',
          year: 2023,
        },
        ReleaseGroups: {
          name: 'GalaxyRG',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
        fileName: 'Wonka.2023.1080p.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.mkv',
        id: 1522,
        resolution: '1080p',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/wonka-1080p-galaxyrg-subdivx.srt?download=Wonka.2023.1080p.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt',
        subtitleShortLink: 'https://tinyurl.com/2ctrz95c',
      },
      {
        Movies: {
          name: 'Wonka',
          year: 2023,
        },
        ReleaseGroups: {
          name: 'YTS-MX',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
        fileName: 'Wonka.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4',
        id: 1518,
        resolution: '1080p',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/wonka-1080p-yts-mx-subdivx.srt?download=Wonka.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt',
        subtitleShortLink: 'https://tinyurl.com/2x7w48uv',
      },
    ])
  })

  it('return a response for an 404 error for a non existant movie id', async () => {
    const request = new Request(`${Bun.env['PUBLIC_API_BASE_URL_DEVELOPMENT']}/v1/subtitles/movie`, {
      body: JSON.stringify({ movieId: '17913a50' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({
      message: 'Subtitles not found for movie',
    })
  })

  it('return a response for an 400 error for a bad payload', async () => {
    const request = new Request(`${Bun.env['PUBLIC_API_BASE_URL_DEVELOPMENT']}/v1/subtitles/movie`, {
      body: JSON.stringify({ movie: '123' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toMatchObject({
      at: 'movieId',
      expected: {
        movieId: '',
      },
      message: 'Required property',
      type: 'body',
    },
    )
  })
})
