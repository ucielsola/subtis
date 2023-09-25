import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// internals
import { Database } from './types';

// utils
export function getSupabaseEnvironmentVariables(): {
  supabaseApiKey: string;
  supabaseBaseUrl: string;
} {
  const [supabaseApiKey, supabaseBaseUrl] = [Bun.env.SUPABASE_API_KEY, Bun.env.SUPABASE_BASE_URL];
  const supabaseEnvVars = { supabaseApiKey, supabaseBaseUrl };

  const schema = z.object({ supabaseApiKey: z.string(), supabaseBaseUrl: z.string() });
  return schema.parse(supabaseEnvVars);
}

// type definitions
export type SupabaseClient = ReturnType<typeof getSupabaseClient>;

// core fn
function getSupabaseClient() {
  const { supabaseApiKey, supabaseBaseUrl } = getSupabaseEnvironmentVariables();

  return createClient<Database>(supabaseBaseUrl, supabaseApiKey, {
    auth: { persistSession: false },
  });
}

// supabase instance
export const supabase = getSupabaseClient();
