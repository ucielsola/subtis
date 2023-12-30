import { afterAll, describe, expect, it } from 'bun:test'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

describe('API | /subtitle', () => {
  afterAll(() => app.stop())

  it('return a response for an existant subtitle', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'Killers.Of.The.Flower.Moon.2023.1080p.WEBRip.1600MB.DD5.1.x264-GalaxyRG.mkv' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual({
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
    })
  })

  it('return a response for an 415 error for non supported file extensions', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(415)
    expect(data).toEqual({
      message: 'File extension not supported',
    })
  })

  it('return a response for an 404 error for a non existant subtitle', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'The.Matrix.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({
      message: 'Subtitle not found for file',
    })
  })

  it('return a response for an 400 error for a bad payload', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: 'the' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toMatchObject({
      type: 'body',
      at: 'fileName',
      message: 'Required property',
      expected: {
        fileName: '',
      },
    })
  })
})
