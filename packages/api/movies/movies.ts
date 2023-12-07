import { z } from 'zod'
import type { Context } from 'elysia'
import invariant from 'tiny-invariant'

// shared
import { getIsInvariantError, getParsedInvariantMessage } from 'shared/invariant'

// db
import { type Movie, supabase } from 'db'

// types
type ApiResponseError = { message: string }

type CustomQuery = Pick<Movie, 'id' | 'name' | 'year'>[] | null | ApiResponseError

// schemas
const errorSchema = z.object({ status: z.number(), message: z.string() })

// core
export async function getMoviesFromMovieId({
  set,
  body,
}: {
  set: Context['set']
  body: { movieName: string }
}): Promise<CustomQuery> {
  try {
    // 1. Get fileName from body
    const { movieName } = body

    // 2. Get movies from database
    const { data: movies } = await supabase
      .from('Movies')
      .select(
        'id, name, year',
      )
      .ilike('name', `${movieName}%`)
      .limit(10)

    // 3. Throw error if movies is not found
    invariant(movies && movies.length !== 0, JSON.stringify({ message: `Movies not found for query ${movieName}`, status: 404 }))

    // 4. Return movies
    return movies
  }
  catch (error) {
    const nativeError = error as Error
    const isInvariantError = getIsInvariantError(nativeError)

    if (!isInvariantError) {
      set.status = 500
      return { message: nativeError.message }
    }

    const invariantMessage = getParsedInvariantMessage(nativeError)
    const invariantError = JSON.parse(invariantMessage)
    const { status, message } = errorSchema.parse(invariantError)

    set.status = status
    return { message }
  }
}
