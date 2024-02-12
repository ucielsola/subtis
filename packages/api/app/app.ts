import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { helmet } from 'elysia-helmet'
import { swagger } from '@elysiajs/swagger'
import { rateLimit } from 'elysia-rate-limit'

// internals
import {
  getDownloadFromFileName,
  getMoviesFromMovieTitle,
  getRecentSubtitles,
  getSubtitleFromFileName,
  getSubtitlesFromMovieId,
  getTrendingSubtitles,
  listener,
} from '../index'

// core
export function runApi(displayListenLog: boolean = false, port: number = 8080) {
  return new Elysia()
    .use(cors())
    .use(helmet())
    .use(swagger({ path: '/v1/docs' }))
    .use(rateLimit({ skip: () => Bun.env['NODE_ENV'] !== 'production' }))
    .group('/v1/subtitles', (app) => {
      return app
        .post('/movie', getSubtitlesFromMovieId, { body: t.Object({ movieId: t.String() }) })
        .post('/recents', getRecentSubtitles, { body: t.Object({ limit: t.Number({ min: 1 }) }) })
        .post('/trending', getTrendingSubtitles, { body: t.Object({ limit: t.Number({ min: 1 }) }) })
        .post('/file', getSubtitleFromFileName, { body: t.Object({ bytes: t.String(), fileName: t.String() }) })
    })
    .group('/v1/metrics', (app) => {
      return app
        .post('/download', getDownloadFromFileName, { body: t.Object({ fileName: t.String() }) })
    })
    .post('/v1/movies', getMoviesFromMovieTitle, { body: t.Object({ movieTitle: t.String() }) })
    .listen(port, context => listener(context, displayListenLog))
}

// types
export type App = ReturnType<typeof runApi>
