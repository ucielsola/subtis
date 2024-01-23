import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// internals
import type { Database } from '../types'

// utils
export function getSupabaseEnvironmentVariables(): {
  supabaseApiKey: string
  supabaseBaseUrl: string
} {
  const [supabaseApiKey, supabaseBaseUrl] = [process.env.SUPABASE_API_KEY, process.env.SUPABASE_BASE_URL]
  const supabaseEnvVars = { supabaseApiKey, supabaseBaseUrl }

  const schema = z.object({ supabaseApiKey: z.string(), supabaseBaseUrl: z.string() })
  return schema.parse(supabaseEnvVars)
}

// core
function getSupabaseClient() {
  const { supabaseApiKey, supabaseBaseUrl } = getSupabaseEnvironmentVariables()
  return createClient<Database>(supabaseBaseUrl, supabaseApiKey, {
    auth: { persistSession: false },
  })
}

// types
export type SupabaseClient = ReturnType<typeof getSupabaseClient>
export type Movie = Database['public']['Tables']['Movies']['Row']

// constants
export const supabase = getSupabaseClient()
