import { z } from 'zod'
import invariant from 'tiny-invariant'
import type { Context } from 'elysia'

// shared
import { getIsInvariantError, getParsedInvariantMessage } from 'shared/invariant'

// db
import { type Movie, type ReleaseGroup, type Subtitle, type SubtitleGroup, supabase } from 'db'

// internals
import { redis } from './redis'

// types
type ApiResponseError = { message: string }

type CustomQuery =
  | (Pick<Subtitle, 'id' | 'subtitleShortLink' | 'subtitleFullLink' | 'fileName' | 'resolution'> & {
    Movies: Pick<Movie, 'name' | 'year'> | null
  } & {
    ReleaseGroups: Pick<ReleaseGroup, 'name'> | null
  } & {
    SubtitleGroups: Pick<SubtitleGroup, 'name'> | null
  })[]
  | ApiResponseError

// schemas
const errorSchema = z.object({ status: z.number(), message: z.string() })

// core
export async function getSubtitlesFromMovieId({
  set,
  body,
}: {
  set: Context['set']
  body: { movieId: string }
}): Promise<CustomQuery> {
  try {
    // 1. Get movieId from body
    const { movieId } = body

    // 2. Check if movie exists in cache
    const subtitleInCache = await redis.get<CustomQuery>(`/v1/subtitles/${movieId}`)

    // 3. Return subtitle from cache if exists
    if (subtitleInCache) {
      return subtitleInCache
    }

    // 4. Get subtitles from database
    const { data: subtitles } = await supabase
      .from('Subtitles')
      .select(
        'id, subtitleShortLink, subtitleFullLink, resolution, fileName, Movies ( name, year ), ReleaseGroups ( name ), SubtitleGroups ( name )',
      )
      .eq('movieId', movieId)

    // 5. Throw error if subtitles not found
    invariant(subtitles && subtitles.length > 0, JSON.stringify({ message: 'Subtitles not found for movie', status: 404 }))

    // 6. Save subtitles in cache
    redis.set(`/v1/subtitles/${movieId}`, subtitles)

    // 7. Return subtitles
    return subtitles
  }
  catch (error) {
    const nativeError = error as Error
    const isInvariantError = getIsInvariantError(nativeError)

    if (!isInvariantError) {
      set.status = 500
      return { message: nativeError.message }
    }

    const invariantMessage = getParsedInvariantMessage(nativeError)
    const invariantError = JSON.parse(invariantMessage)
    const { status, message } = errorSchema.parse(invariantError)

    set.status = status
    return { message }
  }
}
