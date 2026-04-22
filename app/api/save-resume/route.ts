import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const { email, name, resume, coverLetter, linkedinSummary } = await req.json()

    if (!email || !resume) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        email: email.toLowerCase().trim(),
        name,
        resume,
        cover_letter: coverLetter || '',
        linkedin_summary: linkedinSummary || '',
      })
      .select('id')
      .single()

    if (error) throw error

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://resumerocket.co'
    const resumeUrl = `${baseUrl}/resume/${data.id}`

    return NextResponse.json({ id: data.id, url: resumeUrl })
  } catch (error) {
    console.error('Save resume error:', error)
    return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 })
  }
}
