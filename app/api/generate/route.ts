import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ResumeFormData } from '@/lib/types'

export const maxDuration = 60

function buildPrompt(data: ResumeFormData): string {
  const expSection = data.experience
    .filter((e) => e.company || e.title)
    .map(
      (e) => `
${e.title || 'Role'} at ${e.company || 'Company'} | ${e.startDate} - ${e.current ? 'Present' : e.endDate}
${e.responsibilities || ''}`
    )
    .join('\n')

  const eduSection = data.education
    .filter((e) => e.school || e.degree)
    .map(
      (e) =>
        `${e.degree || 'Degree'} in ${e.field || 'Field'}, ${e.school || 'School'} (${e.graduationYear})${e.gpa ? `, GPA: ${e.gpa}` : ''}`
    )
    .join('\n')

  return `You are an expert resume writer. Create an ATS-optimized resume and cover letter.

CANDIDATE:
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || ''}
Location: ${data.location || ''}
LinkedIn: ${data.linkedin || ''}

TARGET JOB: ${data.targetJob}${data.targetCompany ? ` at ${data.targetCompany}` : ''}

JOB DESCRIPTION:
${data.jobDescription}

WORK EXPERIENCE:
${expSection || 'None provided'}

EDUCATION:
${eduSection || 'None provided'}

SKILLS:
Technical: ${data.technicalSkills || ''}
Soft: ${data.softSkills || ''}
Certifications: ${data.certifications || ''}
Languages: ${data.languages || ''}

INSTRUCTIONS:
1. Write a 2-sentence professional summary tailored to the job
2. Use strong action verbs for every bullet point
3. Quantify achievements with numbers/percentages where possible
4. Include keywords from the job description naturally (ATS optimization)
5. Use clean plain-text formatting, all-caps section headers
6. Cover letter: open with a hook (not "I am writing to apply"), 3 short paragraphs

Output EXACTLY in this format:
<RESUME>
[resume text]
</RESUME>
<COVER_LETTER>
[cover letter text]
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

async function generateWithRetry(client: Anthropic, prompt: string, attempts = 3): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    try {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      })

      return message.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { type: 'text'; text: string }).text)
        .join('')
    } catch (error) {
      const isRetryable =
        error instanceof Anthropic.APIConnectionError ||
        error instanceof Anthropic.InternalServerError ||
        (error instanceof Anthropic.RateLimitError && i < attempts - 1)

      if (isRetryable && i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
        continue
      }
      throw error
    }
  }
  throw new Error('All retry attempts exhausted')
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY is not set in environment variables.' }, { status: 500 })
  }

  let data: ResumeFormData
  try {
    data = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!data.name || !data.email || !data.targetJob) {
    return Response.json({ error: 'Name, email, and target job are required.' }, { status: 400 })
  }

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 45_000,
    })

    const text = await generateWithRetry(client, buildPrompt(data))
    return Response.json(parseOutput(text))
  } catch (error) {
    const name = error instanceof Error ? error.constructor.name : 'Error'
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Generate error:', name, msg)

    const isConnectionError = error instanceof Anthropic.APIConnectionError
    const userMessage = isConnectionError
      ? 'Could not reach the AI service. Please try again in a moment.'
      : `${name}: ${msg}`

    return Response.json({ error: userMessage }, { status: 500 })
  }
}
