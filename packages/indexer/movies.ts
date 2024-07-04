import cliProgress from "cli-progress";
import tg from "torrent-grabber";

// db
import { supabase } from "@subtis/db";

// internals
import { getSubtitlesForTitle } from "./app";
import { getReleaseGroups } from "./release-groups";
import { getSubtitleGroups } from "./subtitle-groups";
import { getMoviesFromTmdb, getTmdbMovieFromTitle, getTmdbMoviesTotalPagesArray } from "./tmdb";

// core
export async function indexMoviesByYear(year: number, isDebugging: boolean): Promise<void> {
  try {
    await tg.activate("ThePirateBay");

    const releaseGroups = await getReleaseGroups(supabase);
    const subtitleGroups = await getSubtitleGroups(supabase);

    const { totalPages, totalResults } = await getTmdbMoviesTotalPagesArray(year, !isDebugging);
    console.log(`\n1.1) Con un total de ${totalResults} titulos en el año ${year}`);
    console.log(
      `\n1.2) ${totalPages.at(
        -1,
      )} páginas (con ${20} pelis c/u), con un total de ${totalResults} titulos en el año ${year}`,
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

    for await (const tmbdMoviesPage of totalPages) {
      console.log(`\n2) Buscando en página ${tmbdMoviesPage} de TMDB \n`);

      console.log("\nProgreso total del indexador:\n");
      totalMoviesResultBar.update(tmbdMoviesPage);

      const movies = await getMoviesFromTmdb(tmbdMoviesPage, year, !isDebugging);
      console.log(`\n\n3) titulos encontradas en página ${tmbdMoviesPage} \n`);

      console.table(movies.map(({ name, year, releaseDate, rating }) => ({ name, year, releaseDate, rating })));
      console.log("\n");

      for await (const [index, movie] of Object.entries(movies)) {
        if (isDebugging) {
          const value = confirm(`¿Desea skippear el titulo ${movie.name}?`);

          if (value === true) {
            continue;
          }
        }

        await getSubtitlesForTitle({
          index,
          currentTitle: { ...movie, episode: null, totalEpisodes: null, totalSeasons: null },
          releaseGroups,
          subtitleGroups,
          isDebugging,
          shouldUseTryCatch: true,
        });
      }
    }
  } catch (error) {
    console.log("mainIndexer => error =>", error);
    console.log("\n ~ mainIndexer ~ error message:", (error as Error).message);
  }
}

export async function indexMovieByName(name: string, isDebugging: boolean) {
  try {
    await tg.activate("ThePirateBay");

    const releaseGroups = await getReleaseGroups(supabase);
    const subtitleGroups = await getSubtitleGroups(supabase);

    const movie = await getTmdbMovieFromTitle(name);

    await getSubtitlesForTitle({
      index: "1",
      currentTitle: { ...movie, episode: null, totalEpisodes: null, totalSeasons: null },
      releaseGroups,
      subtitleGroups,
      isDebugging,
      shouldUseTryCatch: false,
    });
  } catch (error) {
    console.log("\n ~ indexMovieByName ~ error:", error);
  }
}

// testing
indexMoviesByYear(2024, false);
// indexMovieByName("Kung Fu Panda 4", false);

// saveReleaseGroupsToDb(supabase);
// saveSubtitleGroupsToDb(supabase);
