import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { moviesRowSchema, releaseGroupsRowSchema, subtitleGroupsRowSchema, subtitlesRowSchema, supabase } from '@subtis/db'

// shared
import { videoFileNameSchema } from 'shared/movie'

// internals
import { errorSchema } from '../shared'

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
  body: { fileName: string }
}): Promise<Response> {
  const videoFileName = videoFileNameSchema.safeParse(body.fileName)
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

  // update lastQueriedAt and queriedTimes
  supabase.rpc('update_subtitle_info', { file_name: videoFileName.data })

  return subtitles.data[0]
}
