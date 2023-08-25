import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// supabase db type definitions
import { Database } from "./supabase-types";

export type SupabaseClient = ReturnType<typeof getSupabaseClient>;

function getSupabaseClient() {
  const [supabaseApiKey, supabaseBaseUrl] = [
    process.env.SUPABASE_API_KEY,
    process.env.SUPABASE_BASE_URL,
  ] as [string, string];

  return createClient<Database>(supabaseBaseUrl, supabaseApiKey, {
    auth: { persistSession: false },
  });
}

export const supabase = getSupabaseClient();
