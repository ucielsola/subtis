import data from "../wrangler.json";

// types
type Vars = {
  TMDB_API_KEY: string;
  YOUTUBE_API_KEY: string;
  SUPABASE_API_KEY: string;
  SUPABASE_BASE_URL: string;
};

// core
export function getMockEnv(): Vars {
  return {
    TMDB_API_KEY: data.vars.TMDB_API_KEY,
    YOUTUBE_API_KEY: data.vars.YOUTUBE_API_KEY,
    SUPABASE_API_KEY: data.vars.SUPABASE_API_KEY,
    SUPABASE_BASE_URL: data.vars.SUPABASE_BASE_URL,
  };
}
