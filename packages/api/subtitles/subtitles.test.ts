import { describe, expect, test } from "bun:test";

// internals
import { getMockEnv } from "../shared/test";
import { subtitles } from "./subtitles";

describe("API | /subtitles/movie", () => {
  test("Valid JSON Request with existing title ID", async () => {
    const request = {
      method: "GET",
    };

    const titleId = 15239678;

    const response = await subtitles.request(`/movie/${titleId}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        id: 3867,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune:-part-two-1080p-yts-subdivx.srt?download=Dune.Part.Two.2024.1080p.WEBRip.x264.AAC-[YTS.MX].srt",
        subtitle_file_name: "Dune.Part.Two.2024.1080p.WEBRip.x264.AAC-[YTS.MX].srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Dune: Part Two",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/6o5cJjA4srfvU52UKWaqPUuPPgl.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        },
        releaseGroup: {
          release_group_name: "YTS",
        },
      },
      {
        id: 3868,
        resolution: "720p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune:-part-two-720p-yts-subdivx.srt?download=Dune.Part.Two.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
        subtitle_file_name: "Dune.Part.Two.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Dune: Part Two",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/6o5cJjA4srfvU52UKWaqPUuPPgl.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        },
        releaseGroup: {
          release_group_name: "YTS",
        },
      },
      {
        id: 3869,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune:-part-two-1080p-yts-subdivx.srt?download=Dune.Part.Two.2024.1080p.WEBRip.x265.10bit.AAC-[YTS.MX].srt",
        subtitle_file_name: "Dune.Part.Two.2024.1080p.WEBRip.x265.10bit.AAC-[YTS.MX].srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Dune: Part Two",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/6o5cJjA4srfvU52UKWaqPUuPPgl.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        },
        releaseGroup: {
          release_group_name: "YTS",
        },
      },
      {
        id: 3870,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune:-part-two-1080p-galaxyrg-subdivx.srt?download=Dune.Part.Two.2024.1080p.WEBRip.1600MB.DD5.1.x264-GalaxyRG.srt",
        subtitle_file_name: "Dune.Part.Two.2024.1080p.WEBRip.1600MB.DD5.1.x264-GalaxyRG.srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Dune: Part Two",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/6o5cJjA4srfvU52UKWaqPUuPPgl.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        },
        releaseGroup: {
          release_group_name: "GalaxyRG",
        },
      },
      {
        id: 3871,
        resolution: "2160p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune:-part-two-2160p-flux-subdivx.srt?download=Dune.Part.Two.2024.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.srt",
        subtitle_file_name: "Dune.Part.Two.2024.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Dune: Part Two",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/6o5cJjA4srfvU52UKWaqPUuPPgl.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        },
        releaseGroup: {
          release_group_name: "FLUX",
        },
      },
      {
        id: 3872,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune:-part-two-1080p-yts-subdivx.srt?download=Dune.Part.Two.2024.REPACK.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
        subtitle_file_name: "Dune.Part.Two.2024.REPACK.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Dune: Part Two",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/6o5cJjA4srfvU52UKWaqPUuPPgl.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        },
        releaseGroup: {
          release_group_name: "YTS",
        },
      },
      {
        id: 3873,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune:-part-two-1080p-yts-subdivx.srt?download=Dune.Part.Two.2024.1080p.BluRay.x264.AAC5.1-[YTS.MX].srt",
        subtitle_file_name: "Dune.Part.Two.2024.1080p.BluRay.x264.AAC5.1-[YTS.MX].srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Dune: Part Two",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/6o5cJjA4srfvU52UKWaqPUuPPgl.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        },
        releaseGroup: {
          release_group_name: "YTS",
        },
      },
      {
        id: 3874,
        resolution: "720p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/dune:-part-two-720p-yts-subdivx.srt?download=Dune.Part.Two.2024.REPACK.720p.WEBRip.x264.AAC-[YTS.MX].srt",
        subtitle_file_name: "Dune.Part.Two.2024.REPACK.720p.WEBRip.x264.AAC-[YTS.MX].srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Dune: Part Two",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/6o5cJjA4srfvU52UKWaqPUuPPgl.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        },
        releaseGroup: {
          release_group_name: "YTS",
        },
      },
    ]);
  });

  test("Valid JSON Request with non-existent title ID", async () => {
    const request = {
      method: "GET",
    };

    const response = await subtitles.request("/movie/9350", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ message: "Subtitles not found for title" });
  });
});

describe("API | /subtitles/tv-show", () => {
  test("Valid JSON Request with existing title ID", async () => {
    const request = {
      method: "GET",
    };

    const titleId = 2788316;
    const season = 1;
    const episode = 1;

    const response = await subtitles.request(`/tv-show/${titleId}/${season}/${episode}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        id: 3883,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/shogun-1080p-megusta-subdivx.srt?download=Shogun.2024.S01E01.1080p.HEVC.x265-MeGusta[EZTVx.to].srt",
        current_season: 1,
        current_episode: 1,
        subtitle_file_name: "Shogun.2024.S01E01.1080p.HEVC.x265-MeGusta[EZTVx.to].srt",
        title: {
          title_name: "Shōgun",
          type: "tvShow",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/uIoDvVOQaKjSfz2oihkVS8M7l1v.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/5zmiBoMzeeVdQ62no55JOJMY498.jpg",
        },
        releaseGroup: {
          release_group_name: "MeGusta",
        },
      },
      {
        id: 3884,
        resolution: "2160p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/shogun-2160p-successfulcrab-subdivx.srt?download=shogun.2024.s01e01.2160p.web.h265-successfulcrab.srt",
        current_season: 1,
        current_episode: 1,
        subtitle_file_name: "shogun.2024.s01e01.2160p.web.h265-successfulcrab.srt",
        title: {
          title_name: "Shōgun",
          type: "tvShow",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/uIoDvVOQaKjSfz2oihkVS8M7l1v.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/5zmiBoMzeeVdQ62no55JOJMY498.jpg",
        },
        releaseGroup: {
          release_group_name: "SuccessfulCrab",
        },
      },
      {
        id: 3886,
        resolution: "2160p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/shogun-2160p-successfulcrab-subdivx.srt?download=shogun.2024.s01e01.dv.hdr.2160p.web.h265-successfulcrab.srt",
        current_season: 1,
        current_episode: 1,
        subtitle_file_name: "shogun.2024.s01e01.dv.hdr.2160p.web.h265-successfulcrab.srt",
        title: {
          title_name: "Shōgun",
          type: "tvShow",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/uIoDvVOQaKjSfz2oihkVS8M7l1v.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/5zmiBoMzeeVdQ62no55JOJMY498.jpg",
        },
        releaseGroup: {
          release_group_name: "SuccessfulCrab",
        },
      },
      {
        id: 3882,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/shogun-1080p-successfulcrab-subdivx.srt?download=shogun.2024.s01e01.1080p.web.h264-successfulcrab.srt",
        current_season: 1,
        current_episode: 1,
        subtitle_file_name: "shogun.2024.s01e01.1080p.web.h264-successfulcrab.srt",
        title: {
          title_name: "Shōgun",
          type: "tvShow",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/uIoDvVOQaKjSfz2oihkVS8M7l1v.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/5zmiBoMzeeVdQ62no55JOJMY498.jpg",
        },
        releaseGroup: {
          release_group_name: "SuccessfulCrab",
        },
      },
      {
        id: 3887,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/shogun-1080p-flux-subdivx.srt?download=Shogun.2024.S01E01.Anjin.REPACK.1080p.DSNP.WEB-DL.DDP5.1.H.264-FLUX.srt",
        current_season: 1,
        current_episode: 1,
        subtitle_file_name: "Shogun.2024.S01E01.Anjin.REPACK.1080p.DSNP.WEB-DL.DDP5.1.H.264-FLUX.srt",
        title: {
          title_name: "Shōgun",
          type: "tvShow",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/uIoDvVOQaKjSfz2oihkVS8M7l1v.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/5zmiBoMzeeVdQ62no55JOJMY498.jpg",
        },
        releaseGroup: {
          release_group_name: "FLUX",
        },
      },
      {
        id: 3888,
        resolution: "720p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/shogun-720p-minx-subdivx.srt?download=Shogun.2024.S01E01.720p.WEB.x265-MiNX.srt",
        current_season: 1,
        current_episode: 1,
        subtitle_file_name: "Shogun.2024.S01E01.720p.WEB.x265-MiNX.srt",
        title: {
          title_name: "Shōgun",
          type: "tvShow",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/uIoDvVOQaKjSfz2oihkVS8M7l1v.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/5zmiBoMzeeVdQ62no55JOJMY498.jpg",
        },
        releaseGroup: {
          release_group_name: "MinX",
        },
      },
      {
        id: 3890,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/shogun-1080p-ntb-subdivx.srt?download=Shogun.2024.S01E01.Anjin.1080p.DSNP.WEB-DL.DDP5.1.H.264-NTb[EZTVx.to].srt",
        current_season: 1,
        current_episode: 1,
        subtitle_file_name: "Shogun.2024.S01E01.Anjin.1080p.DSNP.WEB-DL.DDP5.1.H.264-NTb[EZTVx.to].srt",
        title: {
          title_name: "Shōgun",
          type: "tvShow",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/uIoDvVOQaKjSfz2oihkVS8M7l1v.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/5zmiBoMzeeVdQ62no55JOJMY498.jpg",
        },
        releaseGroup: {
          release_group_name: "NTB",
        },
      },
      {
        id: 3889,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/shogun-1080p-megusta-subdivx.srt?download=Shogun.2024.S01E01.1080p.HEVC.x265-MeGusta.srt",
        current_season: 1,
        current_episode: 1,
        subtitle_file_name: "Shogun.2024.S01E01.1080p.HEVC.x265-MeGusta.srt",
        title: {
          title_name: "Shōgun",
          type: "tvShow",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/uIoDvVOQaKjSfz2oihkVS8M7l1v.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/5zmiBoMzeeVdQ62no55JOJMY498.jpg",
        },
        releaseGroup: {
          release_group_name: "MeGusta",
        },
      },
      {
        id: 3885,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/shogun-1080p-successfulcrab-subdivx.srt?download=shogun.2024.s01e01.1080p.web.h264-successfulcrab[EZTVx.to].srt",
        current_season: 1,
        current_episode: 1,
        subtitle_file_name: "shogun.2024.s01e01.1080p.web.h264-successfulcrab[EZTVx.to].srt",
        title: {
          title_name: "Shōgun",
          type: "tvShow",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/uIoDvVOQaKjSfz2oihkVS8M7l1v.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/5zmiBoMzeeVdQ62no55JOJMY498.jpg",
        },
        releaseGroup: {
          release_group_name: "SuccessfulCrab",
        },
      },
    ]);
  });

  test("Valid JSON Request with non-existent title ID", async () => {
    const request = {
      method: "GET",
    };

    const response = await subtitles.request("/tv-show/9350", request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ message: "Subtitles not found for title" });
  });
});

describe("API | /subtitles/trending", () => {
  test("Valid JSON Request with limit 2", async () => {
    const request = {
      method: "GET",
    };

    const limit = 2;

    const response = await subtitles.request(`/trending/${limit}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data).toEqual([
      {
        id: 3862,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/godzilla-x-kong:-the-new-empire-1080p-yts-subdivx.srt?download=Godzilla.X.Kong.The.New.Empire.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
        current_season: null,
        current_episode: null,
        subtitle_file_name: "Godzilla.X.Kong.The.New.Empire.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
        title: {
          title_name: "Godzilla x Kong: The New Empire",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/2YqZ6IyFk7menirwziJvfoVvSOh.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/sR0SpCrXamlIkYMdfz83sFn5JS6.jpg",
        },
        releaseGroup: {
          release_group_name: "YTS",
        },
      },
      {
        id: 3891,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/shogun-1080p-successfulcrab-subdivx.srt?download=shogun.2024.s01e02.1080p.web.h264-successfulcrab.srt",
        current_season: 1,
        current_episode: 2,
        subtitle_file_name: "shogun.2024.s01e02.1080p.web.h264-successfulcrab.srt",
        title: {
          title_name: "Shōgun",
          type: "tvShow",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/uIoDvVOQaKjSfz2oihkVS8M7l1v.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/5zmiBoMzeeVdQ62no55JOJMY498.jpg",
        },
        releaseGroup: {
          release_group_name: "SuccessfulCrab",
        },
      },
    ]);
  });
});

describe("API | /subtitles/file/name", () => {
  test("Valid JSON Request with existing fileName for a movie", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "Godzilla.x.Kong.The.New.Empire.2024.REPACK2.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv";
    const bytes = "1506405943";

    const response = await subtitles.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: 3864,
      resolution: "1080p",
      subtitle_link:
        "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/godzilla-x-kong:-the-new-empire-1080p-galaxyrg-subdivx.srt?download=Godzilla.x.Kong.The.New.Empire.2024.REPACK2.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
      subtitle_file_name: "Godzilla.x.Kong.The.New.Empire.2024.REPACK2.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
      current_season: null,
      current_episode: null,
      title: {
        title_name: "Godzilla x Kong: The New Empire",
        type: "movie",
        year: 2024,
        poster: "https://image.tmdb.org/t/p/original/2YqZ6IyFk7menirwziJvfoVvSOh.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/sR0SpCrXamlIkYMdfz83sFn5JS6.jpg",
      },
      releaseGroup: {
        release_group_name: "GalaxyRG",
      },
    });
  });
  test("Valid JSON Request with existing fileName for a TV Show", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "Shogun.2024.S01E02.1080p.HEVC.x265-MeGusta.mkv";
    const bytes = "420946031";

    const response = await subtitles.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: 3899,
      resolution: "1080p",
      subtitle_link:
        "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/shogun-1080p-megusta-subdivx.srt?download=Shogun.2024.S01E02.1080p.HEVC.x265-MeGusta.srt",
      current_season: 1,
      current_episode: 2,
      subtitle_file_name: "Shogun.2024.S01E02.1080p.HEVC.x265-MeGusta.srt",
      title: {
        title_name: "Shōgun",
        type: "tvShow",
        year: 2024,
        poster: "https://image.tmdb.org/t/p/original/uIoDvVOQaKjSfz2oihkVS8M7l1v.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/5zmiBoMzeeVdQ62no55JOJMY498.jpg",
      },
      releaseGroup: {
        release_group_name: "MeGusta",
      },
    });
  });

  test("Invalid JSON Request with wrong fileName type", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "Road.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3";
    const bytes = "2442029036";

    const response = await subtitles.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data).toEqual({ message: "File extension not supported" });
  });

  test("Valid JSON Request with wrong fileName found by bytes", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "Godzilla.x.Kong.The.New.Empire.2024.REPACK2.1080p.WRip.1400MB.DD5.1.x264-GalaxyRG.mkv";
    const bytes = "1506405943";

    const response = await subtitles.request(`/file/name/${bytes}/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: 3864,
      resolution: "1080p",
      subtitle_link:
        "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/godzilla-x-kong:-the-new-empire-1080p-galaxyrg-subdivx.srt?download=Godzilla.x.Kong.The.New.Empire.2024.REPACK2.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
      subtitle_file_name: "Godzilla.x.Kong.The.New.Empire.2024.REPACK2.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
      current_season: null,
      current_episode: null,
      title: {
        title_name: "Godzilla x Kong: The New Empire",
        type: "movie",
        year: 2024,
        poster: "https://image.tmdb.org/t/p/original/2YqZ6IyFk7menirwziJvfoVvSOh.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/sR0SpCrXamlIkYMdfz83sFn5JS6.jpg",
      },
      releaseGroup: {
        release_group_name: "GalaxyRG",
      },
    });
  });
});

describe("API | /file/versions", () => {
  test("Valid JSON Request with existing fileName and valid movie metadata", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "Kung.Fu.Panda.4.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.mkv";

    const response = await subtitles.request(`/file/versions/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        id: 3875,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/kung-fu-panda-4-1080p-yts-subdivx.srt?download=Kung.Fu.Panda.4.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
        subtitle_file_name: "Kung.Fu.Panda.4.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Kung Fu Panda 4",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/zS8BSQdbOesql0EWbs17kPvLoAT.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/kYgQzzjNis5jJalYtIHgrom0gOx.jpg",
        },
        releaseGroup: {
          release_group_name: "YTS",
        },
      },
      {
        id: 3876,
        resolution: "720p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/kung-fu-panda-4-720p-yts-subdivx.srt?download=Kung.Fu.Panda.4.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
        subtitle_file_name: "Kung.Fu.Panda.4.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Kung Fu Panda 4",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/zS8BSQdbOesql0EWbs17kPvLoAT.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/kYgQzzjNis5jJalYtIHgrom0gOx.jpg",
        },
        releaseGroup: {
          release_group_name: "YTS",
        },
      },
      {
        id: 3877,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/kung-fu-panda-4-1080p-yts-subdivx.srt?download=Kung.Fu.Panda.4.2024.1080p.WEBRip.x265.10bit.AAC5.1-[YTS.MX].srt",
        subtitle_file_name: "Kung.Fu.Panda.4.2024.1080p.WEBRip.x265.10bit.AAC5.1-[YTS.MX].srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Kung Fu Panda 4",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/zS8BSQdbOesql0EWbs17kPvLoAT.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/kYgQzzjNis5jJalYtIHgrom0gOx.jpg",
        },
        releaseGroup: {
          release_group_name: "YTS",
        },
      },
      {
        id: 3878,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/kung-fu-panda-4-1080p-galaxyrg-subdivx.srt?download=Kung.Fu.Panda.4.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
        subtitle_file_name: "Kung.Fu.Panda.4.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Kung Fu Panda 4",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/zS8BSQdbOesql0EWbs17kPvLoAT.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/kYgQzzjNis5jJalYtIHgrom0gOx.jpg",
        },
        releaseGroup: {
          release_group_name: "GalaxyRG",
        },
      },
      {
        id: 3879,
        resolution: "1080p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/kung-fu-panda-4-1080p-ethel-subdivx.srt?download=Kung.Fu.Panda.4.2024.1080p.WEB.h264-ETHEL.srt",
        subtitle_file_name: "Kung.Fu.Panda.4.2024.1080p.WEB.h264-ETHEL.srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Kung Fu Panda 4",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/zS8BSQdbOesql0EWbs17kPvLoAT.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/kYgQzzjNis5jJalYtIHgrom0gOx.jpg",
        },
        releaseGroup: {
          release_group_name: "ETHEL",
        },
      },
      {
        id: 3880,
        resolution: "2160p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/kung-fu-panda-4-2160p-flux-subdivx.srt?download=Kung.Fu.Panda.4.2024.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.srt",
        subtitle_file_name: "Kung.Fu.Panda.4.2024.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Kung Fu Panda 4",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/zS8BSQdbOesql0EWbs17kPvLoAT.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/kYgQzzjNis5jJalYtIHgrom0gOx.jpg",
        },
        releaseGroup: {
          release_group_name: "FLUX",
        },
      },
      {
        id: 3881,
        resolution: "720p",
        subtitle_link:
          "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/kung-fu-panda-4-720p-galaxyrg-subdivx.srt?download=Kung.Fu.Panda.4.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
        subtitle_file_name: "Kung.Fu.Panda.4.2024.720p.AMZN.WEBRip.800MB.x264-GalaxyRG.srt",
        current_season: null,
        current_episode: null,
        title: {
          title_name: "Kung Fu Panda 4",
          type: "movie",
          year: 2024,
          poster: "https://image.tmdb.org/t/p/original/zS8BSQdbOesql0EWbs17kPvLoAT.jpg",
          backdrop: "https://image.tmdb.org/t/p/original/kYgQzzjNis5jJalYtIHgrom0gOx.jpg",
        },
        releaseGroup: {
          release_group_name: "GalaxyRG",
        },
      },
    ]);
  });

  test("Valid JSON Request with existing fileName and invalid movie metadata", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "Road.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";

    const response = await subtitles.request(`/file/versions/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      message: "Title not found for file",
    });
  });

  test("Invalid JSON Request with wrong fileName type", async () => {
    const request = {
      method: "GET",
    };

    const fileName = "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3";

    const response = await subtitles.request(`/file/versions/${fileName}`, request, getMockEnv());
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data).toEqual({
      message: "File extension not supported",
    });
  });
});
