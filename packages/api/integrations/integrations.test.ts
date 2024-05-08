import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { integrations } from "./integrations";

describe("API | /stremio/:bytes/:file", () => {
  test("Valid Parameters", async () => {
    const request = {
      method: "GET",
    };

    const response = await integrations.request(
      "/stremio/2326898819/Madame.Web.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
      request,
      getMockEnv(),
    );
    const data = await response.text();

    expect(response.status).toBe(200);
    expect(data).toBeString();
  });

  test("Invalid Parameters (missing file name)", async () => {
    const request = {
      method: "GET",
    };

    const response = await integrations.request("/stremio/2326898819", request, getMockEnv());
    expect(response.status).toBe(404);
  });

  test("Invalid Parameters (invalid file name type)", async () => {
    const request = {
      method: "GET",
    };

    const response = await integrations.request(
      "/stremio/2326898819/Madame.Web.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3",
      request,
      getMockEnv(),
    );
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data).toEqual({
      message: "File extension not supported",
    });
  });
});
