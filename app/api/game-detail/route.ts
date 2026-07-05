import { NextRequest, NextResponse } from 'next/server'
import { fetchGameSummary, type GameSummary } from '@/lib/espnSummary'

export interface GameDetail {
  summary: GameSummary
  pick?: string
  tier?: 1 | 2 | 3
  confidence?: number
  analysis?: string
  factors?: { label: string; sentiment: 'positive' | 'negative' | 'neutral' }[]
  liveNarrative?: string
  scenarios?: { label: string; desc: string }[]
  bettingAngle?: string
}

const SYSTEM = `You are GambitParlay's AI sports analyst. You receive real ESPN game data.

Return ONLY valid JSON (no markdown, no code fences) with this shape:
{
  "pick": "Team Name — description e.g. Yankees — ML or France — Draw No Bet or Over 8.5 Runs",
  "tier": 1 | 2 | 3,
  "confidence": 50-95,
  "analysis": "2-3 sentences covering form, matchup, and key edge",
  "factors": [
    { "label": "short phrase", "sentiment": "positive" | "negative" | "neutral" }
  ],
  "liveNarrative": "If live: 2-3 sentences on how the game is going, momentum, and who has the edge right now. Null if not live.",
  "scenarios": [
    { "label": "If X happens", "desc": "one sentence outcome" }
  ],
  "bettingAngle": "One sentence on the specific bet type and why — e.g. the moneyline vs the spread, or why over/under makes more sense"
}

Tiers: 1 = safe/high-confidence, 2 = balanced, 3 = value/contrarian.
Factors: 4-6 items, mix positive and negative.
Scenarios: 2-3 items covering key game-deciding moments.`

async function analyzeGame(summary: GameSummary): Promise<Omit<GameDetail, 'summary'>> {
  if (!process.env.ANTHROPIC_API_KEY) return {}

  const parts: string[] = []

  parts.push(`GAME: [${summary.sport}] ${summary.homeTeam} vs ${summary.awayTeam}`)
  parts.push(`STATUS: ${summary.isLive ? `LIVE — ${summary.gameClock ?? 'In Progress'}` : `Scheduled ${summary.gameTime}`}`)
  if (summary.isLive && summary.homeScore !== undefined) {
    parts.push(`SCORE: ${summary.homeTeam} ${summary.homeScore} — ${summary.awayTeam} ${summary.awayScore}`)
  }
  if (summary.venue) parts.push(`VENUE: ${summary.venue}`)
  parts.push(`RECORDS: ${summary.homeTeam} ${summary.homeRecord} | ${summary.awayTeam} ${summary.awayRecord}`)

  if (summary.homePitcher || summary.awayPitcher) {
    parts.push(`STARTING PITCHERS:`)
    if (summary.homePitcher) parts.push(`  Home: ${summary.homePitcher}${summary.homePitcherStats ? ` (${summary.homePitcherStats})` : ''}`)
    if (summary.awayPitcher) parts.push(`  Away: ${summary.awayPitcher}${summary.awayPitcherStats ? ` (${summary.awayPitcherStats})` : ''}`)
  }

  if (summary.teamStats.length > 0) {
    parts.push(`GAME STATS:`)
    for (const s of summary.teamStats) {
      parts.push(`  ${s.label}: ${summary.homeTeam} ${s.home} | ${summary.awayTeam} ${s.away}`)
    }
  }

  if (summary.homeInjuries.length > 0) {
    const injs = summary.homeInjuries.map(i => `${i.player} (${i.position}) — ${i.status}`).join(', ')
    parts.push(`${summary.homeTeam} INJURIES: ${injs}`)
  }
  if (summary.awayInjuries.length > 0) {
    const injs = summary.awayInjuries.map(i => `${i.player} (${i.position}) — ${i.status}`).join(', ')
    parts.push(`${summary.awayTeam} INJURIES: ${injs}`)
  }

  if (summary.situation) {
    parts.push(`LIVE SITUATION: ${summary.situation}`)
  }

  const prompt = parts.join('\n') + '\n\nAnalyze this game and return the JSON.'

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return {}

    const parsed = JSON.parse(match[0])
    return {
      pick: parsed.pick,
      tier: parsed.tier,
      confidence: parsed.confidence,
      analysis: parsed.analysis,
      factors: parsed.factors,
      liveNarrative: parsed.liveNarrative,
      scenarios: parsed.scenarios,
      bettingAngle: parsed.bettingAngle,
    }
  } catch (err) {
    console.error('Claude game detail error:', err)
    return {}
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const sport = req.nextUrl.searchParams.get('sport')

  if (!id || !sport) {
    return NextResponse.json({ error: 'Missing id or sport' }, { status: 400 })
  }

  const summary = await fetchGameSummary(id, sport)
  if (!summary) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  const analysis = await analyzeGame(summary)

  return NextResponse.json({ summary, ...analysis })
}
