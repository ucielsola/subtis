import type { AppLoadContext } from "@remix-run/cloudflare"

export interface Env {
  SUPABASE_API_KEY: string,
  SUPABASE_BASE_URL: string,
  OPEN_SUBTITLES_API_KEY: string,
  TMDB_API_KEY: string,
  YOUTUBE_API_KEY: string,
  PUBLIC_API_BASE_URL_DEVELOPMENT: string,
  PUBLIC_API_BASE_URL_PRODUCTION: string
}

export function getEnv(context: AppLoadContext): Env {
  return context.cloudflare.env
}

