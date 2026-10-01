import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/supabase/server'
import { getListing, updateListingStatus } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 })

  const listing = await getListing(Number(params.id))
  if (!listing) return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  if (listing.seller_id !== user.id) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  if (listing.status !== 'active') return NextResponse.json({ error: 'Listing is not active.' }, { status: 409 })

  await updateListingStatus(listing.id, 'cancelled')
  return NextResponse.json({ ok: true })
}
