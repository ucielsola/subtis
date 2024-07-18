import { describe, expect, it } from "bun:test";

// internals
import { MAX_LIMIT } from "./constants";

describe("MAX_LIMIT constant", () => {
  it("should be defined", () => {
    expect(MAX_LIMIT).toBeDefined();
  });

  it("should be a number", () => {
    expect(typeof MAX_LIMIT).toBe("number");
  });

  it("should be equal to 30", () => {
    expect(MAX_LIMIT).toBe(30);
  });

  it("should be less than or equal to the maximum allowed value", () => {
    const MAX_ALLOWED_VALUE = 100;
    expect(MAX_LIMIT).toBeLessThanOrEqual(MAX_ALLOWED_VALUE);
  });
});
