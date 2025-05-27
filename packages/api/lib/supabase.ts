import { createClient } from "@supabase/supabase-js";
import type { Context } from "hono";
import { z } from "zod";

// db
import type { Database } from "@subtis/db/types";

// internals
import type { HonoAppType } from "./types";

// core
export function getSupabaseClient(context: Context<HonoAppType>) {
  const client = z.object({ SUPABASE_BASE_URL: z.string(), SUPABASE_API_KEY: z.string() }).parse(context.env);
  return createClient<Database>(client.SUPABASE_BASE_URL, client.SUPABASE_API_KEY, {
    db: {
      schema: "public",
    },
    auth: {
      persistSession: false,
    },
  });
}
