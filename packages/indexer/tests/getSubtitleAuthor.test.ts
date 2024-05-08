import { expect, test } from "bun:test";

// internals
import { getSubtitleAuthor } from "../utils";

test("finds author in last italic tag containing keyword", () => {
  const subtitleFile = Buffer.from("Some text without author<br><i>First italic text</i><br><i>Translation by Leo</i>");
  const author = getSubtitleAuthor(subtitleFile);

  expect(author).toBeNull();
});

test("returns null when no italic tags are present", () => {
  const subtitleFile = Buffer.from("No italic tags here");
  const author = getSubtitleAuthor(subtitleFile);

  expect(author).toBeNull();
});

test("handles multiple lines in the author tag correctly", () => {
  const subtitleFile = Buffer.from("<i>Not the author</i><br><i>traducción\n Leo</i>");
  const author = getSubtitleAuthor(subtitleFile);

  expect(author).toBe("traducción\n Leo");
});

test("ignores italic tags after the last one containing the keyword", () => {
  const subtitleFile = Buffer.from("<i>traducción\n Leo</i><br><i>Not the author</i>");
  const author = getSubtitleAuthor(subtitleFile);

  expect(author).toBeNull();
});
