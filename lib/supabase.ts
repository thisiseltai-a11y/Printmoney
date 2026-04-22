import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface ResumeRecord {
  id: string
  email: string
  name: string
  resume: string
  cover_letter: string
  linkedin_summary: string
  created_at: string
}
