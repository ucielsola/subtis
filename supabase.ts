import "dotenv/config";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// supabase db type definitions
import { Database } from "./supabase-types";

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

export type SupabaseClient = ReturnType<typeof getSupabaseClient>;

function getSupabaseClient() {
  const { supabaseApiKey, supabaseBaseUrl } = getSupabaseEnvironmentVariables();

  return createClient<Database>(supabaseBaseUrl, supabaseApiKey, {
    auth: { persistSession: false },
  });
}

export const supabase = getSupabaseClient();
