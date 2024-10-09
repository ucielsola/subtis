import { beforeAll } from "bun:test";

// indexer
import { indexMovieByName } from "@subtis/indexer/movies";
import { indexSeriesByName } from "@subtis/indexer/tv-shows";

beforeAll(async () => {
  await indexMovieByName({ year: 2022, name: "The Batman", isDebugging: false });
  await indexSeriesByName({ name: "Shogun", year: 2024, isDebugging: false });
});
