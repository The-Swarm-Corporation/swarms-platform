import { createClient } from "@supabase/supabase-js"

let supabase: ReturnType<typeof createClient> | null = null

if (typeof window !== 'undefined') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey)
  } else {
    console.warn('Supabase URL or Key is missing. Supabase client will not be initialized.')
  }
}

export { supabase }