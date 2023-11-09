import { expect, test } from 'bun:test'

import { getFullImdbId, getImdbLink } from '../imdb'

test('should return striped imdb id without \'tt\' prefix', () => {
  const imdbId = 17053204
  const imdbLink = getImdbLink(imdbId)
  const fullImdbId = getFullImdbId(imdbId)

  expect(imdbLink).toBe(`https://www.imdb.com/title/${fullImdbId}`)
})

test('should return striped imdb id without \'tt\' prefix', () => {
  const imdbId = 11710248
  const imdbLink = getImdbLink(imdbId)
  const fullImdbId = getFullImdbId(imdbId)

  expect(imdbLink).toBe(`https://www.imdb.com/title/${fullImdbId}`)
})

test('should return striped imdb id without \'tt\' prefix', () => {
  const imdbId = 26675777
  const imdbLink = getImdbLink(imdbId)
  const fullImdbId = getFullImdbId(imdbId)

  expect(imdbLink).toBe(`https://www.imdb.com/title/${fullImdbId}`)
})
