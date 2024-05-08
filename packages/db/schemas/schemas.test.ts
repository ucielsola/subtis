import { describe, expect, test } from "bun:test";
import { z } from "zod";

// internals
import * as schemas from "./schemas";

describe("DB | Schemas", () => {
  test("Check all schemas are instances of zod", () => {
    for (const [, schema] of Object.entries(schemas)) {
      expect(schema).toBeInstanceOf(z.ZodSchema);
    }
  });
});
