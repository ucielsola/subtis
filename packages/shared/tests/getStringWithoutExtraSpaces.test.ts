import { expect, test } from 'bun:test';

import { getStringWithoutExtraSpaces } from 'shared/movie';

test('should return an string without any extra spaces', () => {
  const numbersArray = getStringWithoutExtraSpaces(' 1 d  2 3 4    5 6 7 8    9    10');
  expect(numbersArray).toBe('1 d 2 3 4 5 6 7 8 9 10');
});
