import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'

// internals
import { getMoviesFromMovieId } from './movies'
import { getSubtitleFromFileName } from './subtitle'
import { getSubtitlesFromMovieId } from './subtitles'

// core
export const app = new Elysia()
  .use(cors())
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

// types
export type App = typeof app
