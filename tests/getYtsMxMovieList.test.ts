import { describe, it } from "vitest";

import { getYtsMxMovieList } from "../yts-mx";

describe("getYtsMxMovieList", () => {
  it("should return 50 movies from YTS MX movie list endpoint", async ({
    expect,
  }) => {
    const movieList = await getYtsMxMovieList();
    expect(movieList.length).toBe(50);
  });
});
