import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { supabase } from 'db'

// shared
import { videoFileNameSchema } from 'shared/movie'

// internals
import { redis } from './redis'

const errorSchema = z.object({ message: z.string() })
const resolutionSchema = z.union([z.literal('720p'), z.literal('1080p')])
const subtitleSchema = z.object({
  id: z.number(),
  subtitleShortLink: z.string(),
  subtitleFullLink: z.string(),
  resolution: resolutionSchema,
  fileName: z.string(),
  Movies: z.object({
    name: z.string(),
    year: z.number(),
  }).nullable(),
  ReleaseGroups: z.object({
    name: z.string(),
  }).nullable(),
  SubtitleGroups: z.object({
    name: z.string(),
  }).nullable(),
})
const subtitlesSchema = z.array(subtitleSchema).min(1, { message: 'Subtitle not found for file' })
const responseSchema = z.union([subtitleSchema, errorSchema])
type Response = z.infer<typeof responseSchema>

// core
export async function getSubtitleFromFileName({
  set,
  body,
}: {
  set: Context['set']
  body: { fileName: string }
}): Promise<Response> {
  const { fileName } = body
  const videoFileName = videoFileNameSchema.safeParse(fileName)
  if (!videoFileName.success) {
    set.status = 415
    return { message: videoFileName.error.issues[0].message }
  }

  const subtitleInRedis = subtitleSchema.safeParse(await redis.get(`/v1/subtitle/${fileName}`))
  if (subtitleInRedis.success) {
    set.status = 200
    return subtitleInRedis.data
  }

  const { data } = await supabase
    .from('Subtitles')
    .select(
      'id, subtitleShortLink, subtitleFullLink, resolution, fileName, Movies ( name, year ), ReleaseGroups ( name ), SubtitleGroups ( name )',
    )
    .eq('fileName', fileName)
    .order('subtitleGroupId', { ascending: false })
    .limit(1)

  const subtitles = subtitlesSchema.safeParse(data)
  if (!subtitles.success) {
    set.status = 404
    return { message: subtitles.error.issues[0].message }
  }

  const [subtitle] = subtitles.data
  redis.set(`/v1/subtitle/${fileName}`, subtitle)

  return subtitle
}
