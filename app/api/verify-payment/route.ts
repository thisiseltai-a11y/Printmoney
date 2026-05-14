import { NextRequest, NextResponse } from 'next/server'
import { hasFreeAccess } from '@/lib/access'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (hasFreeAccess(email)) {
    return NextResponse.json({ paid: true })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Payments are not configured.' }, { status: 503 })
  }

  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 })
    }

    return NextResponse.json({ paid: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to verify payment'
    console.error('Verify payment error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
