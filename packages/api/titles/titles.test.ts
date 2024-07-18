import { describe, expect, test } from "bun:test";

// internals
import { MAX_LIMIT } from "../shared/constants";
import { getMockEnv } from "../shared/test";
import { titles } from "./titles";

describe("API | /titles/search/:query", () => {
  test("Valid URL with query having less than 3 characters", async () => {
    const request = {
      method: "GET",
    };

    const response = await titles.request("/search/ku", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ message: "Query must be at least 3 characters" });
  });

  test("Valid URL with query using fuzzy search", async () => {
    const request = {
      method: "GET",
    };

    const response = await titles.request("/search/insde", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        id: 2096673,
        type: "movie",
        title_name: "Inside Out",
        year: 2015,
        backdrop: "https://image.tmdb.org/t/p/original/j29ekbcLpBvxnGk6LjdTc2EI5SA.jpg",
      },
    ]);
  });

  test("Valid URL with query random that doesn't find any title", async () => {
    const request = {
      method: "GET",
    };

    const query = "kfpqew";
    const response = await titles.request(`/search/${query}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ message: `Titles not found for query ${query}` });
  });

  test("Valid URL with query without using fuzzy search", async () => {
    const request = {
      method: "GET",
    };

    const response = await titles.request("/search/tracker", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        id: 13875494,
        type: "tv-show",
        title_name: "Tracker",
        year: 2024,
        backdrop: "https://image.tmdb.org/t/p/original/uVnGusAwehV4WdxgKwFg0UJql1R.jpg",
      },
    ]);
  });
});

describe("API | /titles/recent/:limit", () => {
  test("Valid URL with limit being greater than MAX_LIMIT (30)", async () => {
    const request = {
      method: "GET",
    };

    const response = await titles.request("/recent/31", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ message: `Limit must be less than or equal to ${MAX_LIMIT}` });
  });

  test("Valid URL with limit equals 2", async () => {
    const request = {
      method: "GET",
    };

    const response = await titles.request("/recent/2", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        id: 20202136,
        title_name: "Descendants: The Rise of Red",
        type: "movie",
        year: 2024,
        rating: 7.3,
        release_date: "2024-07-11",
      },
      {
        id: 18070898,
        title_name: "Sunny",
        type: "tv-show",
        year: 2024,
        rating: 6.5,
        release_date: "2024-07-09",
      },
    ]);
  });
});
