import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { helmet } from 'elysia-helmet'
import { swagger } from '@elysiajs/swagger'
import { rateLimit } from 'elysia-rate-limit'

// api
import { getMoviesFromMovieId, getSubtitleFromFileName, getSubtitlesFromMovieId } from '@subtis/api'

// core
export function initializeElyisia() {
  return new Elysia()
    .use(cors())
    .use(helmet())
    .use(rateLimit())
    .use(swagger({ path: '/v1/docs' }))
    .post('/v1/movies', getMoviesFromMovieId)
    .post('/v1/subtitle', getSubtitleFromFileName)
    .post('/v1/subtitles', getSubtitlesFromMovieId)
    .listen(8080)
}

// types
export type App = ReturnType<typeof initializeElyisia>
