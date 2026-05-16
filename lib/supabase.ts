import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key)
}

export interface ResumeRecord {
  id: string
  email: string
  name: string
  resume: string
  cover_letter: string
  linkedin_summary: string
  created_at: string
}
