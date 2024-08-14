import type { ServerWebSocket } from "bun";
import invariant from "tiny-invariant";
import tg from "torrent-grabber";
import { P, match } from "ts-pattern";

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
import { getYtsTorrent } from "./yts";

async function getTorrentFromPirateBay(query: string, title: TitleFileNameMetadata) {
  await tg.activate("ThePirateBay");

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

      const torrent = await getTorrentFromPirateBay(query, title);

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
        fromWebSocket: true,
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

    if (!torrent) {
      throw new Error("Torrent not found");
    }

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
      fromWebSocket: true,
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
