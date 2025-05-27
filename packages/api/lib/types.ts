import type { DurableObjectNamespace } from "@cloudflare/workers-types";
import type { DurableObjectRateLimiter } from "@hono-rate-limiter/cloudflare";

type Variables = {
  rateLimit: boolean;
  TMDB_API_KEY: string;
  YOUTUBE_API_KEY: string;
  SUPABASE_API_KEY: string;
  SUPABASE_BASE_URL: string;
};

type Bindings = {
  CACHE: DurableObjectNamespace<DurableObjectRateLimiter>;
};

export type HonoAppType = {
  Variables: Variables;
  Bindings: Bindings;
};
