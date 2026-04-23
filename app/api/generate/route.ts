import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ResumeFormData } from '@/lib/types'

export const maxDuration = 60
export const runtime = 'edge'

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
${data.jobDescription?.trim() || `No job description provided. Infer typical responsibilities, required skills, and keywords for a "${data.targetJob}" role based on industry standards. Write the resume and cover letter as if you had a detailed job description for this exact role.`}

WORK EXPERIENCE:
${expSection || 'None provided'}

EDUCATION:
${eduSection || 'None provided'}

SKILLS PROVIDED BY CANDIDATE:
Technical: ${data.technicalSkills || 'none provided'}
Soft: ${data.softSkills || 'none provided'}
Certifications: ${data.certifications || 'none provided'}
Languages: ${data.languages || 'none provided'}

INSTRUCTIONS:
1. Write a 2-sentence professional summary tailored to the job
2. Use strong action verbs for every bullet point
3. Quantify achievements with numbers/percentages where possible
4. Include keywords from the job description naturally (ATS optimization)
5. Use clean plain-text formatting, all-caps section headers
6. SKILLS SECTION: Always include a "SKILLS" section with 10–15 skills minimum. Group them into exactly 3 lines using industry-appropriate category names that make sense for the target role (e.g. for tech: "Technical / Tools / Soft Skills"; for hospitality: "Service Skills / Food & Beverage / Interpersonal"; for healthcare: "Clinical Skills / Medical Tools / Patient Care"; for sales: "Sales Skills / CRM & Tools / Communication" — choose whatever 3 labels fit the job best). Format each group on its own line as:
   [Category Label]: [comma-separated skills]
   Use the candidate's provided skills as a base and expand with highly relevant skills inferred from the job description. If they provided nothing, infer all skills from the job description and experience. Do NOT use | separators. Label the section exactly "SKILLS".
7. Cover letter: open with a hook (not "I am writing to apply"), 3 short paragraphs
8. LinkedIn summary: write a 3-paragraph first-person About section (no "I am a..." opener), ~200 words, professional but human tone

Output EXACTLY in this format:
<RESUME>
[resume text]
</RESUME>
<COVER_LETTER>
[cover letter text]
</COVER_LETTER>
<LINKEDIN>
[linkedin summary text]
</LINKEDIN>`
}

function parseOutput(text: string): { resume: string; coverLetter: string; linkedinSummary: string } {
  const resumeMatch = text.match(/<RESUME>([\s\S]*?)<\/RESUME>/)
  const coverMatch = text.match(/<COVER_LETTER>([\s\S]*?)<\/COVER_LETTER>/)
  const linkedinMatch = text.match(/<LINKEDIN>([\s\S]*?)<\/LINKEDIN>/)
  return {
    resume: resumeMatch ? resumeMatch[1].trim() : text,
    coverLetter: coverMatch ? coverMatch[1].trim() : '',
    linkedinSummary: linkedinMatch ? linkedinMatch[1].trim() : '',
  }
}

async function generateWithRetry(client: Anthropic, prompt: string, attempts = 3): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    try {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
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
