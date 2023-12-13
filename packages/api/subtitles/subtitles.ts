import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { supabase } from 'db'

// internals
import { redis } from '@subtis/api'
import { moviesRowSchema, releaseGroupsRowSchema, subtitleGroupsRowSchema, subtitlesRowSchema } from 'db/schemas'

// schemas
const errorSchema = z.object({ message: z.string() })

const subtitleSchema
  = subtitlesRowSchema.pick({ id: true, subtitleShortLink: true, subtitleFullLink: true, resolution: true, fileName: true }).extend({
    Movies: moviesRowSchema.pick({ name: true, year: true }),
    ReleaseGroups: releaseGroupsRowSchema.pick({ name: true }),
    SubtitleGroups: subtitleGroupsRowSchema.pick({ name: true }),
  })

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
