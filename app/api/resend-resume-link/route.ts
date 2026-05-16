import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 })
  }

  const { data, error } = await getSupabase()
    .from('resumes')
    .select('id, name, created_at')
    .eq('email', email.toLowerCase().trim())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    // Don't reveal whether email exists — just say "if we have it, we sent it"
    return NextResponse.json({ ok: true })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://resumerocket.co'
  const resumeUrl = `${baseUrl}/resume/${data.id}`

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'ResumeRocket <noreply@resumerocket.co>',
      to: email,
      subject: 'Your ResumeRocket resume link',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;padding:32px;border-radius:12px;">
          <div style="margin-bottom:24px;">
            <span style="font-size:28px;">🚀</span>
            <span style="font-size:20px;font-weight:800;color:white;margin-left:8px;">ResumeRocket</span>
          </div>
          <h2 style="color:white;font-size:22px;margin-bottom:8px;">Here's your resume link${data.name ? `, ${data.name}` : ''}!</h2>
          <p style="color:#94a3b8;font-size:15px;margin-bottom:24px;">Click the button below to view and download your resume, cover letter, and LinkedIn summary.</p>
          <a href="${resumeUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);color:white;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:16px;">View My Resume</a>
          <p style="color:#475569;font-size:13px;margin-top:24px;">Or copy this link: <a href="${resumeUrl}" style="color:#818cf8;">${resumeUrl}</a></p>
        </div>
      `,
    })
  }

  return NextResponse.json({ ok: true })
}
