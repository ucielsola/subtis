import type { Context } from "hono";
import { z } from "zod";

// internals
import type { AppVariables } from "./types";

// helpers
export function getSpotifyApiKey(context: Context<{ Variables: AppVariables }>): {
  clientId: string;
  clientSecret: string;
} {
  const env = z.object({ SPOTIFY_CLIENT_ID: z.string(), SPOTIFY_CLIENT_SECRET: z.string() }).parse(context.env);
  return {
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
  };
}

export function getYoutubeApiKey(context: Context<{ Variables: AppVariables }>): string {
  const env = z.object({ YOUTUBE_API_KEY: z.string() }).parse(context.env);
  return env.YOUTUBE_API_KEY;
}

export function getTmdbApiKey(context: Context<{ Variables: AppVariables }>): string {
  const env = z.object({ TMDB_API_KEY: z.string() }).parse(context.env);
  return env.TMDB_API_KEY;
}

export function getJwtSecret(context: Context<{ Variables: AppVariables }>): string {
  const env = z.object({ JWT_SECRET: z.string() }).parse(context.env);
  return env.JWT_SECRET;
}
