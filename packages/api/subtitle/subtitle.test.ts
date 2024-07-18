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

    expect(response.status).toBe(400);
    expect(data).toEqual({ message: "Invalid ID: it should be a number" });
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

    const bytes = 1998445320;
    const fileName = "The.Garfield.Movie.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";

    const response = await subtitle.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      current_episode: null,
      current_season: null,
      id: 5499,
      queried_times: 0,
      releaseGroup: {
        release_group_name: "YTS",
      },
      resolution: "1080p",
      subtitleGroup: {
        id: 61,
      },
      subtitle_file_name: "The.Garfield.Movie.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
      subtitle_link:
        "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/the-garfield-movie-1080p-yts-subdivx.srt?download=The.Garfield.Movie.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
      title: {
        backdrop: "https://image.tmdb.org/t/p/original/Akv9GlCCMrzcDkVz4ad8MdLl9DK.jpg",
        poster: "https://image.tmdb.org/t/p/original/tkdc73JiPVvzngSpbLEIfFNjll1.jpg",
        title_name: "The Garfield Movie",
        type: "movie",
        year: 2024,
      },
    });
  });

  test("Valid URL for existing subtitle found by bytes", async () => {
    const request = {
      method: "GET",
    };

    const bytes = 1998445320;
    const fileName = "The.Ga.MX].mp4";

    const response = await subtitle.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      current_episode: null,
      current_season: null,
      id: 5499,
      queried_times: 0,
      releaseGroup: {
        release_group_name: "YTS",
      },
      resolution: "1080p",
      subtitleGroup: {
        id: 61,
      },
      subtitle_file_name: "The.Garfield.Movie.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
      subtitle_link:
        "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/the-garfield-movie-1080p-yts-subdivx.srt?download=The.Garfield.Movie.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
      title: {
        backdrop: "https://image.tmdb.org/t/p/original/Akv9GlCCMrzcDkVz4ad8MdLl9DK.jpg",
        poster: "https://image.tmdb.org/t/p/original/tkdc73JiPVvzngSpbLEIfFNjll1.jpg",
        title_name: "The Garfield Movie",
        type: "movie",
        year: 2024,
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

    const fileName = "The.Garfield.Movie.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3";

    const response = await subtitle.request(`/file/alternative/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data).toEqual({ message: "File extension not supported" });
  });

  test("Valid URL with subtitle alternative found", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "The.Garfield.Movie.2024.720p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";

    const response = await subtitle.request(`/file/alternative/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: 5500,
      resolution: "720p",
      subtitle_link:
        "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/the-garfield-movie-720p-galaxyrg-subdivx.srt?download=The.Garfield.Movie.2024.720p.WEBRip.800MB.x264-GalaxyRG.srt",
      queried_times: 0,
      current_season: null,
      current_episode: null,
      subtitle_file_name: "The.Garfield.Movie.2024.720p.WEBRip.800MB.x264-GalaxyRG.srt",
      title: {
        title_name: "The Garfield Movie",
        type: "movie",
        year: 2024,
        poster: "https://image.tmdb.org/t/p/original/tkdc73JiPVvzngSpbLEIfFNjll1.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/Akv9GlCCMrzcDkVz4ad8MdLl9DK.jpg",
      },
      releaseGroup: {
        release_group_name: "GalaxyRG",
      },
      subtitleGroup: {
        id: 61,
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
    expect(data).toEqual({ message: "Subtitle not found for file" });
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
    expect(data).toEqual({ message: "Invalid ID: it should be a number" });
  });

  test("Valid URL with subtitle not found", async () => {
    const request = {
      method: "GET",
    };

    const subtitleId = 98123712371274;

    const response = await subtitle.request(`/link/${subtitleId}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ message: "Subtitle not found for ID" });
  });

  test("Valid URL with valid subtitle existant on DB", async () => {
    const request = {
      method: "GET",
    };

    const subtitleId = 5499;

    const response = await subtitle.request(`/link/${subtitleId}`, request, getMockEnv());

    expect(response.status).toBe(302);
  });
});
