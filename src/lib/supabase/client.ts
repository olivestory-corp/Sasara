import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xltwffswqvowersvchkj.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdHdmZnN3cXZvd2Vyc3ZjaGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxMzQ0MzEsImV4cCI6MjA0NDcxMDQzMX0.FNG_uZzjK_uSC1j8ur5dgtkIyU7O8qLvhzVQAGgHsT0'

// Create a single supabase client for interacting with your database
function getSupabaseClient(supabaseUrl: string, supabaseAnonKey: string) {
  if (!supabaseUrl && !supabaseAnonKey) {
    return null
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'implicit',
    },
    global: {
      headers: {
        Environment: import.meta.env.DEV ? 'development' : 'production',
      },
    },
  })
}

const defaultSupabaseClient = getSupabaseClient(supabaseUrl, supabaseAnonKey)

export default defaultSupabaseClient
