import { expect, test } from 'bun:test'

import { getRandomDelay } from '../utils'

test('should return an array of 1 number', () => {
  const { miliseconds, seconds } = getRandomDelay()

  expect(miliseconds).toBe(seconds * 1000)

  expect(miliseconds).toBeTypeOf('number')
  expect(seconds).toBeTypeOf('number')
})
