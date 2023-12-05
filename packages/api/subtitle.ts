import { z } from 'zod'
import invariant from 'tiny-invariant'
import type { Context } from 'elysia'

// shared
import { videoFileExtensionSchema } from 'shared/movie'

// db
import { supabase } from 'db'

// internals
import { redis } from './redis'

const errorSchema = z.object({ message: z.string() })
const resolutionSchema = z.union([z.literal('720p'), z.literal('1080p')])
const subtitleSchema = z.object({
  id: z.number(),
  subtitleShortLink: z.string(),
  subtitleFullLink: z.string(),
  fileName: z.string(),
  resolution: resolutionSchema,
  Movie: z.object({
    name: z.string(),
    year: z.string(),
  }).nullable(),
  ReleaseGroups: z.object({
    name: z.string(),
  }).nullable(),
  SubtitleGroups: z.object({
    name: z.string(),
  }).nullable(),
})
const subtitlesSchema = z.array(subtitleSchema, { invalid_type_error: 'Subtitle not found for file' })
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
  // try {
  const { fileName } = body
  const videoFileExtension = videoFileExtensionSchema.safeParse(fileName)
  if (!videoFileExtension.success) {
    set.status = 415
    return { message: videoFileExtension.error.message }
  }

  const cachedSubtitle = subtitleSchema.safeParse(await redis.get(fileName))
  if (cachedSubtitle.success) {
    set.status = 200
    return cachedSubtitle.data
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
    return { message: subtitles.error.message }
  }

  const [subtitle] = subtitles.data
  redis.set(`/v1/subtitle/${fileName}`, subtitle)

  return subtitle
}
