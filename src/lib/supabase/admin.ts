import { createClient } from '@supabase/supabase-js'
import type { Database } from './client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize admin client only if variables are set to prevent crashing the app.
export const supabaseAdmin = 
    (supabaseUrl && supabaseServiceKey)
        ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })
        : null;

if (!supabaseAdmin) {
    console.warn('Supabase admin client is not initialized. Please check your environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}
