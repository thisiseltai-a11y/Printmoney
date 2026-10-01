import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/supabase/server'
import { respondToOffer, OfferError } from '@/lib/offers'
import { dollarsToCents } from '@/lib/money'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 })

  try {
    const body = await req.json()
    const action = body.action
    const counterAmountCents = body.counterAmount != null ? dollarsToCents(Number(body.counterAmount)) : undefined

    const result = await respondToOffer({
      offerId: Number(params.id),
      actorId: user.id,
      action,
      counterAmountCents,
    })
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof OfferError) return NextResponse.json({ error: err.message }, { status: err.status })
    console.error('Respond to offer error:', err)
    return NextResponse.json({ error: 'Could not respond to offer.' }, { status: 500 })
  }
}
