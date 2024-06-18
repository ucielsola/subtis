import { describe, expect, it } from "bun:test";

// internals
import { getDecodedSubtitleFile } from "./get-decoded-subtitle-file";

describe("getDecodedSubtitleFile", () => {
  it("should decode ISO-8859-1 encoded subtitles correctly", () => {
    const subtitleBuffer = Buffer.from("Este es un subtítulo en español con acentos: á, é, í, ó, ú, ñ", "latin1");
    const decodedSubtitle = getDecodedSubtitleFile(subtitleBuffer);
    expect(decodedSubtitle).toBe("Este es un subtítulo en español con acentos: á, é, í, ó, ú, ñ");
  });

  it("should handle empty buffers correctly", () => {
    const subtitleBuffer = Buffer.from("", "latin1");
    const decodedSubtitle = getDecodedSubtitleFile(subtitleBuffer);
    expect(decodedSubtitle).toBe("");
  });

  it("should handle buffers with special characters", () => {
    const subtitleBuffer = Buffer.from("áéíóúñ¿¡", "latin1");
    const decodedSubtitle = getDecodedSubtitleFile(subtitleBuffer);
    expect(decodedSubtitle).toBe("áéíóúñ¿¡");
  });

  it("should handle non-spanish characters correctly", () => {
    const subtitleBuffer = Buffer.from("Hello, World!", "latin1");
    const decodedSubtitle = getDecodedSubtitleFile(subtitleBuffer);
    expect(decodedSubtitle).toBe("Hello, World!");
  });
});
