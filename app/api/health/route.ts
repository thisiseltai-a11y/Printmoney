import { NextResponse } from 'next/server'

export async function GET() {
  const stripe = !!process.env.STRIPE_SECRET_KEY
  const stripeIsLive = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ?? false
  const resend = !!process.env.RESEND_API_KEY
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? null
  const baseUrlIsLive = baseUrl ? !baseUrl.includes('localhost') : false

  const allGood = stripe && resend && baseUrlIsLive

  return NextResponse.json({
    status: allGood ? 'ready' : 'not_ready',
    checks: {
      stripe: {
        configured: stripe,
        live_mode: stripeIsLive,
        note: !stripe
          ? 'STRIPE_SECRET_KEY is missing'
          : !stripeIsLive
          ? 'Key looks like a TEST key (sk_test_...) — switch to live for real payments'
          : 'OK',
      },
      resend: {
        configured: resend,
        note: !resend ? 'RESEND_API_KEY is missing — email delivery will not work' : 'OK',
      },
      base_url: {
        value: baseUrl,
        is_live: baseUrlIsLive,
        note: !baseUrl
          ? 'NEXT_PUBLIC_BASE_URL is missing — Stripe will redirect to localhost after payment!'
          : !baseUrlIsLive
          ? 'NEXT_PUBLIC_BASE_URL is set to localhost — update to https://resumerocket.co in Vercel'
          : 'OK',
      },
    },
  })
}
