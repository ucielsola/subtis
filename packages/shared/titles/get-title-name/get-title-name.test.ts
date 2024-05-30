import { describe, expect, test } from "bun:test";

// shared
import { getTitleName } from "./get-title-name";

describe("getTitleName", () => {
  test('should return a movie name without dots and any extra spaces for "The.Kept.Mistress.Killer."', async () => {
    const numbersArray = getTitleName("The.Kept.Mistress.Killer.");
    expect(numbersArray).toBe("The Kept Mistress Killer");
  });

  test('should return a movie name without dots and any extra spaces for "Barbra.The.Music....The.Memries....The.Magic."', async () => {
    const numbersArray = getTitleName("Barbra.The.Music....The.Memries....The.Magic.");
    expect(numbersArray).toBe("Barbra The Music The Memries The Magic");
  });
});
