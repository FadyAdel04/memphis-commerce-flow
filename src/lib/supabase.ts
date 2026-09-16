import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env['VITE_SUPABASE_URL'] as string) || 'https://placeholder.supabase.co'
const supabaseAnonKey = (import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string) || 'placeholder'

if (!import.meta.env['VITE_SUPABASE_URL'] || !import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY']) {
  console.warn('Missing Supabase environment variables, using fallback client')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})