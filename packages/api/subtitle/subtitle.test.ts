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
    expect(data).toMatchObject({
      id: expect.any(Number),
      bytes: 1697998881,
      resolution: "720p",
      subtitle_link: expect.stringContaining("the-batman-720p-yts-subdivx.srt"),
      title_file_name: "The.Batman.2022.720p.BluRay.x264.AAC-[YTS.MX].mp4",
      title: {
        title_name: "The Batman",
        type: "movie",
        year: 2022,
      },
      releaseGroup: {
        release_group_name: "YTS",
      },
      subtitleGroup: {
        subtitle_group_name: "SubDivX",
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
      id: 8421,
      bytes: 3487908744,
      resolution: "1080p",
      subtitle_link:
        "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/the-batman-1080p-yts-subdivx.srt?download=The.Batman.2022.1080p.BluRay.x264.AAC5.1-[YTS.MX].srt",
      queried_times: 11,
      current_season: null,
      current_episode: null,
      title_file_name: "The.Batman.2022.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4",
      subtitle_file_name: "The.Batman.2022.1080p.BluRay.x264.AAC5.1-[YTS.MX].srt",
      title: {
        id: 1877830,
        title_name: "The Batman",
        type: "movie",
        year: 2022,
        poster: "https://image.tmdb.org/t/p/original/mo7teil1qH0SxgLijnqeYP1Eb4w.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/tRS6jvPM9qPrrnx2KRp3ew96Yot.jpg",
      },
      releaseGroup: {
        id: 1065,
        release_group_name: "YTS",
      },
      subtitleGroup: {
        id: 63,
        subtitle_group_name: "SubDivX",
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
      id: 8424,
      bytes: 1724112073,
      resolution: "1080p",
      subtitle_link:
        "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/the-batman-1080p-galaxyrg-subdivx.srt?download=The.Batman.2022.1080p.WEBRip.1600MB.DD2.0.x264-GalaxyRG.srt",
      queried_times: 29,
      current_season: null,
      current_episode: null,
      title_file_name: "The.Batman.2022.1080p.WEBRip.1600MB.DD2.0.x264-GalaxyRG.mkv",
      subtitle_file_name: "The.Batman.2022.1080p.WEBRip.1600MB.DD2.0.x264-GalaxyRG.srt",
      title: {
        id: 1877830,
        title_name: "The Batman",
        type: "movie",
        year: 2022,
        poster: "https://image.tmdb.org/t/p/original/mo7teil1qH0SxgLijnqeYP1Eb4w.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/tRS6jvPM9qPrrnx2KRp3ew96Yot.jpg",
      },
      releaseGroup: {
        id: 1047,
        release_group_name: "GalaxyRG",
      },
      subtitleGroup: {
        id: 63,
        subtitle_group_name: "SubDivX",
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

  test("Valid URL with valid subtitle existant on DB", async () => {
    const request = {
      method: "GET",
    };

    const subtitleId = 8402;

    const response = await subtitle.request(`/link/${subtitleId}`, request, getMockEnv());

    expect(response.status).toBe(302);
  });
});
