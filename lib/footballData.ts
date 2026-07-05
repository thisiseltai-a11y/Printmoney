import type { EspnGame } from './espn'
import type { GameSummary } from './espnSummary'

const BASE = 'https://api.football-data.org/v4'

function token() { return process.env.FOOTBALL_DATA_API_KEY ?? '' }
function hdrs(): Record<string, string> { return { 'X-Auth-Token': token() } }

function formatGameTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York',
  }) + ' ET'
}

function stageLabel(stage: string): string {
  if (!stage) return ''
  return stage.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function safeScore(val: unknown): string | undefined {
  return val !== null && val !== undefined ? String(val) : undefined
}

export async function fetchWorldCupGames(): Promise<EspnGame[]> {
  if (!token()) return []

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 86400000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  try {
    const res = await fetch(
      `${BASE}/competitions/WC/matches?dateFrom=${fmt(now)}&dateTo=${fmt(tomorrow)}`,
      { next: { revalidate: 60 }, headers: hdrs() }
    )
    if (!res.ok) return []

    const data = await res.json()
    const matches: Record<string, unknown>[] = data.matches ?? []

    return matches
      .filter(m => !['FINISHED', 'AWARDED', 'POSTPONED', 'CANCELLED', 'SUSPENDED'].includes(m.status as string))
      .map(m => {
        const status = m.status as string
        const isLive = status === 'IN_PLAY' || status === 'PAUSED'
        const ft = (m.score as Record<string, unknown>)?.fullTime as Record<string, unknown>
        const homeTeam = m.homeTeam as Record<string, unknown>
        const awayTeam = m.awayTeam as Record<string, unknown>
        const minute = m.minute as number | undefined

        return {
          id: String(m.id),
          sport: 'World Cup' as const,
          sportKey: 'wc',
          homeTeam: (homeTeam?.name as string) ?? 'TBD',
          awayTeam: (awayTeam?.name as string) ?? 'TBD',
          homeRecord: stageLabel(m.stage as string),
          awayRecord: '',
          homeScore: isLive ? safeScore(ft?.home) : undefined,
          awayScore: isLive ? safeScore(ft?.away) : undefined,
          gameClock: isLive ? (minute ? `${minute}'` : 'LIVE') : undefined,
          gameTime: formatGameTime(m.utcDate as string),
          gameDate: m.utcDate as string,
          isLive,
        }
      })
  } catch {
    return []
  }
}

export async function fetchWorldCupMatchSummary(matchId: string): Promise<GameSummary | null> {
  if (!token()) return null

  try {
    const [matchRes, h2hRes] = await Promise.allSettled([
      fetch(`${BASE}/matches/${matchId}`, { next: { revalidate: 60 }, headers: hdrs() }),
      fetch(`${BASE}/matches/${matchId}/head2head?limit=6`, { next: { revalidate: 300 }, headers: hdrs() }),
    ])

    if (matchRes.status !== 'fulfilled' || !matchRes.value.ok) return null
    const m = await matchRes.value.json()

    const status = m.status as string
    const isLive = status === 'IN_PLAY' || status === 'PAUSED'
    const ft = (m.score as Record<string, unknown>)?.fullTime as Record<string, unknown>
    const ht = (m.score as Record<string, unknown>)?.halfTime as Record<string, unknown>
    const minute = m.minute as number | undefined
    const homeTeam = m.homeTeam as Record<string, unknown>
    const awayTeam = m.awayTeam as Record<string, unknown>
    const stage = stageLabel(m.stage as string)

    let h2hSummary: string | undefined
    if (h2hRes.status === 'fulfilled' && h2hRes.value.ok) {
      const h2h = await h2hRes.value.json()
      const agg = h2h.aggregates as Record<string, unknown> | undefined
      if (agg) {
        const total = (agg.numberOfMatches as number) ?? 0
        const hw = (agg.homeTeam as Record<string, unknown>)?.wins ?? 0
        const aw = (agg.awayTeam as Record<string, unknown>)?.wins ?? 0
        const draws = total - (hw as number) - (aw as number)
        h2hSummary = `Last ${total} meetings — ${homeTeam.name} ${hw}W · ${awayTeam.name} ${aw}W · ${draws}D`
      }
    }

    // Half-time stat row if available
    const teamStats = ht?.home !== null && ht?.home !== undefined
      ? [{ label: 'Half-time', home: String(ht.home), away: String(ht.away) }]
      : []

    // Goal scorers
    const goalsRaw = (m.goals as Array<Record<string, unknown>>) ?? []
    const goals = goalsRaw.map(g => {
      const gTeam = g.team as Record<string, unknown>
      const scorer = g.scorer as Record<string, unknown>
      const min = g.minute as number
      const inj = g.injuryTime as number | undefined
      const timeStr = inj ? `${min}+${inj}'` : `${min}'`
      const isHome = String(gTeam?.id) === String((homeTeam as Record<string, unknown>)?.id)
      const type = (g.type as string) ?? 'REGULAR'
      return {
        minute: timeStr,
        scorer: (scorer?.name as string) ?? '',
        team: isHome ? 'home' as const : 'away' as const,
        type,
      }
    })

    return {
      id: matchId,
      sportKey: 'wc',
      sport: 'World Cup',
      homeTeam: (homeTeam?.name as string) ?? 'TBD',
      awayTeam: (awayTeam?.name as string) ?? 'TBD',
      homeRecord: stage,
      awayRecord: '',
      homeScore: safeScore(ft?.home),
      awayScore: safeScore(ft?.away),
      gameClock: isLive && minute ? `${minute}'` : undefined,
      gameTime: formatGameTime(m.utcDate as string),
      isLive,
      venue: undefined,
      homeForm: [],
      awayForm: [],
      teamStats,
      homeInjuries: [],
      awayInjuries: [],
      situation: isLive && minute ? `${minute}' in play` : undefined,
      h2hSummary,
      goals,
    }
  } catch {
    return null
  }
}
