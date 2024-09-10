import { confirm } from "@clack/prompts";
import cliProgress from "cli-progress";
import tg from "torrent-grabber";
import TorrentSearchApi from "torrent-search-api";

// db
import { supabase } from "@subtis/db";

// internals
import { getSubtitlesForTitle } from "./app";
import { getReleaseGroups, saveReleaseGroupsToDb } from "./release-groups";
import { getSubtitleGroups } from "./subtitle-groups";
import { getTmdbTvShowFromTitle, getTmdbTvShowsTotalPagesArray, getTvShowsFromTmdb } from "./tmdb";

// core
export async function indexSeriesByYear(seriesYear: number, isDebugging: boolean): Promise<void> {
  await tg.activate("ThePirateBay");
  TorrentSearchApi.enableProvider("1337x");

  const releaseGroups = await getReleaseGroups(supabase);
  const subtitleGroups = await getSubtitleGroups(supabase);

  const { totalPages, totalResults } = await getTmdbTvShowsTotalPagesArray(seriesYear);
  console.log(`\n1.1) Con un total de ${totalResults} series en el año ${seriesYear}`);
  console.log(
    `\n1.2) ${totalPages.at(
      -1,
    )} páginas (con ${20} pelis c/u), con un total de ${totalResults} titulos en el año ${seriesYear}`,
    "\n",
  );

  const totalMoviesResultBar = new cliProgress.SingleBar(
    {
      format: "[{bar}] {percentage}% | Procesando {value}/{total} páginas de TMDB",
    },
    cliProgress.Presets.shades_classic,
  );
  totalMoviesResultBar.start(totalPages.length, 0);
  console.log("\n");

  for await (const tmbdSeriesPage of totalPages) {
    console.log(`\n2) Buscando en página ${tmbdSeriesPage} de TMDB \n`);

    console.log("\nProgreso total del indexador:\n");
    totalMoviesResultBar.update(tmbdSeriesPage);

    const tvShows = await getTvShowsFromTmdb(tmbdSeriesPage, seriesYear);

    console.log(`\n\n3) titulos encontradas en página ${tmbdSeriesPage} \n`);
    console.table(
      tvShows.map(({ name, year, releaseDate, rating, episodes, totalSeasons, totalEpisodes }) => ({
        name,
        year,
        releaseDate,
        rating,
        episodes,
        totalSeasons,
        totalEpisodes,
      })),
    );
    console.log("\n");

    for await (const tvShow of tvShows) {
      // if (Number(index) < 5) {
      //   continue;
      // }

      if (isDebugging) {
        const value = await confirm({
          message: `¿Desea saltar el titulo ${tvShow.name}?`,
          initialValue: false,
        });

        if (value === true) {
          continue;
        }
      }

      for await (const [index, episode] of Object.entries(tvShow.episodes)) {
        // Only index the first 2 episodes for debugging mode
        if (Number(index) > 1) {
          break;
        }

        await getSubtitlesForTitle({
          index,
          currentTitle: { ...tvShow, episode },
          releaseGroups,
          subtitleGroups,
          isDebugging,
          shouldUseTryCatch: true,
        });
      }
    }
  }
}

export async function indexSeriesByName({
  name,
  year,
  isDebugging,
}: {
  name: string;
  year?: number;
  isDebugging: boolean;
}) {
  try {
    await tg.activate("ThePirateBay");
    TorrentSearchApi.enableProvider("1337x");

    const releaseGroups = await getReleaseGroups(supabase);
    const subtitleGroups = await getSubtitleGroups(supabase);

    const tvShow = await getTmdbTvShowFromTitle(name, year);
    console.log("\n ~ tvShow:", tvShow);

    for await (const [index, episode] of Object.entries(tvShow.episodes)) {
      await getSubtitlesForTitle({
        index,
        currentTitle: { ...tvShow, episode },
        releaseGroups,
        subtitleGroups,
        isDebugging,
        shouldUseTryCatch: true,
      });
    }
  } catch (error) {
    console.log("\n ~ indexMovieByName ~ error:", error);
  }
}

// testing
// indexSeriesByYear(2024, true);
indexSeriesByName({ name: "Rabbit Hole", year: 2023, isDebugging: true });
saveReleaseGroupsToDb(supabase);
