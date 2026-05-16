import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Payments not configured.' }, { status: 503 })
  }
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { email } = await req.json()
    const base = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'NurseEdge — Full Access',
            description: 'Unlimited TEAS practice questions, mock exams, and AI explanations.',
          },
          unit_amount: 800,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${base}/dashboard?subscribed=1`,
      cancel_url: `${base}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
