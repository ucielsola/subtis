import type { ServerWebSocket } from "bun";
import invariant from "tiny-invariant";
import tg from "torrent-grabber";
import { P, match } from "ts-pattern";
import { z } from "zod";

// db
import { supabase } from "@subtis/db";

// shared
import {
  type TitleFileNameMetadata,
  getEpisode,
  getIsTvShow,
  getTitleFileNameMetadata,
  getTitleFileNameWithoutExtension,
} from "@subtis/shared";

// internals
import { apiClient } from "./api-client";
import { getSubtitlesForTitle } from "./app";
import { getReleaseGroups } from "./release-groups";
import { getSubtitleGroups } from "./subtitle-groups";
import {
  getMovieMetadataFromTmdbMovie,
  getTvShowMetadataFromTmdbTvShow,
  tmdbDiscoverMovieSchema,
  tmdbDiscoverSerieSchema,
} from "./tmdb";

// schemas
const ytsSchema = z.object({
  status: z.string(),
  status_message: z.string(),
  data: z.object({
    movie: z.object({
      id: z.number(),
      url: z.string(),
      imdb_code: z.string(),
      title: z.string().nullable(),
      title_english: z.string().nullable(),
      title_long: z.string(),
      slug: z.string().nullable(),
      year: z.number(),
      rating: z.number(),
      runtime: z.number(),
      genres: z.array(z.string()),
      like_count: z.number(),
      description_intro: z.string().nullable(),
      description_full: z.string().nullable(),
      yt_trailer_code: z.string().nullable(),
      language: z.string().nullable(),
      mpa_rating: z.string().nullable(),
      background_image: z.string().optional(),
      background_image_original: z.string().optional(),
      small_cover_image: z.string().optional(),
      medium_cover_image: z.string().optional(),
      large_cover_image: z.string().optional(),
      medium_screenshot_image1: z.string().optional(),
      medium_screenshot_image2: z.string().optional(),
      medium_screenshot_image3: z.string().optional(),
      large_screenshot_image1: z.string().optional(),
      large_screenshot_image2: z.string().optional(),
      large_screenshot_image3: z.string().optional(),
      cast: z
        .array(
          z.object({
            name: z.string(),
            character_name: z.string(),
            url_small_image: z.string(),
            imdb_code: z.string(),
          }),
        )
        .optional(),
      torrents: z.array(
        z.object({
          url: z.string(),
          hash: z.string(),
          quality: z.string(),
          type: z.string(),
          is_repack: z.string(),
          video_codec: z.string(),
          bit_depth: z.string(),
          audio_channels: z.string(),
          seeds: z.number(),
          peers: z.number(),
          size: z.string(),
          size_bytes: z.number(),
          date_uploaded: z.string(),
          date_uploaded_unix: z.number(),
        }),
      ),
      date_uploaded: z.string(),
      date_uploaded_unix: z.number(),
    }),
  }),
  "@meta": z.object({
    server_time: z.number(),
    server_timezone: z.string(),
    api_version: z.number(),
    execution_time: z.string(),
  }),
});

async function getYtsTorrent(imdbId: number, resolution: string) {
  // https://github.com/BrokenEmpire/YTS/blob/master/API.md
  console.log("\n ~ getYtsTorrent ~ imdbId:", imdbId);
  const response = await fetch(
    `https://yts.am/api/v2/movie_details.json?imdb_id=${imdbId}&with_images=false&with_cast=false`,
  );
  const data = await response.json();
  console.log("\n ~ getYtsTorrent ~ data:", data);

  const yts = ytsSchema.parse(data);
  console.log("\n ~ getYtsTorrents ~ yts:", yts);

  const { torrents } = yts.data.movie;

  const torrent = torrents.find((torrent) => torrent.quality === resolution);

  invariant(torrent, "Torrent not found");

  // TODO: Create Hash for torrent
  const trackers = [
    "udp://open.demonii.com:1337/announce",
    "udp://tracker.openbittorrent.com:80",
    "udp://tracker.coppersurfer.tk:6969",
    "udp://glotorrents.pw:6969/announce",
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://torrent.gresille.org:80/announce",
    "udp://p4p.arenabg.com:1337",
    "udp://p4p.arenabg.ch:1337",
    "udp://tracker.leechers-paradise.org:6969",
    "udp://tracker.internetwarriors.net:1337",
  ];

  const tr = trackers.join("&tr=");
  const dn = encodeURIComponent(yts.data.movie.title || yts.data.movie.title_long);

  const trackerId = `magnet:?xt=urn:btih:${torrent.hash}&dn=${dn}&tr=${tr}`;

  console.log("\n ~ getYtsTorrent ~ trackerId:", trackerId);
  return {
    tracker: "YTS",
    title: `${yts.data.movie.title_long} YTS`,
    size: torrent.size_bytes,
    trackerId,
    id: torrent.hash,
    seeds: torrent.seeds,
  };
}

async function getTorrentFromPirateBay(query: string, title: TitleFileNameMetadata) {
  await tg.activate("ThePirateBay");

  console.log("\n ~ getTorrentFromPirateBay ~ query:", query);
  let torrents = await tg.search(query, { groupByTracker: false });

  if (torrents.length === 0) {
    const newQuery = query.replaceAll(".", " ");
    torrents = await tg.search(newQuery, { groupByTracker: false });
  }

  if (torrents.length === 0) {
    const newQuery = `${title.name} ${title.year}`;
    torrents = await tg.search(newQuery, { groupByTracker: false });
  }

  if (torrents.length === 0) {
    const newQuery = title.name;
    torrents = await tg.search(newQuery, { groupByTracker: false });
  }

  invariant(torrents.length, "No se encontraron torrents para la busqueda");

  const torrent = torrents.find((torrent) => {
    const lowerCaseTorrentTitle = torrent.title.toLowerCase();
    console.log("\n ~ torrent ~ lowerCaseTorrentTitle:", lowerCaseTorrentTitle);

    return (
      title.releaseGroup?.file_attributes.some((fileAttribute) =>
        lowerCaseTorrentTitle.includes(fileAttribute.toLowerCase()),
      ) && lowerCaseTorrentTitle.includes(title.resolution.toLowerCase())
    );
  });

  invariant(torrent, "Torrent not found");

  return torrent;
}

// core
export async function indexTitleByFileName({
  bytes,
  titleFileName,
  shouldStoreNotFoundSubtitle,
  isDebugging,
  websocket,
}: {
  bytes: number;
  titleFileName: string;
  shouldStoreNotFoundSubtitle: boolean;
  isDebugging: boolean;
  websocket?: ServerWebSocket<unknown>;
}): Promise<{ ok: boolean }> {
  console.time("Tardo en indexar");

  try {
    const isTvShow = getIsTvShow(titleFileName);
    const title = getTitleFileNameMetadata({ titleFileName });
    const query = getTitleFileNameWithoutExtension(titleFileName);

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.15, message: `Catalogando ${title.name}` }));
    }

    const releaseGroups = await getReleaseGroups(supabase);
    const subtitleGroups = await getSubtitleGroups(supabase);

    // 0.15
    // 0.3
    // 0.45
    // 0.6
    // 0.75
    // 1

    if (isTvShow) {
      if (websocket) {
        websocket.send(JSON.stringify({ total: 0.3, message: `Buscando información de ${title.name}` }));
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?query=${title.name}&include_adult=false&language=es-ES&page=1`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        },
      );

      const data = await response.json();

      const tvShows = tmdbDiscoverSerieSchema.parse(data);

      const [tvShow] = tvShows.results;

      const {
        id,
        overview,
        name: spanishName,
        original_name: name,
        first_air_date: releaseDate,
        vote_average: voteAverage,
        poster_path: posterPath,
        backdrop_path: backdropPath,
      } = tvShow;

      if (websocket) {
        websocket.send(JSON.stringify({ total: 0.45, message: `Buscando más información de ${title.name}` }));
      }

      const tvShowData = await getTvShowMetadataFromTmdbTvShow({
        id,
        name,
        overview,
        spanishName,
        posterPath,
        releaseDate,
        voteAverage,
        backdropPath,
      });

      const episode = getEpisode(titleFileName);

      if (websocket) {
        websocket.send(JSON.stringify({ total: 0.6, message: "Buscando subtitulo en nuestros proveedores" }));
      }

      console.log("\n ~ tvShowData:", tvShowData);

      if (websocket) {
        websocket.send(JSON.stringify({ total: 0.75, message: "Buscando archivo con nuestros proveedores" }));
      }

      const torrent = await match(title.releaseGroup?.release_group_name)
        .with("YTS", () => getYtsTorrent(tvShowData.imdbId, title.resolution))
        .with(P._, () => getTorrentFromPirateBay(query, title))
        .exhaustive();

      console.log("\n ~ indexTitleByFileName ~ torrent:", torrent);

      await getSubtitlesForTitle({
        index: "1",
        currentTitle: { ...tvShowData, episode },
        releaseGroups,
        subtitleGroups,
        isDebugging,
        initialTorrents: [torrent],
        bytesFromNotFoundSubtitle: bytes,
        titleFileNameFromNotFoundSubtitle: titleFileName,
        shouldUseTryCatch: false,
      });

      if (websocket) {
        websocket.send(JSON.stringify({ total: 1, message: "Buscando subtitulo en nuestros proveedores" }));
      }

      return { ok: true };
    }

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.3, message: `Buscando información de ${title.name}` }));
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${title.name}&language=es-ES&page=1`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      },
    );

    const data = await response.json();

    const movies = tmdbDiscoverMovieSchema.parse(data);

    const [movie] = movies.results;

    const {
      id,
      overview,
      title: spanishName,
      original_title: name,
      release_date: releaseDate,
      vote_average: voteAverage,
      poster_path: posterPath,
      backdrop_path: backdropPath,
    } = movie;

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.45, message: `Buscando más información de ${title.name}` }));
    }

    const movieData = await getMovieMetadataFromTmdbMovie({
      id,
      name,
      overview,
      spanishName,
      posterPath,
      releaseDate,
      voteAverage,
      backdropPath,
    });

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.6, message: "Buscando subtitulo en nuestros proveedores" }));
    }

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.75, message: "Buscando archivo con nuestros proveedores" }));
    }

    const torrent = await match(title.releaseGroup?.release_group_name)
      .with("YTS", () => getYtsTorrent(movieData.imdbId, title.resolution))
      .with(P._, () => getTorrentFromPirateBay(query, title))
      .exhaustive();

    await getSubtitlesForTitle({
      index: "1",
      initialTorrents: [torrent],
      currentTitle: { ...movieData, episode: null, totalEpisodes: null, totalSeasons: null },
      releaseGroups,
      subtitleGroups,
      isDebugging,
      bytesFromNotFoundSubtitle: bytes,
      titleFileNameFromNotFoundSubtitle: titleFileName,
      shouldUseTryCatch: false,
    });

    if (websocket) {
      websocket.send(JSON.stringify({ total: 1, message: "Buscando subtitulo en nuestros proveedores" }));
    }

    return { ok: true };
  } catch (error) {
    if (shouldStoreNotFoundSubtitle) {
      await apiClient.v1.subtitle["not-found"].$post({
        json: { bytes, titleFileName },
      });
    }

    console.log("mainIndexer => error =>", error);
    console.log("\n ~ mainIndexer ~ error message:", (error as Error).message);

    return { ok: false };
  } finally {
    console.timeEnd("Tardo en indexar");
  }
}

// FILES
// const bytes = 123123123;
// const titleFileName = "Scenes.From.A.Marriage.1974.1080p.BluRay.x264-[YTS.AM].mp4";
// const titleFileName = "Oppenheimer.2023.1080p.BluRay.DD5.1.x264-GalaxyRG.mkv";
// const titleFileName = "shogun.2024.s01e04.1080p.web.h264-successfulcrab.mkv";

// indexTitleByFileName({
//   bytes,
//   titleFileName,
//   shouldStoreNotFoundSubtitle: true,
//   isDebugging: true,
// });

// GENERAL
// saveReleaseGroupsToDb(supabase);
// saveSubtitleGroupsToDb(supabase);
