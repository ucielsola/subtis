import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { supabase } from 'db'
import { moviesRowSchema } from 'db/schemas'

// schemas
const movieSchema = moviesRowSchema.pick({ id: true, name: true, year: true })
const moviesSchema = z.array(movieSchema).min(1)
const errorSchema = z.object({ message: z.string() })
const responseSchema = z.union([moviesSchema, errorSchema])

// types
type Response = z.infer<typeof responseSchema>

// core
export async function getMoviesFromMovieId({
  set,
  body,
}: {
  set: Context['set']
  body: { movieName: string }
}): Promise<Response> {
  const { movieName } = body

  const { data } = await supabase
    .from('Movies')
    .select(
      'id, name, year',
    )
    .ilike('name', `${movieName}%`)
    .limit(10)

  const movies = moviesSchema.safeParse(data)
  if (!movies.success) {
    set.status = 404
    return { message: `Movies not found for query ${movieName}` }
  }

  return movies.data
}
