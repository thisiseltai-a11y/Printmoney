import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  try {
    const formData = await req.json()
    const { email, name } = formData

    if (!email) return NextResponse.json({ ok: false }, { status: 400 })

    const { supabase } = await import('@/lib/supabase')
    const base = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

    // Create token with 4 uses (first resume was just generated)
    const { data: bundle, error } = await supabase
      .from('bundle_tokens')
      .insert({ email, uses_remaining: 4 })
      .select('token')
      .single()

    if (error || !bundle) throw new Error('Failed to create bundle token')

    const bundleUrl = `${base}/order?bundle_token=${bundle.token}`

    // Email the bundle link
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'ResumeRocket <noreply@resumerocket.co>',
          to: email,
          subject: 'Your ResumeRocket Bundle — 4 resumes remaining',
          html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:36px 16px 48px;">
    <div style="text-align:center;margin-bottom:28px;">
      <p style="margin:0;font-size:28px;line-height:1;">🚀</p>
      <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.3px;">ResumeRocket</p>
    </div>
    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:20px;">
      <div style="background:#4f46e5;padding:28px 32px;">
        <p style="margin:0;font-size:22px;font-weight:700;color:white;">Your bundle is active 🎟️</p>
        <p style="margin:8px 0 0;font-size:14px;color:#c7d2fe;">4 more resumes ready to generate — no payment needed.</p>
      </div>
      <div style="padding:28px 32px;">
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.7;">
          Hi ${name || 'there'}, your first resume was just generated. Use the link below any time to generate the remaining 4 — bookmark it so you never lose it.
        </p>
        <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#4338ca;text-transform:uppercase;letter-spacing:0.08em;">🔗 Your personal bundle link</p>
          <a href="${bundleUrl}" style="color:#4f46e5;font-size:13px;font-weight:600;word-break:break-all;text-decoration:none;">${bundleUrl}</a>
          <p style="margin:8px 0 0;font-size:12px;color:#6366f1;">Never expires · 4 resumes remaining</p>
        </div>
        <a href="${bundleUrl}" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:13px 26px;border-radius:10px;font-size:14px;font-weight:600;">Generate Another Resume →</a>
      </div>
    </div>
    <div style="text-align:center;padding:8px 0 0;">
      <a href="https://resumerocket.co" style="color:#6366f1;font-size:13px;text-decoration:none;font-weight:500;">resumerocket.co</a>
    </div>
  </div>
</body>
</html>`,
        })
      } catch (e) {
        console.error('Failed to send bundle email:', e)
      }
    }

    return NextResponse.json({ ok: true, bundleUrl })
  } catch (e) {
    console.error('create-bundle-token error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
