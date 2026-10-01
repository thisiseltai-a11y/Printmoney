import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/supabase/server'
import { listNotifications, countUnreadNotifications } from '@/lib/db'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ notifications: [], unread: 0 })

  const [notifications, unread] = await Promise.all([
    listNotifications(user.id),
    countUnreadNotifications(user.id),
  ])
  return NextResponse.json({ notifications, unread })
}
