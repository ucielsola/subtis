import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { supabase } from '@subtis/db'

// internals
import { errorSchema } from '../shared'
import { subtitleSchema } from '../subtitle'

// schemas
const trendingSubtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: 'Trending subtitles not found' })
  .min(1, { message: 'Trending subtitles not found' })
const responseSchema = z.union([trendingSubtitlesSchema, errorSchema])

// types
type Response = z.infer<typeof responseSchema>

// core
export async function getTrendingSubtitles({ set }: { set: Context['set'] }): Promise<Response | null> {
  const { data } = await supabase
    .from('Subtitles')
    .select(
      'id, subtitleShortLink, subtitleFullLink, resolution, fileName, Movies ( name, year ), ReleaseGroups ( name ), SubtitleGroups ( name )',
    )
    .order('queriedTimes', { ascending: false })
    .order('lastQueriedAt', { ascending: false })
    .limit(6)

  const trendingSubtitles = trendingSubtitlesSchema.safeParse(data)
  if (!trendingSubtitles.success) {
    set.status = 404
    return { message: trendingSubtitles.error.issues[0].message }
  }

  return trendingSubtitles.data
}
