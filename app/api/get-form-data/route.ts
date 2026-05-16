import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ formData: null })
  }

  try {
    const { getSupabase } = await import('@/lib/supabase')
    const sb = getSupabase()
    const { data, error } = await sb
      .from('pending_sessions')
      .select('form_data')
      .eq('stripe_session_id', sessionId)
      .single()

    if (error || !data) return NextResponse.json({ formData: null })

    // Clean up after retrieval
    await sb.from('pending_sessions').delete().eq('stripe_session_id', sessionId)

    return NextResponse.json({ formData: data.form_data })
  } catch {
    return NextResponse.json({ formData: null })
  }
}
