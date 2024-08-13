import cliProgress from "cli-progress";
import tg from "torrent-grabber";

import { supabase } from "@subtis/db";

import { getSubtitlesForTitle } from "./app";
import { getReleaseGroups } from "./release-groups";
import { getSubtitleGroups } from "./subtitle-groups";
import { getTmdbTvShowsTotalPagesArray, getTvShowsFromTmdb } from "./tmdb";

// core
export async function indexSeriesByYear(seriesYear: number, isDebugging: boolean): Promise<void> {
  await tg.activate("ThePirateBay");

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
      if (isDebugging) {
        const value = await confirm(`¿Desea skippear el titulo ${tvShow.name}?`);

        if (value === true) {
          continue;
        }
      }

      for await (const [index, episode] of Object.entries(tvShow.episodes)) {
        // Only index the first 2 episodes for debugging mode
        if (isDebugging && Number(index) >= 2) {
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

// testing
indexSeriesByYear(2024, false);
