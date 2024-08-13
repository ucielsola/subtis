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

    const response = await titles.request("/search/kngdom", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        id: 11389872,
        type: "movie",
        title_name: "Kingdom of the Planet of the Apes",
        year: 2024,
        backdrop: "https://image.tmdb.org/t/p/original/fqv8v6AycXKsivp1T5yKtLbGXce.jpg",
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
        id: 26753003,
        type: "movie",
        title_name: "Trap",
        year: 2024,
        backdrop: "https://image.tmdb.org/t/p/original/iAlsYg6dlv1fvOBypM7SldIS1Wl.jpg",
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
        id: 23063732,
        title_name: "Saving Bikini Bottom: The Sandy Cheeks Movie",
        type: "movie",
        year: 2024,
        rating: 6.276,
        release_date: "2024-08-01",
      },
      {
        id: 26753003,
        title_name: "Trap",
        type: "movie",
        year: 2024,
        rating: 6.3,
        release_date: "2024-07-31",
      },
    ]);
  });
});
