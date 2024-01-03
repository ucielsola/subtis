import { afterAll, describe, expect, it } from 'bun:test'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

describe('API | /trending', () => {
  afterAll(() => app.stop())

  it('return the last 4 trending subtitles', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/trending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 4 }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
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
      {
        id: 1368,
        subtitleShortLink: 'https://tinyurl.com/ywd8hqs5',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/the-hunger-games-the-ballad-of-songbirds-and-snakes-720p-galaxyrg-subdivx.srt?download=The.Hunger.Games.The.Ballad.of.Songbirds.and.Snakes.2023.720p.AMZN.WEBRip.900MB.x264-GalaxyRG.srt',
        resolution: '720p',
        fileName: 'The.Hunger.Games.The.Ballad.of.Songbirds.and.Snakes.2023.720p.AMZN.WEBRip.900MB.x264-GalaxyRG.mkv',
        Movies: {
          name: 'The Hunger Games: The Ballad of Songbirds & Snakes',
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
        id: 1369,
        subtitleShortLink: 'https://tinyurl.com/ynjqvdrm',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/chicken-run-dawn-of-the-nugget-1080p-galaxyrg-subdivx.srt?download=Chicken.Run.Dawn.of.the.Nugget.2023.1080p.NF.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt',
        resolution: '1080p',
        fileName: 'Chicken.Run.Dawn.of.the.Nugget.2023.1080p.NF.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv',
        Movies: {
          name: 'Chicken Run: Dawn of the Nugget',
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
        id: 1371,
        subtitleShortLink: 'https://tinyurl.com/ykz2f9tk',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/the-family-plan-1080p-galaxyrg-subdivx.srt?download=The.Family.Plan.2023.1080p.ATVP.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt',
        resolution: '1080p',
        fileName: 'The.Family.Plan.2023.1080p.ATVP.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv',
        Movies: {
          name: 'The Family Plan',
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
