import { createClient } from "@supabase/supabase-js";
import type { Context } from "hono";
import { z } from "zod";

// db
import type { Database } from "@subtis/db/types";

// types
export type AppVariables = {
  SUPABASE_API_KEY: string;
  SUPABASE_BASE_URL: string;
};

export function getSupabaseClient(context: Context<{ Variables: AppVariables }>) {
  const client = z.object({ SUPABASE_BASE_URL: z.string(), SUPABASE_API_KEY: z.string() }).parse(context.env);
  return createClient<Database>(client.SUPABASE_BASE_URL, client.SUPABASE_API_KEY);
}
