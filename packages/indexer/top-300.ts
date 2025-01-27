import { indexMovieByName } from "./movies";
import top300 from "./top-300-rotten.json";

let lastIndexedMovieName = "Portrait of a Lady on Fire";

async function indexTop300FromRottenTomatoes() {
  console.time("Indexing top 300 from Rotten Tomatoes");

  const lastIndexedMovie = top300.findIndex((movie) => movie.name === lastIndexedMovieName);

  const fromArgo = top300.slice(lastIndexedMovie + 1);
  console.log("\n ~ indexTop300FromRottenTomatoes ~ fromArgo:", fromArgo);

  const leftTotal = fromArgo.length;
  console.log("\n ~ indexTop300FromRottenTomatoes ~ leftTotal:", leftTotal);

  for await (const movie of fromArgo) {
    console.log(`Indexing ${movie.name} (${movie.year})`);
    await indexMovieByName({
      name: movie.name,
      year: movie.year,
      isDebugging: false,
    });

    lastIndexedMovieName = movie.name;
  }
  console.timeEnd("Indexing top 300 from Rotten Tomatoes");
}

indexTop300FromRottenTomatoes();

// quedo en Argo 2012
