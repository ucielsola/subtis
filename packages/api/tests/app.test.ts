import { describe, expect, it } from 'bun:test'

// internals
import { app } from '../app'

describe('API | /subtitles', () => {
  it('return a response for an existant subtitle', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual({
      id: 1095,
      subtitleShortLink: 'https://tinyurl.com/yszmsjua',
      subtitleFullLink:
        'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/the-equalizer-3-1080p-yts-mx-subdivx.srt?download=The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt',
      resolution: '1080p',
      fileName: 'The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4',
      Movies: {
        name: 'The Equalizer 3',
        year: 2023,
      },
      ReleaseGroups: {
        name: 'YTS-MX',
      },
      SubtitleGroups: {
        name: 'SubDivX',
      },
    })
  })

  it('return a response for an 415 error for non supported file extensions', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles`, {
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
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'The.Matrix.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({
      message: 'Subtitles not found for file',
    })
  })
})

describe('API | /swagger', () => {
  it('return a response with a Swagger documentation', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/swagger`, {
      method: 'GET',
    })

    const response = await app.handle(request)
    const data = await response.text()

    expect(data).toBeTypeOf('string')
  })
})

describe('API | /swagger/json', () => {
  it('return a response with a OpenAPI schema', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/swagger/json`, {
      method: 'GET',
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual({
      openapi: '3.0.3',
      info: {
        title: 'Elysia Documentation',
        description: 'Development documentation',
        version: '0.0.0',
      },
      paths: {
        '/': {
          options: {
            operationId: 'optionsIndex',
            responses: {
              200: {},
            },
          },
        },
        '/subtitles': {
          post: {
            parameters: [],
            operationId: 'postSubtitles',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      fileName: {
                        type: 'string',
                      },
                    },
                    required: ['fileName'],
                    additionalProperties: false,
                  },
                },
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    properties: {
                      fileName: {
                        type: 'string',
                      },
                    },
                    required: ['fileName'],
                    additionalProperties: false,
                  },
                },
                'text/plain': {
                  schema: {
                    type: 'object',
                    properties: {
                      fileName: {
                        type: 'string',
                      },
                    },
                    required: ['fileName'],
                    additionalProperties: false,
                  },
                },
              },
            },
            responses: {
              200: {},
            },
          },
        },
      },
      components: {
        schemas: {},
      },
    })
  })
})
