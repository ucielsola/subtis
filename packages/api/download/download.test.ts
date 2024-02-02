import { afterAll, beforeEach, describe, expect, it, spyOn } from 'bun:test'

// db
import { supabase } from '@subtis/db'

// internals
import { runApi } from '../app'

// constants
const app = runApi()

// mocks
const supabaseSpy = spyOn(supabase, 'rpc')

describe('API | /download', () => {
  afterAll(() => app.stop())

  beforeEach(() => {
    supabaseSpy.mockClear()
  })

  it('return a ok response for a specific movie', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/download`, {
      body: JSON.stringify({ fileName: 'Killers.Of.The.Flower.Moon.2023.1080p.WEBRip.1600MB.DD5.1.x264-GalaxyRG.mkv' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(supabaseSpy).toHaveBeenCalled()
    expect(data).toEqual({ ok: true })
  })

  it('return a response for an 415 error for non supported file extensions', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitle`, {
      body: JSON.stringify({ fileName: 'Killers.Of.The.Flower.Moon.2023.1080p.WEBRip.1600MB.DD5.1.x264-GalaxyRG.mp3' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(supabaseSpy).not.toHaveBeenCalled()
    expect(response.status).toBe(415)
    expect(data).toEqual({
      message: 'File extension not supported',
    })
  })

  it('return a response for an 400 error for a bad payload', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/download`, {
      body: JSON.stringify({ file: '123' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(supabaseSpy).not.toHaveBeenCalled()
    expect(response.status).toBe(400)
    expect(data).toMatchObject({
      at: 'fileName',
      expected: {
        fileName: '',
      },
      message: 'Required property',
      type: 'body',
    },
    )
  })
})
