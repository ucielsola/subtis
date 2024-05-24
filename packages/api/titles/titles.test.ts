import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { titles } from "./titles";

describe("API | /titles/search/:query", () => {
  test("Valid JSON Request with existing query", async () => {
    const request = {
      method: "GET",
    };

    const response = await titles.request(`/search/${encodeURI("kung")}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        id: 21692408,
        title_name: "Kung Fu Panda 4",
        year: 2024,
      },
    ]);
  });
});

describe("API | /titles/recent", () => {
  test("Valid JSON Request with existing limit", async () => {
    const request = {
      method: "GET",
    };

    const response = await titles.request("/recent/2", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data).toEqual([
      {
        id: 14539740,
        title_name: "Godzilla x Kong: The New Empire",
        year: 2024,
        rating: 7.246,
        release_date: "2024-03-27",
      },
      {
        id: 21692408,
        title_name: "Kung Fu Panda 4",
        year: 2024,
        rating: 7.128,
        release_date: "2024-03-02",
      },
    ]);
  });
});
