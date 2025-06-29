import { createClient } from '@supabase/supabase-js'
import type { WeekSchedule } from '@/lib/types'

// Add your Database type here. It's recommended to generate this with the Supabase CLI.
// For now, we'll use a simple generic.
export type Database = {
  public: {
    Tables: {
      weeks: {
        Row: {
          id: number
          semaine: string
        }
      }
      pharmacies: {
        Row: {
          id: number
          week_id: number
          nom: string
          localisation: string
          contact1: string
          contact2: string
        }
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and/or anonymous key are not defined in .env file')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
