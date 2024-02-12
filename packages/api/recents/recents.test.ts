import { afterAll, describe, expect, it } from 'bun:test'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

describe('API | /subtitles/recents', () => {
  afterAll(() => app.stop())

  it('return the last two trending subtitles', async () => {
    const request = new Request(`${Bun.env['PUBLIC_API_BASE_URL_DEVELOPMENT']}/v1/subtitles/recents`, {
      body: JSON.stringify({ limit: 2 }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        Movies: {
          name: 'Sixty Minutes',
          year: 2024,
        },
        ReleaseGroups: {
          name: 'EDITH',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
        fileName: 'Sixty.Minutes.2024.1080p.WEB.h264-EDITH.mkv',
        id: 1485,
        resolution: '1080p',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/sixty-minutes-1080p-edith-subdivx.srt?download=Sixty.Minutes.2024.1080p.WEB.h264-EDITH.srt',
        subtitleShortLink: 'https://tinyurl.com/yvn4rduh',
      },
      {
        Movies: {
          name: 'Badland Hunters',
          year: 2024,
        },
        ReleaseGroups: {
          name: 'GalaxyRG',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
        fileName: 'Badland.Hunters.2024.KOREAN.1080p.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.mkv',
        id: 1484,
        resolution: '1080p',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/badland-hunters-1080p-galaxyrg-subdivx.srt?download=Badland.Hunters.2024.KOREAN.1080p.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt',
        subtitleShortLink: 'https://tinyurl.com/ywmxdczg',
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
