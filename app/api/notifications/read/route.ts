import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/supabase/server'
import { markNotificationsRead } from '@/lib/db'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  await markNotificationsRead(user.id, body.ids)
  return NextResponse.json({ ok: true })
}
