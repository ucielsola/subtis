import type { ServerWebSocket } from "bun";
import invariant from "tiny-invariant";
import tg from "torrent-grabber";
import TorrentSearchApi from "torrent-search-api";
import { z } from "zod";

// db
import { supabase } from "@subtis/db";

// shared
import { type TitleFileNameMetadata, getEpisode, getIsTvShow, getTitleFileNameMetadata } from "@subtis/shared";

// internals
import { apiClient } from "./api";
import { TitleTypes, type TorrentFound, getSubtitlesForTitle, getTitleTorrents } from "./app";
import { getReleaseGroups } from "./release-groups";
import { getSubDivXToken } from "./subdivx";
import { getSubDivxParameter } from "./subdivx-parameter";
import { getSubtitleGroups } from "./subtitle-groups";
import {
  getMovieMetadataFromTmdbMovie,
  getTvShowMetadataFromTmdbTvShow,
  tmdbDiscoverMovieSchema,
  tmdbDiscoverSerieSchema,
} from "./tmdb";
import type { IndexedBy } from "./types";
import { getQueryForTorrentProvider } from "./utils/query";
import { generateIdFromMagnet } from "./utils/torrent";

// schemas
export const wsMessageSchema = z.object({
  total: z.number(),
  message: z.string(),
});

export const wsOkSchema = z.object({
  ok: z.boolean(),
});

export type WsOk = z.infer<typeof wsOkSchema>;

// helpers
async function getTorrentFromPirateBayOr1337x(query: string, title: TitleFileNameMetadata) {
  await tg.activate("ThePirateBay");
  TorrentSearchApi.enableProvider("1337x");

  const torrents: TorrentFound[] = (await tg.search(query, { groupByTracker: false })) as unknown as TorrentFound[];

  if (torrents.length === 0) {
    const newQuery = query.replaceAll(".", " ");
    const newTorrents = (await tg.search(newQuery, { groupByTracker: false })) as unknown as TorrentFound[];

    if (newTorrents.length > 0) {
      torrents.push(...newTorrents);
    }
  }

  if (torrents.length === 0) {
    const newQuery = `${title.name} ${title.year}`;
    const newTorrents = (await tg.search(newQuery, { groupByTracker: false })) as unknown as TorrentFound[];

    if (newTorrents.length > 0) {
      torrents.push(...newTorrents);
    }
  }

  if (torrents.length === 0) {
    const newQuery = title.name;
    const newTorrents = (await tg.search(newQuery, { groupByTracker: false })) as unknown as TorrentFound[];

    if (newTorrents.length > 0) {
      torrents.push(...newTorrents);
    }
  }

  const torrentsTvShows1337x = await TorrentSearchApi.search(query, "TV", 10);
  const torrentsMovies1337x = await TorrentSearchApi.search(query, "Movies", 10);

  type TorrentSearchApiExteneded = TorrentSearchApi.Torrent & { seeds: number };

  const torrents1337xWithMagnet = await Promise.all(
    [...torrentsTvShows1337x, ...torrentsMovies1337x].map(async (torrent) => {
      const torrent1337x = torrent as TorrentSearchApiExteneded;
      const trackerId = await TorrentSearchApi.getMagnet(torrent);
      return {
        tracker: torrent1337x.provider,
        title: torrent1337x.title,
        size: torrent1337x.size,
        seeds: torrent1337x.seeds,
        trackerId,
        isBytesFormatted: true,
      };
    }),
  );

  if (torrents1337xWithMagnet.length > 0) {
    torrents.push(...torrents1337xWithMagnet);
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

  return { ...torrent, id: generateIdFromMagnet(torrent.trackerId) };
}

// core
export async function indexTitleByFileName({
  bytes,
  titleFileName,
  shouldStoreNotFoundSubtitle,
  isDebugging,
  websocket,
  indexedBy,
}: {
  bytes: number;
  titleFileName: string;
  shouldStoreNotFoundSubtitle: boolean;
  isDebugging: boolean;
  websocket?: ServerWebSocket<unknown>;
  indexedBy: IndexedBy;
}): Promise<{ ok: boolean }> {
  console.time("Tardo en indexar");

  try {
    const isTvShow = getIsTvShow(titleFileName);
    const title = getTitleFileNameMetadata({ titleFileName });

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.15, message: `Catalogando ${title.name}` }));
    }

    await tg.activate("ThePirateBay");

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
        genre_ids: genres,
        name: spanishName,
        original_name: name,
        first_air_date: releaseDate,
        vote_average: voteAverage,
        poster_path: posterPath,
        backdrop_path: backdropPath,
      } = tvShow;

      if (websocket) {
        websocket.send(JSON.stringify({ total: 0.45, message: `Buscando más información sobre ${title.name}` }));
      }

      const tvShowData = await getTvShowMetadataFromTmdbTvShow({
        id,
        name,
        genres,
        overview,
        spanishName,
        posterPath,
        releaseDate,
        voteAverage,
        backdropPath,
      });

      const episode = getEpisode(titleFileName);

      if (websocket) {
        websocket.send(JSON.stringify({ total: 0.6, message: "Buscando capitulo en nuestros proveedores" }));
      }

      const torrent = await getTorrentFromPirateBayOr1337x(
        `${title.name} S0${title.currentSeason}E${String(title.currentEpisode).length > 1 ? title.currentEpisode : `0${title.currentEpisode}`}`,
        title,
      );

      if (websocket) {
        websocket.send(JSON.stringify({ total: 0.75, message: "Buscando subtitulo en nuestros proveedores" }));
      }

      const parameter = await getSubDivxParameter();
      const { token, cookie } = await getSubDivXToken();

      await getSubtitlesForTitle({
        indexedBy,
        index: "1",
        currentTitle: { ...tvShowData, episode },
        releaseGroups,
        subtitleGroups,
        isDebugging,
        initialTorrents: [torrent],
        bytesFromNotFoundSubtitle: bytes,
        titleFileNameFromNotFoundSubtitle: titleFileName,
        shouldUseTryCatch: false,
        fromWebSocket: Boolean(websocket),
        subdivxToken: token,
        subdivxCookie: cookie,
        subdivxParameter: parameter,
      });

      if (websocket) {
        websocket.send(JSON.stringify({ total: 1, message: "Subtitulo encontrado" }));
      }

      return { ok: true };
    }

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.3, message: `Buscando información de ${title.name}` }));
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${title.name}&language=es-ES&page=1&primary_release_year=${title.year}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch movie data");
    }

    const data = await response.json();

    const movies = tmdbDiscoverMovieSchema.parse(data);
    const [movie] = movies.results;

    const {
      id,
      overview,
      genre_ids: genres,
      title: spanishName,
      original_title: name,
      release_date: releaseDate,
      vote_average: voteAverage,
      poster_path: posterPath,
      backdrop_path: backdropPath,
    } = movie;

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.45, message: `Buscando más información sobre ${title.name}` }));
    }

    const movieData = await getMovieMetadataFromTmdbMovie({
      id,
      name,
      genres,
      overview,
      spanishName,
      posterPath,
      releaseDate,
      voteAverage,
      backdropPath,
    });

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.6, message: "Buscando pelicula en nuestros proveedores" }));
    }

    const titleProviderQuery = getQueryForTorrentProvider({
      ...movieData,
      episode: null,
      totalSeasons: null,
      totalEpisodes: null,
    });

    const torrents = await getTitleTorrents(titleProviderQuery, TitleTypes.movie, movieData.imdbId);

    console.log("\n Torrents without filter \n");
    console.table(torrents.map(({ title, size, seeds }) => ({ title, size, seeds })));

    const torrent = torrents.find((torrent) => {
      const lowerCaseTorrentTitle = torrent.title.toLowerCase();

      const includesResolution = lowerCaseTorrentTitle.includes(title.resolution.toLowerCase());
      const includesReleaseGroup = title.releaseGroup?.release_group_name
        ? lowerCaseTorrentTitle.includes(title.releaseGroup.release_group_name.toLowerCase())
        : false;

      const includesFileAttributes = title.releaseGroup?.file_attributes.some((fileAttribute) => {
        return lowerCaseTorrentTitle.includes(fileAttribute.toLowerCase());
      });

      return (includesFileAttributes || includesReleaseGroup) && includesResolution;
    });

    const parameter = await getSubDivxParameter();
    const { token, cookie } = await getSubDivXToken();

    if (!torrent) {
      throw new Error("Torrent not found");
    }

    console.table([torrent].map(({ title, size, seeds }) => ({ title, size, seeds })));

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.75, message: "Buscando subtitulo en nuestros proveedores" }));
    }

    await getSubtitlesForTitle({
      indexedBy,
      index: "1",
      initialTorrents: [{ ...torrent, id: generateIdFromMagnet(torrent.trackerId) }],
      currentTitle: { ...movieData, episode: null, totalEpisodes: null, totalSeasons: null },
      releaseGroups,
      subtitleGroups,
      isDebugging,
      bytesFromNotFoundSubtitle: bytes,
      titleFileNameFromNotFoundSubtitle: titleFileName,
      shouldUseTryCatch: false,
      fromWebSocket: Boolean(websocket),
      subdivxToken: token,
      subdivxCookie: cookie,
      subdivxParameter: parameter,
    });

    if (websocket) {
      websocket.send(JSON.stringify({ total: 1, message: "Subtitulo encontrado" }));
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
// const titleFileName = "Scenes.From.A.Marriage.1974.1080p.BluRay.x264-[YTS.AM].mp4";
// const titleFileName = "Oppenheimer.2023.1080p.BluRay.DD5.1.x264-GalaxyRG.mkv";
// const bytes = 123123123;
// const titleFileName = "Inside.Out.2015.1080p.BluRay.x264.YIFY.mp4";

// indexTitleByFileName({
//   bytes,
//   titleFileName,
//   shouldStoreNotFoundSubtitle: true,
//   isDebugging: true,
//   indexedBy: "indexer-file",
// });

// GENERAL
// saveReleaseGroupsToDb(supabase);
// saveSubtitleGroupsToDb(supabase);
