import { describe, it } from "vitest";

import { getSubDivXSearchPageHtml } from "../subdivx";

describe("getSubDivXSearchPageHtml", () => {
  it('should return an search HTML for "Kinderfanger (2023)"', async ({
    expect,
  }) => {
    const searchParams = await getSubDivXSearchPageHtml("Kinderfanger (2023)");
    expect(searchParams).toBeTypeOf("string");
  });
});
