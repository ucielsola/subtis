import data from "../wrangler.toml";

export function getMockEnv(): {
	SUPABASE_API_KEY: string;
	SUPABASE_BASE_URL: string;
} {
	return {
		SUPABASE_API_KEY: data.vars.SUPABASE_API_KEY,
		SUPABASE_BASE_URL: data.vars.SUPABASE_BASE_URL,
	};
}
