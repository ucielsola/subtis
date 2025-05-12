import type { ServerWebSocket } from "bun";
import filesizeParser from "filesize-parser";
import prettyBytes from "pretty-bytes";
import invariant from "tiny-invariant";
import TorrentSearchApi from "torrent-search-api";
import { z } from "zod";

// db
import { supabase } from "@subtis/db";

// shared
import {
  type TitleFileNameMetadata,
  getEpisode,
  getIsTvShow,
  getTitleFileNameMetadata,
  setSubtitleNotFound,
} from "@subtis/shared";

// internals
import { apiClient } from "./api";
import { TitleTypes, type TorrentFound, getFileTitleTorrents, getSubtitlesForTitle } from "./app";
import { FILE_NAME_TO_TMDB_INDEX } from "./edge-cases";
import { getReleaseGroups } from "./release-groups";
import { getSubDivXParameter, getSubDivXToken } from "./subdivx";
import { getSubtitleGroups } from "./subtitle-groups";
import {
  getMovieMetadataFromTmdbMovie,
  getTvShowMetadataFromTmdbTvShow,
  tmdbDiscoverMovieSchema,
  tmdbDiscoverSerieSchema,
} from "./tmdb";
import tg from "./torrent-grabber";
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
async function getTorrentFromPirateBayOr1337x(
  query: string,
  title: TitleFileNameMetadata,
): Promise<
  TorrentFound & {
    id: number;
    bytes: number;
    formattedBytes: string;
  }
> {
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

  let torrents1337xWithMagnet: TorrentFound[] = [];

  try {
    const torrentsTvShows1337x = await TorrentSearchApi.search(query, "TV", 10);
    const torrentsMovies1337x = await TorrentSearchApi.search(query, "Movies", 10);

    type TorrentSearchApiExteneded = TorrentSearchApi.Torrent & { seeds: number };

    torrents1337xWithMagnet = await Promise.all(
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
  } catch (error) {
    console.log("Error on getTitleTorrents using TorrentSearchApi.search interface");
    console.log(error);
  }

  if (torrents1337xWithMagnet.length > 0) {
    torrents.push(...torrents1337xWithMagnet);
  }

  invariant(torrents.length, "No se encontraron torrents para la busqueda");

  const torrent = torrents.find((torrent) => {
    const lowerCaseTorrentTitle = torrent.title.toLowerCase();

    return (
      title.releaseGroup?.matches.some((match) => lowerCaseTorrentTitle.includes(match.toLowerCase())) &&
      lowerCaseTorrentTitle.includes(title.resolution.toLowerCase())
    );
  });

  invariant(torrent, "Torrent not found");

  const bytes = torrent.isBytesFormatted ? filesizeParser(torrent.size) : (torrent.size as number);
  const formattedBytes = prettyBytes(bytes);

  return { ...torrent, id: generateIdFromMagnet(torrent.trackerId), bytes, formattedBytes };
}

// core
export async function indexTitleByFileName({
  bytes,
  titleFileName,
  shouldStoreNotFoundSubtitle,
  isDebugging,
  websocket,
  indexedBy,
  shouldIndexAllTorrents,
}: {
  bytes: number;
  titleFileName: string;
  shouldStoreNotFoundSubtitle: boolean;
  isDebugging: boolean;
  websocket?: ServerWebSocket<unknown>;
  indexedBy: IndexedBy;
  shouldIndexAllTorrents: boolean;
}): Promise<{ ok: boolean }> {
  const t0 = performance.now();

  try {
    if (websocket) {
      websocket.send(JSON.stringify({ total: 0, message: "Obteniendo información del archivo" }));
    }

    const isTvShow = getIsTvShow(titleFileName);
    console.log("\n ~ isTvShow:", isTvShow);
    const title = getTitleFileNameMetadata({ titleFileName });
    console.log("\n ~ title:", title);

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.05, message: "Obteniendo proveedores de subtítulos" }));
    }

    const [releaseGroups, subtitleGroups] = await Promise.all([
      getReleaseGroups(supabase),
      getSubtitleGroups(supabase),
    ]);

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.1, message: "Obteniendo proveedores de subtítulos" }));
    }

    if (isTvShow) {
      if (websocket) {
        websocket.send(JSON.stringify({ total: 0.3, message: `Buscando información de ${title.name}` }));
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?query=${title.name}&include_adult=false&language=es-MX&page=1`,
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
        genre_ids: genres,
        name: spanishName,
        original_name: name,
        first_air_date: releaseDate,
        vote_average: voteAverage,
      } = tvShow;

      if (websocket) {
        websocket.send(JSON.stringify({ total: 0.45, message: `Buscando más información sobre ${title.name}` }));
      }

      const tvShowData = await getTvShowMetadataFromTmdbTvShow({
        id,
        name,
        genres,
        spanishName,
        releaseDate,
        voteAverage,
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
        websocket.send(JSON.stringify({ total: 0.75, message: "Buscando subtítulo en nuestros proveedores" }));
      }

      const parameter = await getSubDivXParameter();
      const { token, cookie } = await getSubDivXToken();

      await getSubtitlesForTitle({
        indexedBy,
        index: "1",
        currentTitle: { ...tvShowData, episode, certification: null },
        releaseGroups,
        subtitleGroups,
        isDebugging,
        initialTorrents: shouldIndexAllTorrents ? undefined : [torrent],
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
      websocket.send(JSON.stringify({ total: 0.1, message: `Buscando información de ${title.name}` }));
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${title.name}&year=${title.year}&language=en-US`,
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
    // const sortedMoviesByVoteCount = movies.results.toSorted((a, b) => (a.vote_count < b.vote_count ? 1 : -1));
    // console.log("\n ~ sortedMoviesByVoteCount:", sortedMoviesByVoteCount);

    if (movies.results.length === 0) {
      throw new Error("No se encontraron peliculas");
    }

    const index = FILE_NAME_TO_TMDB_INDEX[titleFileName as keyof typeof FILE_NAME_TO_TMDB_INDEX] ?? 0;
    const movie = movies.results[index];

    const { id, title: name, genre_ids: genres, release_date: releaseDate, vote_average: voteAverage } = movie;

    const movieData = await getMovieMetadataFromTmdbMovie({
      id,
      name,
      genres,
      releaseDate,
      voteAverage,
    });

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.45, message: `Buscando información de ${title.name}` }));
    }

    if (websocket) {
      websocket.send(JSON.stringify({ total: 0.45, message: "Buscando pelicula en nuestros proveedores" }));
    }

    const titleProviderQuery = getQueryForTorrentProvider({
      ...movieData,
      year: title.year ?? movieData.year,
      episode: null,
      totalSeasons: null,
      totalEpisodes: null,
    });

    if (!shouldIndexAllTorrents) {
      const query = `${titleProviderQuery} ${title.resolution ? `${title.resolution}p` : ""}`;
      const torrents = await getFileTitleTorrents(query, TitleTypes.movie, movieData.imdbId);

      console.log("\n Torrents without filter \n");
      console.table(torrents.map(({ title, size, seeds }) => ({ title, size, seeds })));

      const [parameter, { token, cookie }] = await Promise.all([getSubDivXParameter(), getSubDivXToken()]);

      if (websocket) {
        websocket.send(JSON.stringify({ total: 0.6, message: "Buscando subtítulos en nuestros proveedores" }));
      }

      const wsSubtitleHasBeenFound = await getSubtitlesForTitle({
        indexedBy,
        index: "1",
        initialTorrents: shouldIndexAllTorrents ? undefined : torrents,
        currentTitle: { ...movieData, episode: null, totalEpisodes: null, totalSeasons: null },
        releaseGroups,
        subtitleGroups,
        isDebugging,
        bytesFromNotFoundSubtitle: bytes,
        titleFileNameFromNotFoundSubtitle: titleFileName,
        shouldUseTryCatch: true,
        fromWebSocket: Boolean(websocket),
        subdivxToken: token,
        subdivxCookie: cookie,
        subdivxParameter: parameter,
      });

      if (wsSubtitleHasBeenFound) {
        const t1 = performance.now();
        const totalTime = t1 - t0;
        const totalTimeInSeconds = Number((totalTime / 1000).toFixed(2));

        await supabase
          .from("Subtitles")
          .update({ time_to_index_in_s: totalTimeInSeconds })
          .eq("title_file_name", titleFileName);

        if (websocket) {
          websocket.send(JSON.stringify({ total: 1, message: "Subtitulo encontrado" }));
        }
      }

      if (!wsSubtitleHasBeenFound) {
        if (websocket) {
          websocket.send(JSON.stringify({ total: 1, message: "No se encontró subtítulo" }));
        }

        throw new Error("No se encontró subtítulo");
      }
    }

    return { ok: true };
  } catch (error) {
    console.log("\n ~ error:", error);

    if (shouldStoreNotFoundSubtitle) {
      await setSubtitleNotFound(apiClient, { bytes: String(bytes), fileName: titleFileName });
    }

    console.log("mainIndexer => error =>", error);
    console.log("\n ~ mainIndexer ~ error message:", (error as Error).message);

    return { ok: false };
  }
}
// FILES
// const titleFileName = "Scenes.From.A.Marriage.1974.1080p.BluRay.x264-[YTS.AM].mp4";
// const titleFileName = "Oppenheimer.2023.1080p.BluRay.DD5.1.x264-GalaxyRG.mkv";

const bytes = 873658721312;
const titleFileName = "Fast.and.Furious.F9.The.Fast.Saga.2021.1080p.WEBRip.x264-RARBG.mp4";

indexTitleByFileName({
  bytes,
  titleFileName,
  shouldStoreNotFoundSubtitle: true,
  isDebugging: true,
  indexedBy: "indexer-file",
  shouldIndexAllTorrents: false,
});

// // GENERAL
// saveReleaseGroupsToDb(supabase);
// saveSubtitleGroupsToDb(supabase);
