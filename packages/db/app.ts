import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// internals
import { Database } from './types';

// types
type Tables = Database['public']['Tables'];

export type Movie = Tables['Movies']['Row'];
export type Subtitle = Tables['Subtitles']['Row'];
export type ReleaseGroup = Tables['ReleaseGroups']['Row'];
export type SubtitleGroup = Tables['SubtitleGroups']['Row'];

export type SupabaseClient = ReturnType<typeof getSupabaseClient>;

// utils
export function getSupabaseEnvironmentVariables(): {
  supabaseApiKey: string;
  supabaseBaseUrl: string;
} {
  const [supabaseApiKey, supabaseBaseUrl] = [process.env.SUPABASE_API_KEY, process.env.SUPABASE_BASE_URL];
  const supabaseEnvVars = { supabaseApiKey, supabaseBaseUrl };

  const schema = z.object({ supabaseApiKey: z.string(), supabaseBaseUrl: z.string() });
  return schema.parse(supabaseEnvVars);
}

// core fn
function getSupabaseClient() {
  const { supabaseApiKey, supabaseBaseUrl } = getSupabaseEnvironmentVariables();

  return createClient<Database>(supabaseBaseUrl, supabaseApiKey, {
    auth: { persistSession: false },
  });
}

// constants
export const supabase = getSupabaseClient();
