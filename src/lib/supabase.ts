import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

// Validar que la clave anon tenga el formato correcto (debe ser un JWT)
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('❌ Invalid Supabase anon key format')
  console.error('The anon key should start with "eyJ" and be a long JWT token')
  console.error('Current key:', supabaseAnonKey.substring(0, 20) + '...')
  throw new Error('Invalid Supabase anon key. Please check your .env.local file and get the correct key from Supabase Dashboard → Settings → API')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
