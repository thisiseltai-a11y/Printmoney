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
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;">
              <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
                <h1 style="color:white;margin:0;font-size:24px;">🚀 Your Bundle is Ready</h1>
              </div>
              <div style="padding:32px;background:white;border-radius:0 0 12px 12px;">
                <p style="color:#475569;font-size:15px;">Hi ${name || 'there'},</p>
                <p style="color:#475569;font-size:15px;">Your first resume was just generated. You have <strong>4 more resumes</strong> left in your bundle.</p>
                <p style="color:#475569;font-size:15px;">Use your personal bundle link anytime to generate more — no payment needed:</p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:24px 0;text-align:center;">
                  <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#166534;text-transform:uppercase;letter-spacing:0.05em;">Your Bundle Link</p>
                  <a href="${bundleUrl}" style="color:#0d9488;font-size:14px;font-weight:600;word-break:break-all;">${bundleUrl}</a>
                  <p style="margin:12px 0 0;font-size:12px;color:#6b7280;">Bookmark this — it never expires. <strong>4 resumes remaining.</strong></p>
                </div>
                <a href="${bundleUrl}" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:600;">Generate Another Resume →</a>
              </div>
            </div>
          `,
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
