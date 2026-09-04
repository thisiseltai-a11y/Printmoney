import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { fulfillReport } from '@/lib/reportFulfillment'

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    if (typeof sessionId !== 'string' || !sessionId) {
      return NextResponse.json({ error: 'Missing session id.' }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed.' }, { status: 402 })
    }

    const vin = session.metadata?.vin
    const email = session.metadata?.email || session.customer_email
    if (!vin || !email) {
      return NextResponse.json({ error: 'Session is missing VIN/email metadata.' }, { status: 400 })
    }

    const report = await fulfillReport(vin, email, session.id)
    return NextResponse.json({ report, vin, email })
  } catch (err) {
    console.error('Checkout verify error:', err)
    return NextResponse.json({ error: 'Could not verify payment.' }, { status: 500 })
  }
}
