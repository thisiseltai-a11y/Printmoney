import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY
  const hasFootballKey = !!process.env.FOOTBALL_DATA_API_KEY
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  let claudeTest: string
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      claudeTest = 'NO KEY'
    } else {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Reply with the word WORKING only.' }],
      })
      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      claudeTest = `OK: ${text.trim()}`
    }
  } catch (err: unknown) {
    claudeTest = `ERROR: ${err instanceof Error ? err.message : String(err)}`
  }

  return NextResponse.json({
    env: { hasAnthropicKey, hasFootballKey, hasSupabaseUrl, hasServiceRole },
    claudeTest,
  })
}
