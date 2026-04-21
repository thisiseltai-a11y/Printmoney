import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ResumeFormData } from '@/lib/types'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildPrompt(data: ResumeFormData): string {
  const expSection = data.experience
    .filter((e) => e.company || e.title)
    .map(
      (e) => `
**${e.title || 'Role'}** at **${e.company || 'Company'}**
${e.startDate} – ${e.current ? 'Present' : e.endDate}
${e.responsibilities || 'No details provided.'}`
    )
    .join('\n')

  const eduSection = data.education
    .filter((e) => e.school || e.degree)
    .map(
      (e) => `
**${e.degree || 'Degree'}** in ${e.field || 'Field'} — ${e.school || 'School'} (${e.graduationYear})${e.gpa ? ` | GPA: ${e.gpa}` : ''}`
    )
    .join('\n')

  return `You are an elite resume writer and career strategist with 20+ years of experience placing candidates at top companies like Google, Amazon, McKinsey, and Goldman Sachs.

Your task: Write a standout, ATS-optimized resume and personalized cover letter for this candidate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CANDIDATE PROFILE

Name: ${data.name}
Email: ${data.email}${data.phone ? `\nPhone: ${data.phone}` : ''}${data.location ? `\nLocation: ${data.location}` : ''}${data.linkedin ? `\nLinkedIn: ${data.linkedin}` : ''}${data.portfolio ? `\nPortfolio: ${data.portfolio}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TARGET ROLE

Job Title: ${data.targetJob}${data.targetCompany ? `\nCompany: ${data.targetCompany}` : ''}

Full Job Description:
${data.jobDescription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WORK EXPERIENCE
${expSection || 'No experience provided — focus on transferable skills and education.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EDUCATION
${eduSection || 'No education provided.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SKILLS & QUALIFICATIONS

Technical Skills: ${data.technicalSkills || 'Not specified'}
Soft Skills: ${data.softSkills || 'Not specified'}${data.certifications ? `\nCertifications: ${data.certifications}` : ''}${data.languages ? `\nLanguages: ${data.languages}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUME WRITING REQUIREMENTS

1. PROFESSIONAL SUMMARY: Write a powerful 2–3 sentence summary at the top that immediately positions them for this specific role. Reference the job title and top 2 requirements.

2. ACTION VERBS: Start every bullet with strong action verbs (Led, Built, Architected, Increased, Reduced, Delivered, Launched, Managed, Grew, Engineered, etc.). Never start with "Responsible for" or "Worked on."

3. QUANTIFY EVERYTHING: Add specific numbers, percentages, dollar amounts, team sizes, and timeframes wherever plausible. If not given, make reasonable, believable estimates based on the role/industry.

4. ATS KEYWORDS: Extract the most important keywords, skills, and phrases from the job description and weave them naturally throughout the resume. This is critical for beating ATS filters.

5. FORMAT: Use clean, ATS-safe formatting. No tables, graphics, or special characters. Use standard section headers: PROFESSIONAL SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS. Left-align everything.

6. LENGTH: 1 page for under 5 years experience. Up to 2 pages for senior roles.

7. IMPACT: Every bullet should answer "so what?" — show business impact, not just tasks.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COVER LETTER REQUIREMENTS

1. OPENING: Start with a compelling, specific hook — NOT "I am writing to apply for..." Reference a specific aspect of the company, role, or job posting in the first sentence.

2. BODY: 2 paragraphs max. Highlight the 2–3 most relevant experiences that directly match the key requirements. Show you understand their specific pain points.

3. ENTHUSIASM: Sound genuinely excited about this company and role specifically, not generic.

4. CLOSING: Clear, confident call to action. Brief, professional.

5. TONE: Professional but human. The voice of someone who is clearly qualified and knows it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUTPUT FORMAT — Follow exactly:

<RESUME>
[Full resume text here — use plain text, dashes for bullets, all caps for section headers]
</RESUME>

<COVER_LETTER>
[Full cover letter here]
</COVER_LETTER>`
}

function parseOutput(text: string): { resume: string; coverLetter: string } {
  const resumeMatch = text.match(/<RESUME>([\s\S]*?)<\/RESUME>/)
  const coverMatch = text.match(/<COVER_LETTER>([\s\S]*?)<\/COVER_LETTER>/)
  return {
    resume: resumeMatch ? resumeMatch[1].trim() : text,
    coverLetter: coverMatch ? coverMatch[1].trim() : '',
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'API key not configured.' }, { status: 500 })
  }

  const data: ResumeFormData = await req.json()

  if (!data.name || !data.email || !data.targetJob) {
    return Response.json({ error: 'Name, email, and target job are required.' }, { status: 400 })
  }

  const encoder = new TextEncoder()

  // Stream the response — this keeps the connection alive during generation
  // and bypasses Vercel's blocking-response timeout
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullText = ''

        const anthropicStream = client.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          messages: [{ role: 'user', content: buildPrompt(data) }],
        })

        for await (const event of anthropicStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullText += event.delta.text
            // Heartbeat keeps the connection alive while Claude is writing
            controller.enqueue(encoder.encode('\n'))
          }
        }

        const result = parseOutput(fullText)
        controller.enqueue(encoder.encode(JSON.stringify(result)))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Generation failed'
        controller.enqueue(encoder.encode(JSON.stringify({ error: msg })))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
