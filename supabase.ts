import { createClient } from '@supabase/supabase-js';

// supabase db type definitions
import { Database } from './supabase-types';

export type SupabaseClient = ReturnType<typeof getSupabaseClient>;

export function getSupabaseClient() {
  const supabaseApiKey = process.env.SUPABASE_API_KEY as string;
  const supabaseBaseUrl = process.env.SUPABASE_BASE_URL as string;

  return createClient<Database>(supabaseBaseUrl, supabaseApiKey);
}
