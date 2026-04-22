import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email not configured.' }, { status: 503 })
  }

  const { email, name, resume, coverLetter, linkedinSummary, resumeUrl } = await req.json()
  if (!email || !resume) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const firstName = name?.split(' ')[0] ?? 'there'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your ResumeRocket Documents</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:36px 16px 48px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:28px;">
      <p style="margin:0;font-size:28px;line-height:1;">🚀</p>
      <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.3px;">ResumeRocket</p>
    </div>

    <!-- Hero card -->
    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:20px;">
      <div style="background:#4f46e5;padding:28px 32px;">
        <p style="margin:0;font-size:22px;font-weight:700;color:white;line-height:1.3;">Your documents are ready, ${firstName}! 🎉</p>
        <p style="margin:8px 0 0;font-size:14px;color:#c7d2fe;">ATS-optimized and tailored to your target role.</p>
      </div>
      <div style="padding:28px 32px;">
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.7;">
          Your resume, cover letter, and LinkedIn summary are saved below. We've also stored a permanent copy you can return to anytime — no login needed.
        </p>
        ${resumeUrl ? `
        <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#4338ca;text-transform:uppercase;letter-spacing:0.08em;">🔗 Your permanent link</p>
          <a href="${resumeUrl}" style="color:#4f46e5;font-size:13px;font-weight:600;word-break:break-all;text-decoration:none;">${resumeUrl}</a>
          <p style="margin:8px 0 0;font-size:12px;color:#6366f1;">Bookmark this — it never expires.</p>
        </div>
        ` : ''}
        <a href="https://resumerocket.co/order" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:13px 26px;border-radius:10px;font-size:14px;font-weight:600;">Generate another resume →</a>
      </div>
    </div>

    <!-- Resume -->
    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:16px;">
      <div style="padding:16px 24px;border-bottom:1px solid #f1f5f9;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.1em;">📄 &nbsp;Resume</p>
      </div>
      <div style="padding:24px 28px;font-size:13px;color:#334155;line-height:1.75;white-space:pre-wrap;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${resume}</div>
    </div>

    <!-- Cover Letter -->
    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:16px;">
      <div style="padding:16px 24px;border-bottom:1px solid #f1f5f9;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.1em;">✉️ &nbsp;Cover Letter</p>
      </div>
      <div style="padding:24px 28px;font-size:13px;color:#334155;line-height:1.75;white-space:pre-wrap;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${coverLetter}</div>
    </div>

    ${linkedinSummary ? `
    <!-- LinkedIn -->
    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:16px;">
      <div style="padding:16px 24px;border-bottom:1px solid #f1f5f9;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.1em;">💼 &nbsp;LinkedIn Summary</p>
      </div>
      <div style="padding:24px 28px;font-size:13px;color:#334155;line-height:1.75;white-space:pre-wrap;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${linkedinSummary}</div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="text-align:center;padding:20px 0 0;">
      <p style="margin:0 0 6px;color:#64748b;font-size:13px;">Got an interview? Reply and let us know — we'd love to celebrate with you. 🎉</p>
      <a href="https://resumerocket.co" style="color:#6366f1;font-size:13px;text-decoration:none;font-weight:500;">resumerocket.co</a>
    </div>

  </div>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'ResumeRocket <resume@resumerocket.co>',
      to: email,
      subject: `Your resume is ready — save it here`,
      html,
    })
    return NextResponse.json({ sent: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Email send failed'
    console.error('Send resume email error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
