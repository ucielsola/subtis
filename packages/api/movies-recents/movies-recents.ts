import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { moviesRowSchema, supabase } from '@subtis/db'

// internals
import { errorSchema } from '../shared'

// schemas
const movieRecentSchema = moviesRowSchema.pick({ id: true, name: true, rating: true, release_date: true, year: true })
const recentMovieSchema = z
  .array(movieRecentSchema, { invalid_type_error: 'Recent movies not found' })
  .min(1, { message: 'Recent movies not found' })
const responseSchema = z.union([recentMovieSchema, errorSchema])

// types
type Response = z.infer<typeof responseSchema>

// core
export async function getRecentMovies({
  body,
  set,
}: {
  body: { limit: number }
  set: Context['set']
}): Promise<Response | null> {
  const { limit } = body

  const { data } = await supabase
    .from('Movies')
    .select(
      'id, name, year, rating, release_date',
    )
    .order('release_date', { ascending: false })
    .limit(limit)

  const recentSubtitles = recentMovieSchema.safeParse(data)
  if (!recentSubtitles.success) {
    set.status = 404
    return { message: 'No recent movies found' }
  }

  return recentSubtitles.data
}
