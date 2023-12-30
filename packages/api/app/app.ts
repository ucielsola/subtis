import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { helmet } from 'elysia-helmet'
import { swagger } from '@elysiajs/swagger'
import { rateLimit } from 'elysia-rate-limit'

// internals
import { getMoviesFromMovieId, getSubtitleFromFileName, getSubtitlesFromMovieId, getTrendingSubtitles } from '../index'

// core
export function runApi(shouldDisplayInitialLog: boolean = false, port: number = 8080) {
  return new Elysia()
    .use(cors())
    .use(helmet())
    .use(swagger({ path: '/v1/docs' }))
    .use(rateLimit({ skip: () => Bun.env.NODE_ENV !== 'production' }))
    .get('/v1/trending', getTrendingSubtitles)
    .post('/v1/movies', getMoviesFromMovieId, { body: t.Object({ movieName: t.String() }) })
    .post('/v1/subtitle', getSubtitleFromFileName, { body: t.Object({ fileName: t.String() }) })
    .post('/v1/subtitles', getSubtitlesFromMovieId, { body: t.Object({ movieId: t.String() }) })
    .listen(port, (context) => {
      if (shouldDisplayInitialLog) {
        const { development, hostname, port } = context
        // eslint-disable-next-line no-console
        console.log(`\n🟢 Subtis API is running at http${development ? '' : 's'}://${hostname}:${port}\n`)
      }
    })
}

// types
export type App = ReturnType<typeof runApi>
