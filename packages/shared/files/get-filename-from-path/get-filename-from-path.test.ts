import { describe, expect, test } from "bun:test";

// shared
import { getFilenameFromPath } from "./get-filename-from-path";

describe("getFilenameFromPath", () => {
  test("should return the correct filename from a Windows path", () => {
    const path = "C:\\fakepath\\The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";
    const expected = "The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";
    const result = getFilenameFromPath(path);

    expect(result).toBe(expected);
  });

  test("should return the correct filename from a Unix path", () => {
    const path = "/usr/local/bin/somefile.txt";
    const expected = "somefile.txt";
    const result = getFilenameFromPath(path);

    expect(result).toBe(expected);
  });

  test("should return the correct filename when the path represents a file in the root directory (Unix)", () => {
    const path = "/fileInRoot.txt";
    const expected = "fileInRoot.txt";
    const result = getFilenameFromPath(path);

    expect(result).toBe(expected);
  });

  test("should return the correct filename when the path represents a file in the root directory (Windows)", () => {
    const path = "C:\\fileInRoot.txt";
    const expected = "fileInRoot.txt";
    const result = getFilenameFromPath(path);

    expect(result).toBe(expected);
  });

  test("should return the correct filename when there is no directory path, only filename", () => {
    const path = "onlyfilename.mp3";
    const expected = "onlyfilename.mp3";
    const result = getFilenameFromPath(path);

    expect(result).toBe(expected);
  });
});
