import { afterAll, describe, expect, it } from 'bun:test'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

describe('API | /trending', () => {
  afterAll(() => app.stop())

  it('return the last two trending subtitles', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/trending`, {
      body: JSON.stringify({ limit: 2 }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        Movies: {
          name: 'Napoleon',
          year: 2023,
        },
        ReleaseGroups: {
          name: 'FLUX',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
        fileName: 'Napoleon.2023.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.mkv',
        id: 1391,
        resolution: '2160p',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/napoleon-2160p-object-object-subdivx.srt?download=Napoleon.2023.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.srt',
        subtitleShortLink: 'https://tinyurl.com/ykzfmnhu',
      },
      {
        Movies: {
          name: 'Silent Night',
          year: 2023,
        },
        ReleaseGroups: {
          name: 'GalaxyRG',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
        fileName: 'Silent.Night.2023.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv',
        id: 1380,
        resolution: '1080p',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/silent-night-1080p-galaxyrg-subdivx.srt?download=Silent.Night.2023.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt',
        subtitleShortLink: 'https://tinyurl.com/yto5xcgr',
      },
    ])
  })

  it('return a response for an 400 error for a bad payload', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/trending`, {
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
