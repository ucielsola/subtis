import data from "../wrangler.json";

type Vars = {
  SUPABASE_API_KEY: string;
  SUPABASE_BASE_URL: string;
};

export function getMockEnv(): Vars {
  return {
    SUPABASE_API_KEY: data.vars.SUPABASE_API_KEY,
    SUPABASE_BASE_URL: data.vars.SUPABASE_BASE_URL,
  };
}
