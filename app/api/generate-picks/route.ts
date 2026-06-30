import { NextResponse } from 'next/server'
import type { Pick } from '@/lib/types'
import type { NormalizedGame } from '@/lib/oddsApi'

const SYSTEM_PROMPT = `You are HeyParlay's AI sports analyst. You receive real upcoming games with live odds from DraftKings.

Your job:
1. Select the 6 best picks from the games provided.
2. Choose ONE game to flag as a warning (avoid pick) — set isWarning: true on it.
3. For each pick, decide: spread bet or moneyline, whichever has more edge.

Return a JSON array of exactly 7 objects (6 picks + 1 warning). Each object:
{
  "id": "unique string",
  "sport": "NFL" | "MLB" | "NBA" | "Soccer" | "NHL",
  "homeTeam": "team name",
  "awayTeam": "team name",
  "line": "e.g. Chiefs -7.5 or Dodgers ML",
  "odds": "American odds e.g. -110 or +145",
  "confidence": number between 50 and 95,
  "tier": 1 | 2 | 3,
  "research": "2-3 sentence analysis using the data provided",
  "warning": "string if concern exists, otherwise null",
  "result": "pending",
  "gameDate": "ISO date string from input",
  "isWarning": false
}

For the 1 warning pick set isWarning: true and write a clear avoid reason in the warning field.
Tiers: 1 = safe/high confidence, 2 = balanced, 3 = high risk/value play.
Return ONLY valid JSON array. No markdown, no explanation.`

async function fetchGames(): Promise<NormalizedGame[]> {
  if (!process.env.ODDS_API_KEY) return []

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/fetch-games`, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.games ?? []
  } catch {
    return []
  }
}

function formatGamesForPrompt(games: NormalizedGame[]): string {
  if (!games.length) return 'No live games available — generate realistic picks for today.'

  return games.map((g, i) => {
    const spread = g.homeSpread !== null
      ? `Spread: ${g.homeTeam} ${g.homeSpread > 0 ? '+' : ''}${g.homeSpread} (${g.homeSpreadOdds}) / ${g.awayTeam} ${g.awaySpread! > 0 ? '+' : ''}${g.awaySpread} (${g.awaySpreadOdds})`
      : 'Spread: N/A'
    const ml = g.homeMoneyline
      ? `Moneyline: ${g.homeTeam} ${g.homeMoneyline} / ${g.awayTeam} ${g.awayMoneyline}`
      : 'Moneyline: N/A'
    const date = new Date(g.gameDate).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', timeZone: 'America/New_York' })

    return `Game ${i + 1}: [${g.sport}] ${g.awayTeam} @ ${g.homeTeam} — ${date} ET\n  ${spread}\n  ${ml}`
  }).join('\n\n')
}

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI pick generation not configured.' }, { status: 503 })
  }

  try {
    const [Anthropic, games] = await Promise.all([
      import('@anthropic-ai/sdk').then(m => m.default),
      fetchGames(),
    ])

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const gameList = formatGamesForPrompt(games)
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Today is ${today}. Here are the upcoming games with live odds:\n\n${gameList}\n\nGenerate 7 picks (6 picks + 1 warning/avoid).`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array in response')

    const picks: Pick[] = JSON.parse(jsonMatch[0])
    if (!Array.isArray(picks) || picks.length === 0) throw new Error('Invalid picks format')

    return NextResponse.json({
      picks,
      liveData: games.length > 0,
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Generate picks error:', err)
    return NextResponse.json({ error: 'Failed to generate picks.' }, { status: 500 })
  }
}
