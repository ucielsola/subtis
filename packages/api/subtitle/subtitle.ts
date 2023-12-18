import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { supabase } from 'db'
import { moviesRowSchema, releaseGroupsRowSchema, subtitleGroupsRowSchema, subtitlesRowSchema } from 'db/schemas'

// shared
import { videoFileNameSchema } from 'shared/movie'

// api
import { errorSchema } from '@subtis/api'

// schemas
export const subtitleSchema
  = subtitlesRowSchema.pick({ id: true, subtitleShortLink: true, subtitleFullLink: true, resolution: true, fileName: true }).extend({
    Movies: moviesRowSchema.pick({ name: true, year: true }),
    ReleaseGroups: releaseGroupsRowSchema.pick({ name: true }),
    SubtitleGroups: subtitleGroupsRowSchema.pick({ name: true }),
  })

const subtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: 'Subtitle not found for file' })
  .min(1, { message: 'Subtitle not found for file' })
const responseSchema = z.union([subtitleSchema, errorSchema])

// types
type Response = z.infer<typeof responseSchema>

// core
export async function getSubtitleFromFileName({
  set,
  body,
}: {
  set: Context['set']
  body: unknown
}): Promise<Response> {
  const bodyParsed = z.object({ fileName: z.string({
    required_error: 'Key fileName is required in JSON payload',
  }) }).safeParse(body)

  if (!bodyParsed.success) {
    set.status = 400
    return { message: bodyParsed.error.issues[0].message }
  }

  const videoFileName = videoFileNameSchema.safeParse(bodyParsed.data.fileName)
  if (!videoFileName.success) {
    set.status = 415
    return { message: videoFileName.error.issues[0].message }
  }

  const { data } = await supabase
    .from('Subtitles')
    .select(
      'id, subtitleShortLink, subtitleFullLink, resolution, fileName, Movies ( name, year ), ReleaseGroups ( name ), SubtitleGroups ( name )',
    )
    .eq('fileName', videoFileName.data)
    .order('subtitleGroupId', { ascending: false })
    .limit(1)

  const subtitles = subtitlesSchema.safeParse(data)
  if (!subtitles.success) {
    set.status = 404
    return { message: subtitles.error.issues[0].message }
  }

  return subtitles.data[0]
}
