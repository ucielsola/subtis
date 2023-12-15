import { Elysia, t } from 'elysia'
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
    .post('/v1/movies', ({ set, body }) => getMoviesFromMovieId({ set, body }), {
      body: t.Object({ movieName: t.String() }),
    })
    .post('/v1/subtitle', ({ set, body }) => getSubtitleFromFileName({ set, body }), {
      body: t.Object({ fileName: t.String() }),
    })
    .post('/v1/subtitles', ({ set, body }) => getSubtitlesFromMovieId({ set, body }), {
      body: t.Object({ movieId: t.String() }),
    })
    .listen(8080)
}

// types
export type App = ReturnType<typeof initializeElyisia>
