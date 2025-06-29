import { createClient } from '@supabase/supabase-js'
import type { Database } from './client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and/or service role key are not defined.')
}

// The admin client uses the service_role key to bypass RLS.
// Use this client only in server-side code (Server Actions, API routes).
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
