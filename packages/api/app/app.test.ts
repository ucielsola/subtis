import { describe, expect, it } from 'bun:test'

// internals
import { app } from './app'

describe('API | /movies', () => {
  it('return a movies response for a movie name query', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieName: 'Trolls Band' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        year: 2023,
        id: 14362112,
        name: 'Trolls Band Together',
      },
    ])
  })

  it('return a movies response for a movie name query with lowercase', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieName: 'trolls band' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        year: 2023,
        id: 14362112,
        name: 'Trolls Band Together',
      },
    ])
  })

  it('return a response for an 404 error for a non existant movie name', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieName: 'zxsa' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({
      message: 'Movies not found for query zxsa',
    })
  })
})

describe('API | /subtitles', () => {
  it('return a subtitles response for a specific movie', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId: '14362112' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual([
      {
        id: 1317,
        subtitleShortLink: 'https://tinyurl.com/2x465tvl',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/trolls-band-together-1080p-galaxyrg-subdivx.srt?download=Trolls.Band.Together.2023.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt',
        resolution: '1080p',
        fileName: 'Trolls.Band.Together.2023.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv',
        Movies: {
          name: 'Trolls Band Together',
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
        id: 1318,
        subtitleShortLink: 'https://tinyurl.com/ypnd83vq',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/trolls-band-together-720p-galaxyrg-subdivx.srt?download=Trolls.Band.Together.2023.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt',
        resolution: '720p',
        fileName: 'Trolls.Band.Together.2023.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.mkv',
        Movies: {
          name: 'Trolls Band Together',
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
        id: 1319,
        subtitleShortLink: 'https://tinyurl.com/yotb75f6',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/trolls-band-together-1080p-flux-subdivx.srt?download=Trolls.Band.Together.2023.1080p.AMZN.WEB-DL.DDP5.1.Atmos.H.264-FLUX.srt',
        resolution: '1080p',
        fileName: 'Trolls.Band.Together.2023.1080p.AMZN.WEB-DL.DDP5.1.Atmos.H.264-FLUX.mkv',
        Movies: {
          name: 'Trolls Band Together',
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
        id: 1320,
        subtitleShortLink: 'https://tinyurl.com/ys7jr3kp',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/trolls-band-together-2160p-flux-subdivx.srt?download=Trolls.Band.Together.2023.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.srt',
        resolution: '2160p',
        fileName: 'Trolls.Band.Together.2023.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.mkv',
        Movies: {
          name: 'Trolls Band Together',
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
        id: 1321,
        subtitleShortLink: 'https://tinyurl.com/ylxyxlnv',
        subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/trolls-band-together-1080p-galaxyrg-subdivx.srt?download=Trolls.Band.Together.2023.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt',
        resolution: '1080p',
        fileName: 'Trolls.Band.Together.2023.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.mkv',
        Movies: {
          name: 'Trolls Band Together',
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
})

describe('API | /subtitle', () => {
  it('return a response for an existant subtitle', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'Trolls.Band.Together.2023.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv' }),
    })

    const response = await app.handle(request)
    const data = await response.json()

    expect(data).toEqual({
      id: 1317,
      subtitleShortLink: 'https://tinyurl.com/2x465tvl',
      subtitleFullLink: 'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/trolls-band-together-1080p-galaxyrg-subdivx.srt?download=Trolls.Band.Together.2023.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt',
      resolution: '1080p',
      fileName: 'Trolls.Band.Together.2023.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv',
      Movies: {
        name: 'Trolls Band Together',
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
})

describe('API | /v1/docs', () => {
  it('return a response with a Swagger documentation', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/swagger`, {
      method: 'GET',
    })

    const response = await app.handle(request)
    const data = await response.text()

    expect(data).toBeTypeOf('string')
  })
})

describe('API | /v1/docs/json', () => {
  it('return a response with a OpenAPI schema', async () => {
    const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/docs/json`, {
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
        '/v1/docs': {
          get: {
            operationId: 'getV1Docs',
            responses: {
              200: {},
            },
          },
        },
        '/v1/docs/json': {
          get: {
            operationId: 'getV1DocsJson',
            responses: {
              200: {},
            },
          },
        },
        '/v1/movies': {
          post: {
            parameters: [],
            operationId: 'postV1Movies',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      movieName: {
                        type: 'string',
                      },
                    },
                    required: [
                      'movieName',
                    ],
                    additionalProperties: false,
                  },
                },
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    properties: {
                      movieName: {
                        type: 'string',
                      },
                    },
                    required: [
                      'movieName',
                    ],
                    additionalProperties: false,
                  },
                },
                'text/plain': {
                  schema: {
                    type: 'object',
                    properties: {
                      movieName: {
                        type: 'string',
                      },
                    },
                    required: [
                      'movieName',
                    ],
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
        '/v1/subtitle': {
          post: {
            parameters: [],
            operationId: 'postV1Subtitle',
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
                    required: [
                      'fileName',
                    ],
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
                    required: [
                      'fileName',
                    ],
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
                    required: [
                      'fileName',
                    ],
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
        '/v1/subtitles': {
          post: {
            parameters: [],
            operationId: 'postV1Subtitles',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      movieId: {
                        type: 'string',
                      },
                    },
                    required: [
                      'movieId',
                    ],
                    additionalProperties: false,
                  },
                },
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    properties: {
                      movieId: {
                        type: 'string',
                      },
                    },
                    required: [
                      'movieId',
                    ],
                    additionalProperties: false,
                  },
                },
                'text/plain': {
                  schema: {
                    type: 'object',
                    properties: {
                      movieId: {
                        type: 'string',
                      },
                    },
                    required: [
                      'movieId',
                    ],
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
