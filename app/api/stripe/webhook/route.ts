import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { fulfillReport } from '@/lib/reportFulfillment'

// Source of truth for fulfillment — runs even if the customer closes the tab
// before the success-page verification call fires. Point your Stripe
// dashboard's webhook at /api/stripe/webhook for the checkout.session.completed
// event.
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Not configured.' }, { status: 503 })
  }

  const stripe = getStripe()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as import('stripe').Stripe.Checkout.Session
    const vin = session.metadata?.vin
    const email = session.metadata?.email || session.customer_email
    if (vin && email && session.payment_status === 'paid') {
      try {
        await fulfillReport(vin, email, session.id)
      } catch (err) {
        console.error('Webhook fulfillment error:', err)
        return NextResponse.json({ error: 'Fulfillment failed.' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
