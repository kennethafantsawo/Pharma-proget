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
      health_posts: {
        Row: {
          id: number;
          created_at: string;
          title: string;
          content: string;
          image_url: string | null;
          likes: number;
        },
        Insert: {
          title: string;
          content: string;
          image_url?: string | null;
          likes?: number;
        },
        Update: {
          title?: string;
          content?: string;
          image_url?: string | null;
          likes?: number;
        }
      }
    }
    Functions: {
      increment_likes: {
        Args: {
          post_id_to_inc: number
        }
        Returns: undefined
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Initialize client only if variables are set to prevent crashing the app.
export const supabase = 
    (supabaseUrl && supabaseAnonKey) 
        ? createClient<Database>(supabaseUrl, supabaseAnonKey) 
        : null;

if (!supabase) {
    console.warn('Supabase client is not initialized. Please check your environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}
