import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we have the required environment variables
let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  // Configure Supabase with proper site URL for auth redirects
  const supabaseConfig = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
  
  supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig)
} else {
  console.warn('Missing Supabase environment variables. App will use localStorage fallback.')
  // Create a mock client to prevent crashes
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null })
    })
  }
}

export { supabase } 