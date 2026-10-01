import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/supabase/server'
import { submitOffer, OfferError } from '@/lib/offers'
import { dollarsToCents } from '@/lib/money'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'You must be logged in to make an offer.' }, { status: 401 })

  try {
    const body = await req.json()
    const listingId = Number(body.listingId)
    const amount = Number(body.amount)
    if (!Number.isFinite(listingId)) {
      return NextResponse.json({ error: 'Missing listing.' }, { status: 400 })
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Enter a valid offer amount.' }, { status: 400 })
    }

    const result = await submitOffer({ listingId, buyerId: user.id, amountCents: dollarsToCents(amount) })
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof OfferError) return NextResponse.json({ error: err.message }, { status: err.status })
    console.error('Submit offer error:', err)
    return NextResponse.json({ error: 'Could not submit offer.' }, { status: 500 })
  }
}
