import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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
};

export default function SearchPage() {
  // react hooks
  const [inputValue, setInputValue] = useState<string>("");

  // query hooks
  const { data, isLoading, error } = useQuery({
    queryKey: ["titles", inputValue],
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

      const parsedResults = data.results.map((result) => ({
        poster: result.poster,
        value: String(result.imdb_id),
        label: `${result.title_name} (${result.year})`,
      }));

      return { results: parsedResults, statusCode: response.status };
    },
    enabled: Boolean(inputValue && inputValue.length >= 3),
  });
  console.log("\n ~ AutocompleteTitles ~ data:", data);

  return (
    <div className="pt-24 pb-48">
      <div className=" flex flex-col lg:flex-row justify-between gap-4">
        <article className="max-w-xl w-full">
          <section className="flex flex-col gap-12">
            <div className="flex flex-col gap-4">
              <h1 className="text-zinc-50 text-5xl font-bold">Búsqueda en catálogo</h1>
              <h2 className="text-zinc-50">
                Ingresa el título de la película que quieras buscar su subtítulo. Soportamos búsqueda en español, inglés
                y japonés (perfecto para películas de anime).
              </h2>
            </div>
          </section>

          <section className="mt-12">
            <AutocompleteTitles
              inputValue={inputValue}
              setInputValue={setInputValue}
              data={data}
              error={error}
              isLoading={isLoading}
            />
          </section>
        </article>
        <figure className="flex-1 hidden lg:flex justify-center">
          <Lens>
            <img src="/s-logo.png" alt="Cargando" className="size-64" />
          </Lens>
        </figure>
      </div>
      <PosterTitles data={data} isLoading={isLoading} />
    </div>
  );
}
