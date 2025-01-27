import { indexMovieByName } from "./movies";
import top300 from "./top-300-rotten.json";

async function indexTop300FromRottenTomatoes() {
  console.time("Indexing top 300 from Rotten Tomatoes");

  const argoIndex = top300.findIndex((movie) => movie.name === "Argo");

  const fromArgo = top300.slice(argoIndex);
  console.log("\n ~ indexTop300FromRottenTomatoes ~ fromArgo:", fromArgo);
  for await (const movie of fromArgo) {
    console.log(`Indexing ${movie.name} (${movie.year})`);
    await indexMovieByName({
      name: movie.name,
      year: movie.year,
      isDebugging: false,
    });
  }
  console.timeEnd("Indexing top 300 from Rotten Tomatoes");
}

indexTop300FromRottenTomatoes();

// quedo en Argo 2012
