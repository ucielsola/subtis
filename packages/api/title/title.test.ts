import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { title } from "./title";

describe("API | /title/teaser/:fileName", () => {
  test("Valid URL with unsupported file name extension", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "Avengers.Endgame.2019.1080p.WEBRip.x264-[YTS.LT].mp3";

    const response = await title.request(`/teaser/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data).toEqual({
      message: "File extension not supported",
    });
  });
  test("Valid URL with unsupported file name", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "Vampires Melody 2.mp4";

    const response = await title.request(`/teaser/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data).toEqual({
      message: "File name is not supported",
    });
  });

  test("Valid URL with title file name that exist in our DB", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "Kingdom.Of.The.Planet.Of.The.Apes.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";

    const response = await title.request(`/teaser/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      name: "Kingdom Of The Planet Of The Apes",
      year: 2024,
      url: "https://www.youtube.com/watch?v=NQ_HvTBaFoo",
    });
  });

  test("Valid URL with title file name that is found from YouTube", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "Avengers.Endgame.2019.1080p.WEBRip.x264-[YTS.LT].mp4";

    const response = await title.request(`/teaser/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      name: "Avengers Endgame",
      year: 2019,
      url: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
    });
  });

  test("Valid URL with title file name that is NOT found on YouTube", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "casique.yatel.1970.720p.BluRay.x264-[YTS.AM].mp4";

    const response = await title.request(`/teaser/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      message: "No teaser found",
    });
  });

  test("Valid URL with title file name that is a TV Show found on YouTube for specific season", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "game.of.thrones.s08e06.720p.web.h264-memento[eztv].mkv";

    const response = await title.request(`/teaser/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      name: "game of thrones",
      year: null,
      url: "https://www.youtube.com/watch?v=rlR4PJn8b8I",
    });
  });
});
