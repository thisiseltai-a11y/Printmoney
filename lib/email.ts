import { Resend } from 'resend'
import { getSupabase } from './supabase'

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

async function getUserEmail(userId: string): Promise<string | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.admin.getUserById(userId)
  if (error) return null
  return data.user?.email ?? null
}

// Mirrors an in-app notification as an email. Best-effort: swallows its own
// errors so a Resend outage or bad address never breaks the action that
// triggered the notification (accepting an offer, etc).
export async function sendNotificationEmail(input: {
  user_id: string
  title: string
  body?: string
  link?: string
}) {
  if (!emailConfigured()) return
  try {
    const email = await getUserEmail(input.user_id)
    if (!email) return

    const resend = new Resend(process.env.RESEND_API_KEY)
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL
    const url = input.link ? `${siteUrl ?? ''}${input.link}` : undefined

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'WorthCars <onboarding@resend.dev>',
      to: email,
      subject: input.title,
      text: [input.body, url].filter(Boolean).join('\n\n'),
    })
  } catch (err) {
    console.error('sendNotificationEmail failed:', err)
  }
}
