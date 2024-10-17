import type { AppLoadContext, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import {getApiClient} from "~/utils/api-client.server"
import { getEnv } from "~/utils/env.server";

export async function loader({context}: LoaderFunctionArgs) {
  const movies = await fetchMovies(context)
  if ("message" in movies) {
    throw new Error(`there was an error while fetch movies: ${movies.message}`)
  }
  return {movies}
}

export const meta: MetaFunction = () => {
  return [
    { title: "Subtis" },
    { name: "description", content: "Welcome to Subtis" },
  ];
};

export default function Index() {
  const {movies} = useLoaderData<typeof loader>()
  return (
    <>
    <h1>home page</h1>
    <ul>
        {movies.map((movie) => {
          return (
            <li key={`movie-${movie.id}`}>
              {movie.title_name}
              {movie.id}
            </li>
          )
          })}
      </ul>
</>
  );
}

async function fetchMovies(context: AppLoadContext) {
  const env = getEnv(context)
  const apiClient = getApiClient({apiBaseUrl: env.PUBLIC_API_BASE_URL_PRODUCTION})
  const response = await apiClient.v1.titles.trending[":limit"].$get({
    param: {
    limit: "10"
    }
  })
  return response.json()
}
