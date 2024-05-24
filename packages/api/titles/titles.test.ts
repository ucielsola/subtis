import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { titles } from "./titles";

describe("API | /titles/search/:query", () => {
  test("Valid JSON Request with existing query", async () => {
    const request = {
      method: "GET",
    };

    const response = await titles.request(`/title/${encodeURI("cazafantasmas")}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        id: 21235248,
        title_name: "Ghostbusters: Frozen Empire",
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
        id: 16426418,
        title_name: "Challengers",
        year: 2024,
        rating: 7.341,
        release_date: "2024-04-18",
      },
      {
        id: 14539740,
        title_name: "Godzilla x Kong: The New Empire",
        year: 2024,
        rating: 7.24,
        release_date: "2024-03-27",
      },
    ]);
  });
});
