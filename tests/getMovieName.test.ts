import { describe, it } from 'vitest';

import { getMovieName } from '../movie';

describe('getMovieName', () => {
  it('should return a movie name without dots and any extra spaces for "The.Kept.Mistress.Killer."', async ({
    expect,
  }) => {
    const numbersArray = getMovieName('The.Kept.Mistress.Killer.');
    expect(numbersArray).toBe('The Kept Mistress Killer');
  });

  it('should return a movie name without dots and any extra spaces for "Barbra.The.Music....The.Memries....The.Magic."', async ({
    expect,
  }) => {
    const numbersArray = getMovieName('Barbra.The.Music....The.Memries....The.Magic.');
    expect(numbersArray).toBe('Barbra The Music The Memries The Magic');
  });
});
