import { z } from 'zod'
import invariant from 'tiny-invariant'
import type { Context } from 'elysia'

// shared
import { getVideoFileExtension } from 'shared/movie'
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
  })
  | ApiResponseError

// schemas
const errorSchema = z.object({ status: z.number(), message: z.string() })

// core
export async function getSubtitleFromFileName({
  set,
  body,
}: {
  set: Context['set']
  body: { fileName: string }
}): Promise<CustomQuery> {
  try {
    const { fileName } = body

    // 1. Checks if file is a video
    const videoFileExtension = getVideoFileExtension(fileName)
    invariant(videoFileExtension, JSON.stringify({ message: 'File extension not supported', status: 415 }))

    // 2. Check if file exists in cache
    const subtitleInCache = await redis.get<CustomQuery>(fileName)

    // 3. Return subtitle from cache if exists
    if (subtitleInCache)
      return subtitleInCache

    // 4. Get subtitle from database
    const { data } = await supabase
      .from('Subtitles')
      .select(
        'id, subtitleShortLink, subtitleFullLink, resolution, fileName, Movies ( name, year ), ReleaseGroups ( name ), SubtitleGroups ( name )',
      )
      .eq('fileName', fileName)

    // 5. Throw error if subtitles not found
    invariant(data && data.length > 0, JSON.stringify({ message: 'Subtitles not found for file', status: 404 }))

    // 6. Get subtitle link from array
    const [subtitle] = data

    // 7. Save subtitle in cache
    redis.set(fileName, subtitle)

    // 8. Return subtitle link
    return subtitle
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
