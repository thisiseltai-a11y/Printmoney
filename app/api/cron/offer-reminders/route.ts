import { NextRequest, NextResponse } from 'next/server'
import { sendPendingReminders } from '@/lib/offers'

// A GET route handler is static by default unless it opts out — without
// this it would get executed once at build time and then serve that
// cached response on every real cron hit, never actually checking anything.
export const dynamic = 'force-dynamic'

// Hit by Vercel Cron (see vercel.json) — never by a browser. If CRON_SECRET
// is set, requests must carry it as a bearer token, so this can't be used
// to spam reminder emails by hitting the URL directly.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sent = await sendPendingReminders()
  return NextResponse.json({ sent })
}
