import type { Context } from "hono";
import { z } from "zod";

// internals
import type { AppVariables } from "./types";

// schemas
export const tmdbDiscoverMovieSchema = z.object({
  results: z.array(z.object({ original_title: z.string(), vote_count: z.number() })),
});

// helpers
export function getTmdbApiKey(context: Context<{ Variables: AppVariables }>) {
  const env = z.object({ TMDB_API_KEY: z.string() }).parse(context.env);
  return env.TMDB_API_KEY;
}

export function getTmdbHeaders(context: Context): RequestInit {
  return {
    method: "GET",
    headers: { accept: "application/json", Authorization: `Bearer ${getTmdbApiKey(context)}` },
  };
}

export function getTmdbMovieSearchUrl(title: string, year?: number): string {
  if (year) {
    return `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&year=${year}&language=es-MX`;
  }

  return `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=es-MX`;
}
