import type { Context } from "hono";
import { z } from "zod";

// internals
import type { AppVariables } from "../shared/types";

// helpers
export function getYoutubeApiKey(context: Context<{ Variables: AppVariables }>) {
  const env = z.object({ YOUTUBE_API_KEY: z.string() }).parse(context.env);
  return env.YOUTUBE_API_KEY;
}

export function getTmdbApiKey(context: Context<{ Variables: AppVariables }>) {
  const env = z.object({ TMDB_API_KEY: z.string() }).parse(context.env);
  return env.TMDB_API_KEY;
}
