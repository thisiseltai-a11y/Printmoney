import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { validateVin } from '@/lib/vin'
import { REPORT_PRICE_CENTS } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const { vin: rawVin, email } = await req.json()
    const { valid, vin, reason } = validateVin(rawVin ?? '')
    if (!valid) return NextResponse.json({ error: reason }, { status: 400 })
    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 503 })
    }

    const stripe = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: REPORT_PRICE_CENTS,
            product_data: {
              name: `WorthCars full history report — ${vin}`,
              description: 'Accident history, title status, ownership, and service records.',
            },
          },
          quantity: 1,
        },
      ],
      metadata: { vin, email },
      success_url: `${baseUrl}/report/${vin}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/report/${vin}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 })
  }
}
