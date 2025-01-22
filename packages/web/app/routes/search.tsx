import type { MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "use-debounce";

// shared
import { getApiClient } from "@subtis/shared/ui/client";

// ui
import { Lens } from "~/components/ui/lens";

// features
import { AutocompleteTitles } from "~/features/search/autocomplete-titles";
import { PosterTitles } from "~/features/search/poster-titles";

// types
type Result = {
  value: string;
  label: string;
  poster: string | null;
  posterThumbHash: string | null;
};

// loader
export const loader = async () => {
  const apiClient = getApiClient({
    apiBaseUrl: "https://api.subt.is" as string,
  });

  const trendingSearchResponse = await apiClient.v1.titles.trending.search[":limit"].$get({
    param: {
      limit: "2",
    },
  });

  if (!trendingSearchResponse.ok) {
    throw new Error("Failed to fetch trending search titles");
  }

  const trendingSearch = await trendingSearchResponse.json();

  if ("message" in trendingSearch) {
    throw new Error("Failed to fetch trending search titles");
  }

  const parsedTrendingSearch = trendingSearch.results.map((result) => ({
    title: result.title_name,
    year: result.year,
    imdbId: result.imdb_id,
    searchedTimes: result.searched_times,
  }));

  return {
    trendingSearch: parsedTrendingSearch,
  };
};

// meta
export const meta: MetaFunction = () => {
  return [
    { title: "Subtis | Búsqueda en catálogo" },
    { name: "description", content: "Subtítutlos para todas tus películas" },
  ];
};

// constants
const MINIMUM_CHARACTERS = 2;

export default function SearchPage() {
  // remix hooks
  const { trendingSearch } = useLoaderData<typeof loader>();

  // react hooks
  const [inputValue, setInputValue] = useState<string>("");

  // debounce hooks
  const [value] = useDebounce(inputValue, 400);

  // query hooks
  const { data, isLoading, error } = useQuery({
    queryKey: ["titles", value],
    queryFn: async ({ queryKey }) => {
      const [, query] = queryKey;

      if (!query) {
        return { results: [] as Result[], statusCode: 400 };
      }

      const apiClient = getApiClient({
        apiBaseUrl: "https://api.subt.is",
      });

      const response = await apiClient.v1.titles.search[":query"].$get({
        param: { query },
      });

      const data = await response.json();

      if ("message" in data) {
        return { results: [] as Result[], statusCode: response.status };
      }

      const parsedResults = data.results
        .filter((result) => result.type === "movie")
        .map((result) => ({
          poster: result.poster,
          value: String(result.imdb_id),
          posterThumbHash: result.poster_thumbhash,
          label: `${result.title_name} (${result.year})`,
        }));

      return { results: parsedResults, statusCode: response.status };
    },
    enabled: Boolean(inputValue && inputValue.length >= MINIMUM_CHARACTERS),
  });

  // handlers
  function handleClearInputValue(): void {
    setInputValue("");
  }

  // constants
  const [firstTrending, secondTrending] = trendingSearch;

  return (
    <div className="pt-24 pb-48 flex-1">
      <div className=" flex flex-col lg:flex-row justify-between gap-4">
        <article className="max-w-xl w-full">
          <section className="flex flex-col gap-12">
            <div className="flex flex-col gap-4">
              <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold">Búsqueda en catálogo</h1>
              <div className="flex flex-col gap-1">
                <h2 className="text-zinc-50 text-sm md:text-base">
                  Ingresa el nombre de la película para localizar el subtítulo.
                </h2>
                <p className="text-zinc-300 text-xs md:text-sm">Admitimos búsquedas en español, inglés y japonés.</p>
              </div>
            </div>
          </section>

          <section className="mt-12 flex flex-col gap-2">
            <AutocompleteTitles
              inputValue={inputValue}
              setInputValue={setInputValue}
              data={data}
              error={error}
              isLoading={isLoading}
              minimumCharacters={MINIMUM_CHARACTERS}
              onClearInputValue={handleClearInputValue}
            />
            <p className="text-zinc-400 text-xs">
              Lo más buscado ahora:{" "}
              <Link to={`/subtitles/movie/${firstTrending.imdbId}`} className="hover:text-zinc-50">
                {firstTrending.title} ({firstTrending.year})
              </Link>{" "}
              y{" "}
              <Link to={`/subtitles/movie/${secondTrending.imdbId}`} className="hover:text-zinc-50">
                {secondTrending.title} ({secondTrending.year})
              </Link>
            </p>
          </section>
        </article>
        <figure className="flex-1 hidden lg:flex justify-center">
          <Lens>
            <img src="/s-logo.webp" alt="Cargando" className="size-64" />
          </Lens>
        </figure>
      </div>
      <PosterTitles data={data} isLoading={isLoading} />
    </div>
  );
}
