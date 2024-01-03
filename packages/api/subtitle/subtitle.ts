import ms from 'ms'
import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { moviesRowSchema, releaseGroupsRowSchema, subtitleGroupsRowSchema, subtitlesRowSchema, supabase } from '@subtis/db'

// shared
import { getMovieMetadata, videoFileNameSchema } from 'shared/movie'

// internals
import { errorSchema } from '../shared'

// schemas
export const subtitleSchema
  = subtitlesRowSchema.pick({ id: true, subtitleShortLink: true, subtitleFullLink: true, resolution: true, fileName: true }).extend({
    Movies: moviesRowSchema.pick({ name: true, year: true }),
    ReleaseGroups: releaseGroupsRowSchema.pick({ name: true }),
    SubtitleGroups: subtitleGroupsRowSchema.pick({ name: true }),
  })
const responseSchema = z.union([subtitleSchema, errorSchema])

// types
type Subtitle = z.infer<typeof subtitleSchema>
type Response = z.infer<typeof responseSchema>

// cache
export const cache = new Map<string, Subtitle>()
setInterval(() => cache.clear(), ms('1d'))

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

  // get subtitle from cache
  const cachedSubtitle = cache.get(videoFileName.data)
  if (cachedSubtitle) {
    return cachedSubtitle
  }

  const { data } = await supabase
    .from('Subtitles')
    .select(
      'id, subtitleShortLink, subtitleFullLink, resolution, fileName, Movies ( name, year ), ReleaseGroups ( name ), SubtitleGroups ( name )',
    )
    .eq('fileName', videoFileName.data)
    .order('subtitleGroupId', { ascending: false })
    .single()

  const subtitle = subtitleSchema.safeParse(data)
  if (!subtitle.success) {
    set.status = 404
    return { message: 'Subtitle not found for file' }
  }

  // update cache
  cache.set(videoFileName.data, subtitle.data)

  // update lastQueriedAt and queriedTimes
  supabase.rpc('update_subtitle_info', { file_name: videoFileName.data })

  return subtitle.data
}
