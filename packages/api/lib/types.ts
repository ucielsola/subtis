export type AppVariables = {
  rateLimit: boolean;
  TMDB_API_KEY: string;
  YOUTUBE_API_KEY: string;
  SUPABASE_API_KEY: string;
  SUPABASE_BASE_URL: string;
};

export type AppBindings = {
  RATE_LIMITER: RateLimit;
};
