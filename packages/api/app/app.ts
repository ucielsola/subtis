import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { helmet } from 'elysia-helmet'
import { swagger } from '@elysiajs/swagger'
import { rateLimit } from 'elysia-rate-limit'

// api
import { getMoviesFromMovieId, getSubtitleFromFileName, getSubtitlesFromMovieId } from '@subtis/api'

// core
export function runElyisia() {
  return new Elysia()
    .use(cors())
    .use(helmet())
    .use(swagger({ path: '/v1/docs' }))
    .use(rateLimit({ skip: () => Bun.env.NODE_ENV !== 'production' }))
    .post('/v1/movies', getMoviesFromMovieId, { body: t.Object({ movieName: t.String() }) })
    .post('/v1/subtitle', getSubtitleFromFileName, { body: t.Object({ fileName: t.String() }) })
    .post('/v1/subtitles', getSubtitlesFromMovieId, { body: t.Object({ movieId: t.String() }) })
    .listen(8080)
}

// types
export type App = ReturnType<typeof runElyisia>
