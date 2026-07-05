import { NextResponse } from 'next/server'
import { fetchAllSports, type EspnGame } from '@/lib/espn'

/*
  Supabase table (run once in your Supabase SQL editor):

  CREATE TABLE IF NOT EXISTS daily_picks (
    date TEXT PRIMARY KEY,
    picks JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW()
  );

  Also add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars
  (found in Supabase → Settings → API → service_role key).
*/

export interface GamePick {
  id: string
  sport: string
  sportKey: string
  homeTeam: string
  awayTeam: string
  homeRecord: string
  awayRecord: string
  homeScore?: string
  awayScore?: string
  gameClock?: string
  gameTime: string
  gameDate: string
  isLive: boolean
  pick?: string
  tier?: 1 | 2 | 3
  confidence?: number
  analysis?: string
  factors?: { label: string; sentiment: 'positive' | 'negative' | 'neutral' }[]
  isWarning?: boolean
  warningText?: string
}

const CLAUDE_SYSTEM = `You are GambitParlay's AI sports analyst. You receive a list of real upcoming games fetched from ESPN.

For each game, provide:
- pick: concise recommendation e.g. "France — Draw No Bet" or "Yankees — ML" or "Over 2.5 Goals"
- tier: 1 (safe, high confidence), 2 (balanced), or 3 (high risk / value play)
- confidence: integer 50-95
- analysis: 2-3 sentences using team records, recent form, known matchup history, injuries, home/away splits
- factors: 3-5 key factors, each with label (short phrase) and sentiment: "positive" (supports pick), "negative" (works against), or "neutral"
- isWarning: true for the ONE game you consider most risky/volatile to bet (flag as avoid)
- warningText: if isWarning true, explain why in 1-2 sentences; otherwise null

Return ONLY a valid JSON array. No markdown, no explanation, no code fences.
Each element must include all fields from the input (id, sport, sportKey, homeTeam, awayTeam, homeRecord, awayRecord, gameTime, gameDate, isLive) plus the new pick fields above.`

async function analyzeWithClaude(games: EspnGame[]): Promise<GamePick[]> {
  if (!process.env.ANTHROPIC_API_KEY) return games.map(g => ({ ...g }))

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const gameList = games.map((g, i) =>
    `${i + 1}. [${g.sport}] ${g.homeTeam} (${g.homeRecord}) vs ${g.awayTeam} (${g.awayRecord}) — ${g.gameTime}`
  ).join('\n')

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: CLAUDE_SYSTEM,
      messages: [{
        role: 'user',
        content: `Today is ${today}. Here are today's upcoming games:\n\n${gameList}\n\nAnalyze each game and return the JSON array.`,
      }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array found')

    const parsed: GamePick[] = JSON.parse(match[0])
    return parsed
  } catch (err) {
    console.error('Claude analysis error:', err)
    return games.map(g => ({ ...g }))
  }
}

async function loadCache(dateStr: string): Promise<GamePick[] | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { data } = await sb.from('daily_picks').select('picks').eq('date', dateStr).maybeSingle()
    return data?.picks ?? null
  } catch {
    return null
  }
}

async function saveCache(dateStr: string, picks: GamePick[]): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    await sb.from('daily_picks').upsert({ date: dateStr, picks, generated_at: new Date().toISOString() })
  } catch {}
}

export async function GET() {
  const dateStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  // 1. Try Supabase cache first
  const cached = await loadCache(dateStr)
  if (cached?.length) {
    return NextResponse.json({ games: cached, cached: true })
  }

  // 2. Fetch live ESPN data
  const allGames = await fetchAllSports()
  const flatGames = Object.values(allGames).flat()

  if (!flatGames.length) {
    return NextResponse.json({ games: [], cached: false })
  }

  // 3. Only analyze games happening today (not in offseason/no games)
  const todayGames = flatGames.filter(g => {
    const d = new Date(g.gameDate)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  })

  // 4. Get Claude analysis
  const picks = todayGames.length > 0 ? await analyzeWithClaude(todayGames) : flatGames.map(g => ({ ...g }))

  // 5. Save to Supabase cache (fire and forget)
  if (picks.length > 0) saveCache(dateStr, picks)

  return NextResponse.json({
    games: picks,
    cached: false,
    sportsWithGames: Object.entries(allGames)
      .filter(([, games]) => games.length > 0)
      .map(([key]) => key),
  })
}
