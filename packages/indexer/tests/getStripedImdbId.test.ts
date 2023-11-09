import { expect, test } from 'bun:test'

import { getStripedImdbId } from '../imdb'

test('should return striped imdb id without \'tt\' prefix', () => {
  const stripedImdbId = getStripedImdbId('tt17053204')
  expect(stripedImdbId).toBe(17053204)
})

test('should return striped imdb id without \'tt\' prefix', () => {
  const stripedImdbId = getStripedImdbId('11710248')
  expect(stripedImdbId).toBe(11710248)
})

test('should return striped imdb id without \'tt\' prefix', () => {
  const stripedImdbId = getStripedImdbId('26675777')
  expect(stripedImdbId).toBe(26675777)
})
