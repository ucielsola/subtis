import { type PlatformProxy } from "wrangler";

// When using `wrangler.toml` to configure bindings,
// `wrangler types` will generate types for those bindings
// into the global `Env` interface.
// Need this empty interface so that typechecking passes
// even if no `wrangler.toml` exists.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Env {
  SUPABASE_API_KEY: string,
  SUPABASE_BASE_URL: string,
  OPEN_SUBTITLES_API_KEY: string,
  TMDB_API_KEY: string,
  YOUTUBE_API_KEY: string,
  PUBLIC_API_BASE_URL_DEVELOPMENT: string,
  PUBLIC_API_BASE_URL_PRODUCTION: string
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}
