import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  const supabaseApiKey = process.env.SUPABASE_API_KEY as string;
  const supabaseBaseUrl = process.env.SUPABASE_BASE_URL as string;

  return createClient(supabaseBaseUrl, supabaseApiKey);
}
