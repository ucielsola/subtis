import { z } from 'zod'
import { edenTreaty } from '@elysiajs/eden'
import type { Context } from 'elysia'

// db
import { supabase } from 'db'

// shared
import { videoFileNameSchema } from 'shared/movie'

// api
import type { ApiBaseUrlConfig, App } from '@subtis/api'
import { errorSchema, getApiBaseUrl, redis, subtitleSchema } from '@subtis/api'

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

  const subtitleInCache = await redis.get(`/v1/subtitle/${videoFileName.data}`)
  const subtitleInRedis = subtitleSchema.safeParse(subtitleInCache)
  if (subtitleInRedis.success) {
    set.status = 200
    return subtitleInRedis.data
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

  const [subtitle] = subtitles.data
  redis.set(`/v1/subtitle/${videoFileName.data}`, subtitle)

  return subtitle
}

export async function getSubtitle(fileName: string, apiBaseUrlConfig: ApiBaseUrlConfig) {
  const apiBaseUrl = getApiBaseUrl(apiBaseUrlConfig)
  return edenTreaty<App>(apiBaseUrl).v1.subtitle.post({ fileName })
}
