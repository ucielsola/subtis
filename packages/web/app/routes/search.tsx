import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { Suspense } from "react";
import type { MetaFunction } from "react-router";
import { useDebounceValue } from "usehooks-ts";

// shared
import { getStringWithoutSpecialCharacters } from "@subtis/shared";

// lib
import { apiClient } from "~/lib/api";

// ui
import { Lens } from "~/components/ui/lens";
import { Skeleton } from "~/components/ui/skeleton";

// features
import { AutocompleteTitles } from "~/features/search/autocomplete-titles";
import { PosterTitles } from "~/features/search/poster-titles";
import { TrendingSearch } from "~/features/search/trending-search";

// types
import type { Route } from "./+types/search";

// types
type Result = {
  value: string;
  label: string;
  optimizedPoster: string | null;
  posterThumbHash: string | null;
};

// loader
export const loader = () => {
  const trendingSearchPromise = apiClient.v1.titles.trending.search[":limit"]
    .$get({
      param: { limit: "2" },
    })
    .then((response) => response.json());

  return { trendingSearchPromise };
};

// meta
export const meta: MetaFunction = () => {
  return [
    { title: "Subtis | Búsqueda por nombre" },
    { name: "description", content: "Subtítutlos para todas tus películas" },
  ];
};

// constants
const MINIMUM_CHARACTERS = 2;

export default function SearchPage({ loaderData }: Route.ComponentProps) {
  // constants
  const { trendingSearchPromise } = loaderData;

  // nuqs hooks
  const [inputValue, setInputValue] = useQueryState("query", { defaultValue: "" });

  // debounce hooks
  const [value] = useDebounceValue(inputValue, 400);

  // query hooks
  const { data, isLoading, error } = useQuery({
    queryKey: ["titles", value],
    queryFn: async ({ queryKey }) => {
      const [, query] = queryKey;

      if (!query) {
        return { results: [] as Result[], statusCode: 400 };
      }

      const response = await apiClient.v1.titles.search[":query"].$get({
        param: { query },
      });

      const data = await response.json();

      if ("message" in data) {
        return { results: [] as Result[], statusCode: response.status };
      }

      const parsedResults = data.results
        .filter((result) => result.type === "movie")
        .map((result) => {
          let label = `${result.title_name} (${result.year})`;
          const parsedQuery = getStringWithoutSpecialCharacters(query);

          const spaLabel = getStringWithoutSpecialCharacters(`${result.title_name_spa} ${result.year}`);
          const jaLabel = getStringWithoutSpecialCharacters(`${result.title_name_ja} ${result.year}`);
          const enLabel = getStringWithoutSpecialCharacters(`${result.title_name} ${result.year}`);

          const queryWords = parsedQuery.split(" ");
          const isQueryInSpaLabel = queryWords.every((word) => spaLabel.includes(word));
          const isQueryInJaLabel = queryWords.every((word) => jaLabel.includes(word));
          const isQueryInEnLabel = queryWords.every((word) => enLabel.includes(word));

          if (isQueryInSpaLabel) {
            label = `${result.title_name_spa} (${result.year})`;
          }

          if (isQueryInJaLabel) {
            label = `${result.title_name_ja} (${result.year})`;
          }

          if (isQueryInEnLabel) {
            label = `${result.title_name} (${result.year})`;
          }

          return {
            label,
            value: String(result.slug),
            optimizedPoster: result.optimized_poster,
            posterThumbHash: result.poster_thumbhash,
            isNumericTitle: /\d+$/.test(result.title_name),
          };
        })
        .sort((a, b) => {
          if (a.isNumericTitle && !b.isNumericTitle) {
            return -1;
          }

          if (!a.isNumericTitle && b.isNumericTitle) {
            return 1;
          }

          return 0;
        });

      return { results: parsedResults, statusCode: response.status };
    },
    enabled: Boolean(value && value.length >= MINIMUM_CHARACTERS),
  });

  // handlers
  function handleClearInputValue(): void {
    setInputValue("");
  }

  return (
    <div className="pt-24 flex-1">
      <div className=" flex flex-col lg:flex-row justify-between gap-4">
        <article className="max-w-xl w-full">
          <section className="flex flex-col gap-12">
            <div className="flex flex-col gap-4">
              <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold">Búsqueda por nombre</h1>
              <div className="flex flex-col gap-1">
                <h2 className="text-zinc-50 text-sm md:text-base">
                  Ingresa el nombre de la película para localizar el subtítulo.
                </h2>
                <p className="text-zinc-300 text-xs md:text-sm">
                  Aceptamos búsquedas en español, inglés y japonés (alfabeto latino).
                </p>
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
            <Suspense
              fallback={
                <div className="text-zinc-400 text-xs truncate flex">
                  Lo más buscado últimamente: <Skeleton className="w-[120px] h-[16px] rounded-sm inline-flex ml-0.5" />
                </div>
              }
            >
              <TrendingSearch trendingSearchPromise={trendingSearchPromise} />
            </Suspense>
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
