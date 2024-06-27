import invariant from "tiny-invariant";
import tg from "torrent-grabber";

// db
import { supabase } from "@subtis/db";

// shared
import { getTitleFileNameMetadata, getTitleFileNameWithoutExtension } from "@subtis/shared";

// internals
import { getSubtitlesForTitle } from "./app";
import { getReleaseGroups } from "./release-groups";
import { getSubtitleGroups } from "./subtitle-groups";
import {
  getMovieMetadataFromTmdbMovie,
  getTvShowMetadataFromTmdbTvShow,
  tmdbDiscoverMovieSchema,
  tmdbDiscoverSerieSchema,
} from "./tmdb";

// constants

// helpers
function getIsTvShow(title: string): boolean {
  return /s\d{2}e\d{2}/gi.test(title);
}

function getEpisode(title: string): string {
  return title.match(/s\d{2}e\d{2}/gi)?.[0] || "";
}

// core
export async function indexTitleByFileName({
  bytes,
  titleFileName,
  shouldStoreNotFoundSubtitle,
  isDebugging,
}: {
  bytes: number;
  titleFileName: string;
  shouldStoreNotFoundSubtitle: boolean;
  isDebugging: boolean;
}): Promise<{ ok: boolean }> {
  console.time("Tardo en indexar");

  try {
    await tg.activate("ThePirateBay");

    const releaseGroups = await getReleaseGroups(supabase);
    const subtitleGroups = await getSubtitleGroups(supabase);

    const isTvShow = getIsTvShow(titleFileName);

    const title = getTitleFileNameMetadata({ titleFileName });

    const query = getTitleFileNameWithoutExtension(titleFileName);

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
      return (
        title.releaseGroup?.file_attributes.some((fileAttribute) => torrent.title.includes(fileAttribute)) &&
        torrent.title.includes(title.resolution)
      );
    });

    invariant(torrent, "Torrent not found");

    if (isTvShow) {
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

      await getSubtitlesForTitle({
        index: "0",
        currentTitle: { ...tvShowData, episode },
        releaseGroups,
        subtitleGroups,
        isDebugging,
        initialTorrents: [torrent],
        bytesFromNotFoundSubtitle: bytes,
        titleFileNameFromNotFoundSubtitle: titleFileName,
      });

      return { ok: true };
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${title.name}&include_adult=false&language=es-ES&page=1`,
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

    await getSubtitlesForTitle({
      index: "0",
      initialTorrents: [torrent],
      currentTitle: { ...movieData, episode: null, totalEpisodes: null, totalSeasons: null },
      releaseGroups,
      subtitleGroups,
      isDebugging,
      bytesFromNotFoundSubtitle: bytes,
      titleFileNameFromNotFoundSubtitle: titleFileName,
    });

    return { ok: true };
  } catch (error) {
    if (shouldStoreNotFoundSubtitle) {
      supabase.from("SubtitlesNotFound").insert({
        bytes,
        title_file_name: titleFileName,
        run_times: 1,
      });
      // await apiClient.v1.subtitles["not-found"].$post({
      //   json: { bytes, titleFileName },
      // });
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
