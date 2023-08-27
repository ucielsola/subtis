import { describe, it } from "vitest";

import { getMovieData } from "../movie";
import { getArgenteamSubtitle } from "../argenteam";

describe("getArgenteamSubtitle", () => {
  it("should return a subtitle link giving a movie, release group and quality", async ({
    expect,
  }) => {
    const movieData = getMovieData(
      "Spider-Man.Across.The.Spider-Verse.2023.1080p.WEB-DL.DDP5.1.Atmos.x264-AOC.mkv",
    );
    const subtitle = await getArgenteamSubtitle(movieData, 9362722);

    expect(subtitle).toEqual({
      fileExtension: "zip",
      subtitleGroup: "Argenteam",
      subtitleCompressedFileName:
        "spider-man-across-the-spider-verse-1080p-aoc-argenteam.zip",
      subtitleFileNameWithoutExtension:
        "spider-man-across-the-spider-verse-1080p-aoc-argenteam",
      subtitleLink:
        "https://argenteam.net/subtitles/90262/Spider-Man.Across.the.Spider-Verse.%282023%29.WEB-DL.x264.1080p.ATMOS-AOC",
      subtitleSrtFileName:
        "spider-man-across-the-spider-verse-1080p-aoc-argenteam.srt",
    });
  });

  // TODO: Add 3-4 more tests cases
});
