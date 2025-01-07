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

    const response = await titles.request("/search/btman", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    // @ts-ignore
    expect(data.results).toMatchObject([
      {
        imdb_id: "1877830",
        type: "movie",
        year: 2022,
        title_name: "The Batman",
        poster: "https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/eUORREWq2ThkkxyiCESCu3sVdGg.jpg",
        poster_thumbhash: "EooOLQaZeIiICGfHeHVXl7mKgPsY",
        backdrop_thumbhash: "1mkOHITfaIdId4eUh4a/XNT3dg==",
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

    const response = await titles.request("/search/the batman", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    // @ts-ignore
    expect(data.results).toEqual([
      {
        id: 548,
        imdb_id: "1877830",
        queried_times: 2,
        searched_times: 0,
        type: "movie",
        year: 2022,
        title_name: "The Batman",
        poster: "https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/eUORREWq2ThkkxyiCESCu3sVdGg.jpg",
        poster_thumbhash: "EooOLQaZeIiICGfHeHVXl7mKgPsY",
        backdrop_thumbhash: "1mkOHITfaIdId4eUh4a/XNT3dg==",
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

  test("Valid URL with limit equals 1", async () => {
    const request = {
      method: "GET",
    };

    const response = await titles.request("/recent/1", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    // @ts-ignore
    expect(data.results).toBeArray();
    // @ts-ignore
    expect(data.results).toHaveLength(1);
  });
});

describe("API | /titles/trending/download/:limit", () => {
  test("Valid URL with limit being greater than MAX_LIMIT (30)", async () => {
    const request = { method: "GET" };
    const limit = 40;

    const response = await titles.request(`/trending/download/${limit}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ message: `Limit must be less than or equal to ${MAX_LIMIT}` });
  });

  test("Valid URL with limit being 1", async () => {
    const request = { method: "GET" };
    const limit = 1;

    const response = await titles.request(`/trending/download/${limit}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    // @ts-ignore
    expect(data.results).toBeArray();
    // @ts-ignore
    expect(data.results).toHaveLength(1);
  });
});
