import type { MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useDebounce } from "use-debounce";
import { z } from "zod";

// api
import { trendingSubtitlesResponseSchema } from "@subtis/api/controllers/titles/schemas";

// shared
import { getStringWithoutSpecialCharacters } from "@subtis/shared";

// lib
import { apiClient } from "~/lib/api";

// ui
import { Lens } from "~/components/ui/lens";

// features
import { AutocompleteTitles } from "~/features/search/autocomplete-titles";
import { PosterTitles } from "~/features/search/poster-titles";

// types
type Result = {
  value: string;
  label: string;
  optimizedPoster: string | null;
  posterThumbHash: string | null;
};

// loader
export const loader = async () => {
  const trendingSearchResponse = await apiClient.v1.titles.trending.search[":limit"].$get({
    param: { limit: "2" },
  });

  const trendingSearchData = await trendingSearchResponse.json();

  if (!trendingSearchResponse.ok) {
    const trendingSearchError = z.object({ message: z.string() }).safeParse(trendingSearchData);

    if (trendingSearchError.error) {
      throw new Error("Invalid trending search data");
    }

    return trendingSearchError.data;
  }

  const trendingSearchParsedData = trendingSubtitlesResponseSchema.safeParse(trendingSearchData);

  if (trendingSearchParsedData.error) {
    throw new Error("Invalid trending search data");
  }

  const parsedTrendingSearch = trendingSearchParsedData.data.results.map((result) => ({
    title: result.title_name,
    year: result.year,
    slug: result.slug,
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
  const loaderData = useLoaderData<typeof loader>();

  // nuqs hooks
  const [inputValue, setInputValue] = useQueryState("query", { defaultValue: "" });

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
          };
        });

      return { results: parsedResults, statusCode: response.status };
    },
    enabled: Boolean(value && value.length >= MINIMUM_CHARACTERS),
  });

  // handlers
  function handleClearInputValue(): void {
    setInputValue("");
  }

  // constants
  const [firstTrending, secondTrending] = "message" in loaderData ? [] : loaderData.trendingSearch;

  return (
    <div className="pt-24 flex-1">
      <div className=" flex flex-col lg:flex-row justify-between gap-4">
        <article className="max-w-xl w-full">
          <section className="flex flex-col gap-12">
            <div className="flex flex-col gap-4">
              <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold">Búsqueda en catálogo</h1>
              <div className="flex flex-col gap-1">
                <h2 className="text-zinc-50 text-sm md:text-base">
                  Ingresa el nombre de la película para localizar el subtítulo.
                </h2>
                <p className="text-zinc-300 text-xs md:text-sm">
                  Admitimos búsquedas en distintos idiomas como español, inglés y japonés.
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
            <p className="text-zinc-400 text-xs">
              Las películas más buscadas últimamente son:{" "}
              <Link to={`/subtitles/movie/${firstTrending.slug}`} className="hover:text-zinc-50">
                {firstTrending.title}
              </Link>{" "}
              y{" "}
              <Link to={`/subtitles/movie/${secondTrending.slug}`} className="hover:text-zinc-50">
                {secondTrending.title}
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
