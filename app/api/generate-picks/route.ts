import { NextResponse } from 'next/server'
import type { Pick, Sport, Tier } from '@/lib/types'

const SPORTS: Sport[] = ['NFL', 'MLB', 'NBA', 'Soccer', 'NHL']

const SYSTEM_PROMPT = `You are HeyParlay's AI sports analyst. Generate exactly 6 realistic sports betting picks for today.

Each pick must be a JSON object with these fields:
- id: string (uuid format)
- sport: "NFL" | "MLB" | "NBA" | "Soccer" | "NHL"
- homeTeam: string
- awayTeam: string
- line: string (e.g. "Chiefs -7.5", "Dodgers ML", "Over 48.5")
- odds: string (e.g. "-110", "+145", "-115")
- confidence: number (50-95)
- tier: 1 | 2 | 3 (1=safe, 2=balanced, 3=high risk)
- research: string (2-3 sentences of analysis)
- warning: string | null (injury or weather concern, or null)
- result: "pending"
- gameDate: string (today's date ISO format)
- isWarning: false

Return ONLY a valid JSON array of 6 picks. No markdown, no extra text.`

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI pick generation not configured.' }, { status: 503 })
  }

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Generate 6 sports betting picks for ${today}. Include a mix of sports (NFL, MLB, NBA, Soccer). Make them realistic with specific team names, spreads, and research.`,
      }],
      system: SYSTEM_PROMPT,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const picks: Pick[] = JSON.parse(text)

    if (!Array.isArray(picks) || picks.length === 0) {
      throw new Error('Invalid picks format from AI')
    }

    return NextResponse.json({ picks, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Generate picks error:', err)
    return NextResponse.json({ error: 'Failed to generate picks.' }, { status: 500 })
  }
}
