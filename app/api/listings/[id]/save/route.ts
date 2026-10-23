import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/supabase/server'
import { getListing, saveListing, unsaveListing } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 })

  const listingId = Number(params.id)
  const listing = await getListing(listingId)
  if (!listing) return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })

  await saveListing(user.id, listingId)
  return NextResponse.json({ saved: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 })

  await unsaveListing(user.id, Number(params.id))
  return NextResponse.json({ saved: false })
}
