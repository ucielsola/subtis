import "dotenv/config";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

import { Database } from "./supabase-types";

// utils
function getSupabaseEnvironmentVariables(): {
  supabaseApiKey: string;
  supabaseBaseUrl: string;
} {
  const [supabaseApiKey, supabaseBaseUrl] = [
    process.env.SUPABASE_API_KEY,
    process.env.SUPABASE_BASE_URL,
  ];

  const supabaseEnvVars = {
    supabaseApiKey,
    supabaseBaseUrl,
  };

  const schema = z.object({
    supabaseApiKey: z.string(),
    supabaseBaseUrl: z.string(),
  });

  return schema.parse(supabaseEnvVars);
}

// type definitions
export type SupabaseClient = ReturnType<typeof getSupabaseClient>;

// main
function getSupabaseClient() {
  const { supabaseApiKey, supabaseBaseUrl } = getSupabaseEnvironmentVariables();

  return createClient<Database>(supabaseBaseUrl, supabaseApiKey, {
    auth: { persistSession: false },
  });
}

export const supabase = getSupabaseClient();
