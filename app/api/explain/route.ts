import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'edge'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'API key not set' }, { status: 500 })
  }
  try {
    const { question, options, correctIndex, selectedIndex, baseExplanation } = await req.json()
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 25_000 })

    const prompt = `You are a TEAS exam tutor. A nursing student got this question wrong.

Question: ${question}

Options:
${options.map((o: string, i: number) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}

They selected: ${String.fromCharCode(65 + selectedIndex)}. ${options[selectedIndex]}
Correct answer: ${String.fromCharCode(65 + correctIndex)}. ${options[correctIndex]}

Base explanation: ${baseExplanation}

Write a clear, encouraging 2-3 sentence explanation of why their answer was wrong and why the correct answer is right. Be specific and educational. Do not start with "I" or use em dashes.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    const explanation = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as any).text)
      .join('')

    return Response.json({ explanation })
  } catch (e) {
    return Response.json({ error: 'Failed to generate explanation' }, { status: 500 })
  }
}
