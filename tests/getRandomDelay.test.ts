import { describe, it } from 'vitest';

import { getRandomDelay } from '../utils';

describe('getRandomDelay', () => {
  it('should return an array of 1 number', ({ expect }) => {
    const { miliseconds, seconds } = getRandomDelay();

    expect(miliseconds).toBe(seconds * 1000);

    expect(miliseconds).toBeTypeOf('number');
    expect(seconds).toBeTypeOf('number');
  });
});
