import { expect, test } from 'bun:test'

// internals
import { getFullImdbId } from '../imdb'

test('should return full imdb id', () => {
  const fullImdbId = getFullImdbId(17053204)
  expect(fullImdbId).toBe('tt17053204')
})

test('should return full imdb id', () => {
  const fullImdbId = getFullImdbId(11710248)
  expect(fullImdbId).toBe('tt11710248')
})

test('should return full imdb id', () => {
  const fullImdbId = getFullImdbId(26675777)
  expect(fullImdbId).toBe('tt26675777')
})
