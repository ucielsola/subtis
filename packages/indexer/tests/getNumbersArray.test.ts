import { expect, test } from 'bun:test'

import { getNumbersArray } from '../utils'

test('should return an array of 1 number', () => {
  const numbersArray = getNumbersArray(1)
  expect(numbersArray).toEqual([1])
})

test('should return an array from 1 to 10', () => {
  const numbersArray = getNumbersArray(10)
  expect(numbersArray).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
})

test('should return an empty array for negative numbers', () => {
  const numbersArray = getNumbersArray(-2)
  expect(numbersArray).toEqual([])
})
