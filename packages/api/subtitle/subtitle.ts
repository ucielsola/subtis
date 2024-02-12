import ms from 'ms'
import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { moviesRowSchema, releaseGroupsRowSchema, subtitleGroupsRowSchema, subtitlesRowSchema, supabase } from '@subtis/db'

// shared
import { videoFileNameSchema } from '@subtis/shared'

// internals
import { errorSchema } from '../shared'

// schemas
export const subtitleSchema
  = subtitlesRowSchema.pick({ fileName: true, id: true, resolution: true, subtitleFullLink: true, subtitleShortLink: true }).extend({
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
  body,
  set,
}: {
  body: { fileName: string }
  set: Context['set']
}): Promise<Response> {
  const videoFileName = videoFileNameSchema.safeParse(body.fileName)
  if (!videoFileName.success) {
    set.status = 415
    return { message: videoFileName.error.issues[0].message }
  }

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
    await supabase.rpc('insert_subtitle_not_found', { file_name: videoFileName.data })

    return { message: 'Subtitle not found for file' }
  }

  cache.set(videoFileName.data, subtitle.data)

  return subtitle.data
}
