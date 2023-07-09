import { describe, it } from 'vitest';

import { getNumbersArray } from '../utils';

describe('getNumbersArray', () => {
  it('should return an array of 1 number', ({ expect }) => {
    const numbersArray = getNumbersArray(1);
    expect(numbersArray).toEqual([1]);
  });

  it('should return an array from 1 to 10', ({ expect }) => {
    const numbersArray = getNumbersArray(10);
    expect(numbersArray).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should return an empty array for negative numbers', ({ expect }) => {
    const numbersArray = getNumbersArray(-2);
    expect(numbersArray).toEqual([]);
  });
});
