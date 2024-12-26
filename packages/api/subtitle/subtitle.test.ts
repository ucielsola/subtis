import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { subtitle } from "./subtitle";

describe("API | /subtitle/file/name/:bytes/:fileName", () => {
  test("Invalid URL with missing query parameters", async () => {
    const request = {
      method: "GET",
    };

    const response = await subtitle.request("/file/name/", request, getMockEnv());

    expect(response.status).toBe(404);
  });

  test("Invalid URL with missing fileName query parameter", async () => {
    const request = {
      method: "GET",
    };

    const bytes = 1998445320;

    const response = await subtitle.request(`/file/name/${bytes}`, request, getMockEnv());

    expect(response.status).toBe(404);
  });

  test("Invalid URL with bytes being not a number", async () => {
    const request = {
      method: "GET",
    };

    const bytes = "199844532d";
    const fileName = "The.Garfield.Movie.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";

    const response = await subtitle.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      message: "An error occurred",
      error: 'invalid input syntax for type bigint: "199844532d"',
    });
  });

  test("Invalid URL with fileName not being a video extension", async () => {
    const request = {
      method: "GET",
    };

    const bytes = 1998445320;
    const fileName = "The.Garfield.Movie.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3";

    const response = await subtitle.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data).toEqual({ message: "File extension not supported" });
  });

  test("Valid URL for existing subtitle found by fileName", async () => {
    const request = {
      method: "GET",
    };

    const bytes = 1320;
    const fileName = "The.Batman.2022.720p.BluRay.x264.AAC-[YTS.MX].mp4";

    const response = await subtitle.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      title: {
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
      release_group: {
        id: 1564,
        release_group_name: "YTS",
      },
      subtitle_group: {
        id: 74,
        subtitle_group_name: "SubDivX",
      },
      subtitle: {
        id: 11509,
        bytes: 1697998881,
        is_valid: true,
        resolution: "720p",
        subtitle_link: "https://api.subt.is/v1/subtitle/link/11509",
        queried_times: 0,
        current_season: null,
        current_episode: null,
        title_file_name: "The.Batman.2022.720p.BluRay.x264.AAC-[YTS.MX].mp4",
        subtitle_file_name: "The.Batman.2022.720p.BluRay.x264.AAC-[YTS.MX].srt",
        rip_type: "BluRay",
      },
    });
  });

  test("Valid URL for existing subtitle found by bytes", async () => {
    const request = {
      method: "GET",
    };

    const bytes = 3487908744;
    const fileName = "The.Bat.mp4";

    const response = await subtitle.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      title: {
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
      release_group: {
        id: 1564,
        release_group_name: "YTS",
      },
      subtitle_group: {
        id: 74,
        subtitle_group_name: "SubDivX",
      },
      subtitle: {
        id: 11510,
        bytes: 3487908744,
        is_valid: true,
        resolution: "1080p",
        subtitle_link: "https://api.subt.is/v1/subtitle/link/11510",
        queried_times: 1,
        current_season: null,
        current_episode: null,
        title_file_name: "The.Batman.2022.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4",
        subtitle_file_name: "The.Batman.2022.1080p.BluRay.x264.AAC5.1-[YTS.MX].srt",
        rip_type: "BluRay",
      },
    });
  });

  test("Valid URL for non-existing subtitle", async () => {
    const request = {
      method: "GET",
    };

    const bytes = 199899123320;
    const fileName = "The.Ga.MX].mp4";

    const response = await subtitle.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ message: "Subtitle not found for file" });
  });
});

describe("API | /subtitle/file/alternative/:fileName", () => {
  test("Invalid URL with missing query parameters", async () => {
    const request = {
      method: "GET",
    };

    const response = await subtitle.request("/file/alternative/", request, getMockEnv());

    expect(response.status).toBe(404);
  });

  test("Invalid URL with fileName not being a video extension", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "The.Batman.2022.720p.BluRay.x264.AAC-[YTS.MX].mp3";

    const response = await subtitle.request(`/file/alternative/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data).toEqual({ message: "File extension not supported" });
  });

  test("Valid URL with subtitle alternative found", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "The.Batman.2022.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4";

    const response = await subtitle.request(`/file/alternative/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      title: {
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
      release_group: {
        id: 1546,
        release_group_name: "GalaxyRG",
      },
      subtitle_group: {
        id: 74,
        subtitle_group_name: "SubDivX",
      },
      subtitle: {
        id: 11505,
        bytes: 1724112073,
        is_valid: true,
        resolution: "1080p",
        subtitle_link: "https://api.subt.is/v1/subtitle/link/11505",
        queried_times: 0,
        current_season: null,
        current_episode: null,
        title_file_name: "The.Batman.2022.1080p.WEBRip.1600MB.DD2.0.x264-GalaxyRG.mkv",
        subtitle_file_name: "The.Batman.2022.1080p.WEBRip.1600MB.DD2.0.x264-GalaxyRG.srt",
        rip_type: "WEBRip",
      },
    });
  });

  test("Valid URL with subtitle alternative not found", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "The.Matrix.4.Resurrections.2021.1080p.WEBRip.x264-RARBG.mp4";

    const response = await subtitle.request(`/file/alternative/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      message: "Alternative subtitle not found for file",
    });
  });
});

describe("API | /subtitle/link/:subtitleId", () => {
  test("Invalid URL with subtitleId not being a number", async () => {
    const request = {
      method: "GET",
    };

    const subtitleId = "invalid-id";

    const response = await subtitle.request(`/link/${subtitleId}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ message: "Invalid ID: it should be a positive integer number" });
  });

  test("Valid URL with subtitle not found", async () => {
    const request = {
      method: "GET",
    };

    const subtitleId = 98123712371274;

    const response = await subtitle.request(`/link/${subtitleId}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      message: "Subtitle link not found for subtitle ID",
    });
  });

  test.skip("Valid URL with valid subtitle existant on DB", async () => {
    const request = {
      method: "GET",
    };

    const subtitleId = 8525;

    const response = await subtitle.request(`/link/${subtitleId}`, request, getMockEnv());

    expect(response.status).toBe(302);
  });
});
