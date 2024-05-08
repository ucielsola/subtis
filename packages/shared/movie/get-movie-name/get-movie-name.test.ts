import { describe, expect, test } from "bun:test";

// shared
import { getMovieName } from "./get-movie-name";

describe("getMovieName", () => {
  test('should return a movie name without dots and any extra spaces for "The.Kept.Mistress.Killer."', async () => {
    const numbersArray = getMovieName("The.Kept.Mistress.Killer.");
    expect(numbersArray).toBe("The Kept Mistress Killer");
  });

  test('should return a movie name without dots and any extra spaces for "Barbra.The.Music....The.Memries....The.Magic."', async () => {
    const numbersArray = getMovieName("Barbra.The.Music....The.Memries....The.Magic.");
    expect(numbersArray).toBe("Barbra The Music The Memries The Magic");
  });
});
