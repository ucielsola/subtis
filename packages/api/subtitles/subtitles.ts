import { z } from 'zod'
import { edenTreaty } from '@elysiajs/eden'
import type { Context } from 'elysia'

// db
import { supabase } from 'db'

// api
import type { ApiBaseUrlConfig, App } from '@subtis/api'

// internals
import { errorSchema, getApiBaseUrl, redis, subtitleSchema } from '@subtis/api'

const subtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: 'Subtitles not found for movie' })
  .min(1, { message: 'Subtitles not found for movie' })
const responseSchema = z.union([subtitlesSchema, errorSchema])

// types
type Response = z.infer<typeof responseSchema>

// core
export async function getSubtitlesFromMovieId({
  set,
  body,
}: {
  set: Context['set']
  body: { movieId: string }
}): Promise<Response> {
  const { movieId } = body

  const subtitlesInCache = await redis.get(`/v1/subtitles/${movieId}`)
  const subtitlesInRedis = subtitlesSchema.safeParse(subtitlesInCache)
  if (subtitlesInRedis.success) {
    set.status = 200
    return subtitlesInRedis.data
  }

  const { data } = await supabase
    .from('Subtitles')
    .select(
      'id, subtitleShortLink, subtitleFullLink, resolution, fileName, Movies ( name, year ), ReleaseGroups ( name ), SubtitleGroups ( name )',
    )
    .eq('movieId', movieId)

  const subtitles = subtitlesSchema.safeParse(data)
  if (!subtitles.success) {
    set.status = 404
    return { message: subtitles.error.issues[0].message }
  }

  redis.set(`/v1/subtitles/${movieId}`, subtitles)

  return subtitles.data
}

export async function getSubtitles(movieId: string, apiBaseUrlConfig: ApiBaseUrlConfig) {
  const apiBaseUrl = getApiBaseUrl(apiBaseUrlConfig)
  return edenTreaty<App>(apiBaseUrl).v1.subtitles.post({ movieId })
}
