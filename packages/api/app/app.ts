import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { helmet } from 'elysia-helmet'
import { swagger } from '@elysiajs/swagger'
import { rateLimit } from 'elysia-rate-limit'

// internals
import { getMoviesFromMovieId, getSubtitleFromFileName, getSubtitlesFromMovieId, getTrendingSubtitles, listener } from '../index'

// core
export function runApi(displayListenLog: boolean = false, port: number = 8080) {
  return new Elysia()
    .use(cors())
    .use(helmet())
    .use(swagger({ path: '/v1/docs' }))
    .use(rateLimit({ skip: () => Bun.env.NODE_ENV !== 'production' }))
    .post('/v1/movies', getMoviesFromMovieId, { body: t.Object({ movieName: t.String() }) })
    .post('/v1/subtitle', getSubtitleFromFileName, { body: t.Object({ fileName: t.String() }) })
    .post('/v1/subtitles', getSubtitlesFromMovieId, { body: t.Object({ movieId: t.String() }) })
    .post('/v1/trending', getTrendingSubtitles, { body: t.Object({ limit: t.Number({ min: 1 }) }) })
    .listen(port, context => listener(context, displayListenLog))
}

// types
export type App = ReturnType<typeof runApi>
