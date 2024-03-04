import { expect, test } from "bun:test";

// internals
import { getYtsMxTotalMoviesAndPages } from "../yts-mx";

test("should return yts mx total movies and pages", async () => {
	const { totalMovies, totalPages } = await getYtsMxTotalMoviesAndPages();

	expect(totalMovies).toBeTypeOf("number");
	expect(totalPages).toBeTypeOf("number");

	expect(totalMovies).toBeGreaterThan(52200);
	expect(totalPages).toBeGreaterThan(1040);
});
