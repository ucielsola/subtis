import { expect, test } from 'bun:test'

import { getYtsMxMovieList } from '../yts-mx'

test('should return 50 movies from YTS MX movie list endpoint', async () => {
  const movieList = await getYtsMxMovieList()
  expect(movieList.length).toBe(50)
})
