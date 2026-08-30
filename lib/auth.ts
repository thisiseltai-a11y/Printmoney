import { supabaseClient } from '@/lib/supabase'

export interface AppUser {
  id: string
  email: string
  user_metadata: { full_name?: string }
}

const STORAGE_KEY = 'nurseedge_user'

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'undefined'
  )
}

export async function signUp(email: string, password: string, fullName: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabaseClient().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return
  }
  const user: AppUser = {
    id: crypto.randomUUID(),
    email,
    user_metadata: { full_name: fullName },
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export async function signIn(email: string, password: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabaseClient().auth.signInWithPassword({ email, password })
    if (error) throw error
    return
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  const existing: AppUser | null = stored ? JSON.parse(stored) : null
  if (existing && existing.email !== email) {
    throw new Error('No account found for that email. Please sign up first.')
  }
  const user: AppUser = existing ?? {
    id: crypto.randomUUID(),
    email,
    user_metadata: {},
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY)
  if (isSupabaseConfigured()) {
    await supabaseClient().auth.signOut()
  }
}

export async function getUser(): Promise<AppUser | null> {
  if (isSupabaseConfigured()) {
    const { data: { user } } = await supabaseClient().auth.getUser()
    if (user) return user as AppUser
    return null
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : null
}
