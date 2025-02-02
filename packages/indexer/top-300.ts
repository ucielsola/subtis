import { indexMovieByName } from "./movies";
import top300 from "./top-300-rotten.json";

let lastIndexedMovieName = "";
console.log("\n ~ lastIndexedMovieName:", lastIndexedMovieName);

async function indexTop300FromRottenTomatoes() {
  console.time("Indexing top 300 from Rotten Tomatoes");

  // const lastIndexedMovie = top300.findIndex((movie) => movie.name === lastIndexedMovieName);

  // const fromLastIndexedMovie = top300.slice(lastIndexedMovie + 1);
  // console.log("\n ~ indexTop300FromRottenTomatoes ~ fromLastIndexedMovie:", fromLastIndexedMovie);

  // const leftTotal = fromLastIndexedMovie.length;
  // console.log("\n ~ indexTop300FromRottenTomatoes ~ leftTotal:", leftTotal);

  for await (const movie of top300) {
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
