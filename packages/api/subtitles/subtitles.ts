import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { supabase } from 'db'

// api
import { errorSchema, subtitleSchema } from '@subtis/api'

// schemas
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
  body: unknown
}): Promise<Response> {
  const bodyParsed = z.object({ movieId: z.string({
    required_error: 'Key movieId is required in JSON payload',
  }) }).safeParse(body)

  if (!bodyParsed.success) {
    set.status = 400
    return { message: bodyParsed.error.issues[0].message }
  }

  const { data } = await supabase
    .from('Subtitles')
    .select(
      'id, subtitleShortLink, subtitleFullLink, resolution, fileName, Movies ( name, year ), ReleaseGroups ( name ), SubtitleGroups ( name )',
    )
    .eq('movieId', bodyParsed.data.movieId)

  const subtitles = subtitlesSchema.safeParse(data)
  if (!subtitles.success) {
    set.status = 404
    return { message: subtitles.error.issues[0].message }
  }

  return subtitles.data
}
