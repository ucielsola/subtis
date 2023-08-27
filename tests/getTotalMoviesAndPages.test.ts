import { describe, it } from "vitest";

import { getYtsMxTotalMoviesAndPages } from "../yts-mx";

describe("getYtsMxTotalMoviesAndPages", () => {
  it("should return yts mx total movies and pages", async ({ expect }) => {
    const { totalMovies, totalPages } = await getYtsMxTotalMoviesAndPages();

    expect(totalMovies).toBeTypeOf("number");
    expect(totalPages).toBeTypeOf("number");

    expect(totalMovies).toBeGreaterThan(52200);
    expect(totalPages).toBeGreaterThan(1040);
  });
});
