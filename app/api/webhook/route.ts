import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Not configured.' }, { status: 503 })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })

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
    const email = session.customer_email ?? (session.metadata?.email ?? '')
    const plan = session.metadata?.plan ?? 'premium'
    const customerId = typeof session.customer === 'string' ? session.customer : ''
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : ''

    if (email && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { getSupabase } = await import('@/lib/supabase')
      const supabase = getSupabase()
      await supabase.from('subscriptions').upsert({
        email,
        plan,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as import('stripe').Stripe.Subscription
    const customerId = typeof sub.customer === 'string' ? sub.customer : ''

    if (customerId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { getSupabase } = await import('@/lib/supabase')
      const supabase = getSupabase()
      await supabase.from('subscriptions')
        .update({ status: 'cancelled', plan: 'free', updated_at: new Date().toISOString() })
        .eq('stripe_customer_id', customerId)
    }
  }

  return NextResponse.json({ received: true })
}
