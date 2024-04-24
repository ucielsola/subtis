import data from "../wrangler.toml";

export function getMockEnv(): {
  SUPABASE_API_KEY: string;
  SUPABASE_BASE_URL: string;
} {
	return {
		SUPABASE_API_KEY: data.env.development.vars.SUPABASE_API_KEY,
		SUPABASE_BASE_URL: data.env.development.vars.SUPABASE_BASE_URL,
	};
}
