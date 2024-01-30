import { afterAll, describe, expect, it } from 'bun:test'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

describe('API | /trending', () => {
  afterAll(() => app.stop())

  it('return the last two trending subtitles', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/trending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 2 }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        id: 1391,
        subtitleShortLink: 'https://tinyurl.com/ykzfmnhu',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/napoleon-2160p-object-object-subdivx.srt?download=Napoleon.2023.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.srt',
        resolution: '2160p',
        fileName: 'Napoleon.2023.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.mkv',
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
      },
      {
        id: 1380,
        subtitleShortLink: 'https://tinyurl.com/yto5xcgr',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/silent-night-1080p-galaxyrg-subdivx.srt?download=Silent.Night.2023.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt',
        resolution: '1080p',
        fileName: 'Silent.Night.2023.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv',
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
      },
    ])
  })

  it('return a response for an 400 error for a bad payload', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/trending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lim: '123' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toMatchObject({
      type: 'body',
      at: 'limit',
      message: 'Required property',
      expected: {
        limit: 0,
      },
    },
    )
  })
})
