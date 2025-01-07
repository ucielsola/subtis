import { describe, expect, test } from "bun:test";

// internals
import { MAX_LIMIT } from "../shared/constants";
import { getMockEnv } from "../shared/test";
import { subtitles } from "./subtitles";

describe("API | /subtitles/movie/:titleId", () => {
  test("Invalid URL with ID being not a number", async () => {
    const request = {
      method: "GET",
    };

    const movieId = "dddddddd";

    const response = await subtitles.request(`/movie/${movieId}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      message: "An error occurred",
      error: "Subtitles not found for title",
    });
  });

  test("Valid URL with existing movie ID", async () => {
    const request = {
      method: "GET",
    };

    const movieId = 1877830;

    const response = await subtitles.request(`/movie/${movieId}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    // @ts-ignore
    expect(data.results).toBeArray();
  });

  test("Valid URL with non-existing movie ID", async () => {
    const request = {
      method: "GET",
    };

    const movieId = 9214772992;

    const response = await subtitles.request(`/movie/${movieId}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      message: "An error occurred",
      error: "Subtitles not found for title",
    });
  });
});

describe("API | /subtitles/tv-show/:titleId/:season?/:episode?", () => {
  test("Invalid URL with ID being not a number", async () => {
    const request = {
      method: "GET",
    };

    const tvShowId = "ddassqweqwew";

    const response = await subtitles.request(`/tv-show/${tvShowId}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      message: "An error occurred",
      error: "Subtitles not found for title",
    });
  });

  test("Valid URL with existing TV show ID", async () => {
    const request = {
      method: "GET",
    };

    const tvShowId = 2788316;

    const response = await subtitles.request(`/tv-show/${tvShowId}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    // @ts-ignore
    expect(data.results).toBeArray();
  });

  test("Valid URL with existing TV show ID for specific season", async () => {
    const request = {
      method: "GET",
    };

    const tvShowId = 2788316;

    const response = await subtitles.request(`/tv-show/${tvShowId}/1`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    // @ts-ignore
    expect(data.results).toBeArray();
  });

  test("Valid URL with existing TV show ID for specific season and episode", async () => {
    const request = {
      method: "GET",
    };

    const tvShowId = 2788316;

    const response = await subtitles.request(`/tv-show/${tvShowId}/1/1`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    // @ts-ignore
    expect(data.results).toBeArray();
  });

  test("Valid URL with non-existing TV show ID", async () => {
    const request = {
      method: "GET",
    };

    const tvShowId = 9214772992;

    const response = await subtitles.request(`/tv-show/${tvShowId}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      message: "An error occurred",
      error: "Subtitles not found for title",
    });
  });
});

describe("API | /subtitles/trending/download/:limit", () => {
  test("Valid URL with limit being greater than MAX_LIMIT (30)", async () => {
    const request = {
      method: "GET",
    };

    const limit = 40;

    const response = await subtitles.request(`/trending/download/${limit}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ message: `Limit must be less than or equal to ${MAX_LIMIT}` });
  });

  test("Valid URL with limit being 1", async () => {
    const request = {
      method: "GET",
    };

    const limit = 1;

    const response = await subtitles.request(`/trending/download/${limit}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    // @ts-ignore
    expect(data.results).toBeArray();
    // @ts-ignore
    expect(data.results).toHaveLength(1);
  });
});

describe("API | /subtitles/tv-show/download/season/:titleId/:season/:resolution/:releaseGroupId", () => {
  test("Invalid URL with ID being not a number", async () => {
    const request = {
      method: "GET",
    };

    const tvShowId = 2788316;
    const season = 1;
    const resolution = 1080;
    const releaseGroupId = "1572";

    const response = await subtitles.request(
      `/tv-show/download/season/${tvShowId}/${season}/${resolution}/${releaseGroupId}`,
      request,
      getMockEnv(),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/zip");
    expect(response.headers.get("Content-Disposition")).toContain("attachment");
  });
});
