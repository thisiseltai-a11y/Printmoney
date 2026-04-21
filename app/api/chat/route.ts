import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAgent } from '@/lib/agents'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY is not configured.' }, { status: 500 })
  }

  const { messages, agentSlug } = await req.json()
  const agent = getAgent(agentSlug)

  if (!agent) {
    return Response.json({ error: 'Unknown agent.' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 30_000 })

  const stream = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: agent.systemPrompt,
    messages,
    stream: true,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
