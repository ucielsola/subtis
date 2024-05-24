import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { metrics } from "./metrics";

describe("API | /metrics/download", () => {
  test("Valid JSON Request with existing bytes and titleFileName", async () => {
    const request = {
      method: "POST",
      body: JSON.stringify({
        bytes: 2271011775,
        titleFileName: "Godzilla.X.Kong.The.New.Empire.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
      }),
      headers: { "Content-Type": "application/json" },
    };

    const response = await metrics.request("/download", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
  });

  test("Invalid JSON Request (missing subtitleId)", async () => {
    const request = {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    };

    const response = await metrics.request("/download", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: {
        issues: [
          {
            code: "invalid_type",
            expected: "number",
            received: "undefined",
            path: ["bytes"],
            message: "Required",
          },
          {
            code: "invalid_type",
            expected: "string",
            received: "undefined",
            path: ["titleFileName"],
            message: "Required",
          },
        ],
        name: "ZodError",
      },
    });
  });
});
