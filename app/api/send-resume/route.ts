import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email not configured.' }, { status: 503 })
  }

  const { email, name, resume, coverLetter, linkedinSummary } = await req.json()
  if (!email || !resume) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#0d9488,#0f766e);display:inline-block;"></div>
        <span style="font-size:18px;font-weight:700;color:#0f172a;">ResumeRocket</span>
      </div>
    </div>

    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:24px;">
      <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:24px 32px;">
        <h1 style="margin:0;color:white;font-size:22px;font-weight:700;">Your documents are ready, ${name?.split(' ')[0] ?? 'there'}! 🚀</h1>
        <p style="margin:8px 0 0;color:#ccfbf1;font-size:14px;">ATS-optimized and tailored to your target role</p>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
          We've saved everything below so you'll never lose access. Copy your resume into a Word doc or Google Doc, then save as PDF before applying.
        </p>
        <a href="https://resumerocket.co/order" style="display:inline-block;background:#0d9488;color:white;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;">Generate another resume →</a>
      </div>
    </div>

    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:16px;">
      <div style="padding:20px 32px;border-bottom:1px solid #f1f5f9;">
        <h2 style="margin:0;font-size:14px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:0.1em;">📄 Resume</h2>
      </div>
      <pre style="margin:0;padding:24px 32px;font-family:'Courier New',monospace;font-size:12px;color:#334155;white-space:pre-wrap;line-height:1.7;">${resume}</pre>
    </div>

    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:16px;">
      <div style="padding:20px 32px;border-bottom:1px solid #f1f5f9;">
        <h2 style="margin:0;font-size:14px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:0.1em;">✉️ Cover Letter</h2>
      </div>
      <pre style="margin:0;padding:24px 32px;font-family:'Courier New',monospace;font-size:12px;color:#334155;white-space:pre-wrap;line-height:1.7;">${coverLetter}</pre>
    </div>

    ${linkedinSummary ? `
    <div style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:16px;">
      <div style="padding:20px 32px;border-bottom:1px solid #f1f5f9;">
        <h2 style="margin:0;font-size:14px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:0.1em;">💼 LinkedIn Summary</h2>
      </div>
      <pre style="margin:0;padding:24px 32px;font-family:'Courier New',monospace;font-size:12px;color:#334155;white-space:pre-wrap;line-height:1.7;">${linkedinSummary}</pre>
    </div>
    ` : ''}

    <div style="text-align:center;padding:24px 0 0;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        Got an interview? Reply to this email — we'd love to hear. 🎉<br>
        <a href="https://resumerocket.co" style="color:#0d9488;">resumerocket.co</a>
      </p>
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
