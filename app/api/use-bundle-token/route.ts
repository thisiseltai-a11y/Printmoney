import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  try {
    const { token, formData } = await req.json()
    if (!token || !formData) {
      return NextResponse.json({ error: 'Missing token or form data.' }, { status: 400 })
    }

    const { getSupabase } = await import('@/lib/supabase')
    const sb = getSupabase()

    const { data: bundle, error } = await sb
      .from('bundle_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !bundle) {
      return NextResponse.json({ error: 'Invalid bundle link. Please check your email for the correct link.' }, { status: 400 })
    }
    if (bundle.uses_remaining <= 0) {
      return NextResponse.json({ error: 'All 5 resumes in your bundle have been used.' }, { status: 400 })
    }

    // Decrement uses
    await sb
      .from('bundle_tokens')
      .update({ uses_remaining: bundle.uses_remaining - 1 })
      .eq('token', token)

    // Save form data so result page can retrieve it
    const sessionId = `bundle:${crypto.randomUUID()}`
    await sb.from('pending_sessions').insert({
      stripe_session_id: sessionId,
      form_data: formData,
    })

    return NextResponse.json({
      sessionId,
      usesRemaining: bundle.uses_remaining - 1,
    })
  } catch (e) {
    console.error('use-bundle-token error:', e)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
