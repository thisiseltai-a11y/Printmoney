import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Session-aware client for Server Components / Route Handlers — reads the
// signed-in user from cookies, subject to RLS. Use lib/supabase.ts's
// service-role client instead for privileged writes (offer state changes,
// notifications) after checking authorization yourself.
export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function getSessionUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (err) {
    console.error('getSessionUser failed:', err)
    return null
  }
}
