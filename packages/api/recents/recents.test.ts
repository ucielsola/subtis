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
          name: 'Rebel Moon - Part One: A Child of Fire',
          year: 2023,
        },
        ReleaseGroups: {
          name: 'GalaxyRG',
        },
        SubtitleGroups: {
          name: 'SubDivX',
        },
        fileName: 'Rebel.Moon.Part.One.A.Child.of.Fire.2023.1080p.NF.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.mkv',
        id: 1513,
        resolution: '1080p',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/rebel-moon-part-one-a-child-of-fire-1080p-galaxyrg-subdivx.srt?download=Rebel.Moon.Part.One.A.Child.of.Fire.2023.1080p.NF.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt',
        subtitleShortLink: 'https://tinyurl.com/yotkzhod',
      },
      {
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
        fileName: 'Rebel.Moon.Part.One.A.Child.of.Fire.2023.720p.NF.WEBRip.900MB.x264-GalaxyRG.mkv',
        id: 1512,
        resolution: '720p',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/rebel-moon-part-one-a-child-of-fire-720p-galaxyrg-subdivx.srt?download=Rebel.Moon.Part.One.A.Child.of.Fire.2023.720p.NF.WEBRip.900MB.x264-GalaxyRG.srt',
        subtitleShortLink: 'https://tinyurl.com/ytydb3l3',
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
