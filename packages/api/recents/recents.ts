import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { supabase } from '@subtis/db'

// internals
import { errorSchema } from '../shared'
import { subtitleSchema } from '../subtitle'

// schemas
const recentSubtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: 'Recent subtitles not found' })
  .min(1, { message: 'Recent subtitles not found' })
const responseSchema = z.union([recentSubtitlesSchema, errorSchema])

// types
type Response = z.infer<typeof responseSchema>

// core
export async function getRecentSubtitles({
  body,
  set,
}: {
  body: { limit: number }
  set: Context['set']
}): Promise<Response | null> {
  const { limit } = body
  const currentYear = new Date().getFullYear() - 1

  const { data } = await supabase
    .from('Subtitles')
    .select(
      'id, subtitleShortLink, subtitleFullLink, resolution, fileName, created_at, Movies ( name, year ), ReleaseGroups ( name ), SubtitleGroups ( name )',
    )
    .eq('Movies.year', currentYear)
    .order('created_at', { ascending: false })
    .limit(limit)

  const recentSubtitles = recentSubtitlesSchema.safeParse(data)
  if (!recentSubtitles.success) {
    set.status = 404
    return { message: 'No recent subtitles for the current year found' }
  }

  return recentSubtitles.data
}
