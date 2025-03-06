// types
type Vars = {
  TMDB_API_KEY: string;
  YOUTUBE_API_KEY: string;
  SUPABASE_API_KEY: string;
  SUPABASE_BASE_URL: string;
};

// core
export function getMockEnv(): Vars {
  // For tests, use environment variables or mock values
  return {
    TMDB_API_KEY: process.env.TMDB_API_KEY ?? "test_tmdb_key",
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ?? "test_youtube_key",
    SUPABASE_API_KEY: process.env.SUPABASE_API_KEY ?? "test_supabase_key",
    SUPABASE_BASE_URL: process.env.SUPABASE_BASE_URL ?? "http://localhost:54321",
  };
}
