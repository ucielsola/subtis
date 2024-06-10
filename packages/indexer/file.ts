import tg from "torrent-grabber";

import { supabase } from "@subtis/db";

import { getTitleFileNameMetadata, getTitleFileNameWithoutExtension } from "@subtis/shared";
import invariant from "tiny-invariant";
import { getSubtitlesForTitle } from "./app";
import { getReleaseGroups, saveReleaseGroupsToDb } from "./release-groups";
import { getSubtitleGroups, saveSubtitleGroupsToDb } from "./subtitle-groups";
import {
  getMovieMetadataFromTmdbMovie,
  getTvShowMetadataFromTmdbTvShow,
  tmdbDiscoverMovieSchema,
  tmdbDiscoverSerieSchema,
} from "./tmdb";

// helpers
function getIsTvShow(title: string): boolean {
  return /s\d{2}e\d{2}/gi.test(title);
}

function getEpisode(title: string): string {
  return title.match(/s\d{2}e\d{2}/gi)?.[0] || "";
}

// core
async function indexTitleByFileName(titleFileName: string, isDebugging: boolean): Promise<void> {
  console.time(`Tardo en indexar ${titleFileName}`);

  try {
    await tg.activate("ThePirateBay");

    const releaseGroups = await getReleaseGroups(supabase);
    const subtitleGroups = await getSubtitleGroups(supabase);

    const isTvShow = getIsTvShow(titleFileName);
    console.log("\n ~ indexTitleByFileName ~ isTvShow:", isTvShow);

    const title = getTitleFileNameMetadata({ titleFileName });
    console.log("\n ~ indexTitleByFileName ~ title:", title);

    const query = getTitleFileNameWithoutExtension(titleFileName);
    console.log("\n ~ indexTitleByFileName ~ query:", query);

    let torrents = await tg.search(query, { groupByTracker: false });

    if (torrents.length === 0) {
      const newQuery = query.replaceAll(".", " ");
      console.log("\n ~ newQuery:", newQuery);
      torrents = await tg.search(newQuery, { groupByTracker: false });
    }

    if (torrents.length === 0) {
      const newQuery = `${title.name} ${title.year}`;
      console.log("\n ~ newQuery:", newQuery);
      torrents = await tg.search(newQuery, { groupByTracker: false });
    }

    if (torrents.length === 0) {
      const newQuery = title.name;
      console.log("\n ~ newQuery:", newQuery);
      torrents = await tg.search(newQuery, { groupByTracker: false });
    }

    invariant(torrents.length, "No se encontraron torrents para la busqueda");

    console.log("\n ~ indexTitleByFileName ~ torrents:", torrents);
    const torrent = torrents.find((torrent) => {
      return (
        title.releaseGroup?.file_attributes.some((fileAttribute) => torrent.title.includes(fileAttribute)) &&
        torrent.title.includes(title.resolution)
      );
    });
    console.log("\n ~ indexTitleByFileName ~ torrent:", torrent);

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
      console.log("\n ~ indexTitleByFileName ~ tvShow:", tvShow);

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
      console.log("\n ~ indexTitleByFileName ~ episode:", episode);

      await getSubtitlesForTitle({
        index: "0",
        currentTitle: { ...tvShowData, episode },
        releaseGroups,
        subtitleGroups,
        isDebugging,
        initialTorrents: [torrent],
      });

      return;
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
    console.log("\n ~ indexTitleByFileName ~ movie:", movie);

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

    console.log("\n ~ indexTitleByFileName ~ movieData:", movieData);

    await getSubtitlesForTitle({
      index: "0",
      initialTorrents: [torrent],
      currentTitle: { ...movieData, episode: null, totalEpisodes: null, totalSeasons: null },
      releaseGroups,
      subtitleGroups,
      isDebugging,
    });
  } catch (error) {
    await supabase.rpc("insert_subtitle_not_found", {
      _title_file_name: titleFileName,
    });

    console.log("mainIndexer => error =>", error);
    console.log("\n ~ mainIndexer ~ error message:", (error as Error).message);
  }

  console.timeEnd(`Tardo en indexar ${titleFileName}`);
}

// FILES
const titleFileName = "Oppenheimer.2023.1080p.BluRay.DD5.1.x264-GalaxyRG.mkv";
// const titleFileName = "shogun.2024.s01e04.1080p.web.h264-successfulcrab.mkv";

indexTitleByFileName(titleFileName, false);

// GENERAL
saveReleaseGroupsToDb(supabase);
saveSubtitleGroupsToDb(supabase);
