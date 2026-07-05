export interface EspnGame {
  id: string
  sport: 'World Cup' | 'MLB' | 'NFL' | 'NBA' | 'NHL'
  sportKey: string
  homeTeam: string
  awayTeam: string
  homeRecord: string
  awayRecord: string
  homeScore?: string
  awayScore?: string
  gameClock?: string   // e.g. "74'" or "3rd Q" or "Top 7th"
  gameTime: string
  gameDate: string
  isLive: boolean
}

interface SportConfig {
  key: string
  label: 'World Cup' | 'MLB' | 'NFL' | 'NBA' | 'NHL'
  espnSport: string
  espnLeague: string
}

const SPORT_CONFIGS: SportConfig[] = [
  { key: 'wc',  label: 'World Cup', espnSport: 'soccer',     espnLeague: 'fifa.worldcup' },
  { key: 'mlb', label: 'MLB',       espnSport: 'baseball',   espnLeague: 'mlb' },
  { key: 'nfl', label: 'NFL',       espnSport: 'football',   espnLeague: 'nfl' },
  { key: 'nba', label: 'NBA',       espnSport: 'basketball', espnLeague: 'nba' },
  { key: 'nhl', label: 'NHL',       espnSport: 'hockey',     espnLeague: 'nhl' },
]

function formatGameTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  }) + ' ET'
}

function parseRecord(competitor: Record<string, unknown>): string {
  const records = (competitor?.records as Array<{ type?: string; name?: string; summary?: string }>) ?? []
  const r = records.find(x => x.type === 'total' || x.name === 'overall') ?? records[0]
  return r?.summary ?? (competitor?.record as string) ?? ''
}

export async function fetchEspnGames(sportKey: string): Promise<EspnGame[]> {
  const config = SPORT_CONFIGS.find(s => s.key === sportKey)
  if (!config) return []

  const url = `https://site.api.espn.com/apis/site/v2/sports/${config.espnSport}/${config.espnLeague}/scoreboard`

  try {
    const res = await fetch(url, {
      next: { revalidate: 600 },
      headers: { 'User-Agent': 'Mozilla/5.0 GambitParlay/1.0' },
    })
    if (!res.ok) return []

    const data = await res.json()
    const events: Record<string, unknown>[] = data.events ?? []

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + 1)
    cutoff.setHours(23, 59, 59, 999)

    return events
      .filter(event => {
        const d = new Date(event.date as string)
        const competitions = event.competitions as Array<Record<string, unknown>>
        const status = (competitions?.[0]?.status as Record<string, unknown>)?.type as Record<string, unknown>
        const name = (status?.name as string) ?? ''
        return d <= cutoff && !name.includes('FINAL') && !name.includes('STATUS_FINAL')
      })
      .map(event => {
        const competitions = event.competitions as Array<Record<string, unknown>>
        const comp = competitions?.[0] ?? {}
        const competitors = (comp.competitors as Array<Record<string, unknown>>) ?? []
        const home = competitors.find(c => c.homeAway === 'home') ?? {}
        const away = competitors.find(c => c.homeAway === 'away') ?? {}
        const homeTeam = (home.team as Record<string, unknown>) ?? {}
        const awayTeam = (away.team as Record<string, unknown>) ?? {}
        const statusObj = (comp.status as Record<string, unknown>) ?? {}
        const statusType = (statusObj.type as Record<string, unknown>) ?? {}
        const statusName = (statusType.name as string) ?? ''
        const isLive = statusName.includes('IN_PROGRESS')
        const displayClock = (statusObj.displayClock as string) ?? ''
        const period = statusObj.period as number | undefined

        // Build a human-readable clock string per sport
        let gameClock: string | undefined
        if (isLive && period) {
          if (config.key === 'wc' || config.key === 'soccer') {
            gameClock = displayClock ? `${displayClock}'` : undefined
          } else if (config.key === 'mlb') {
            gameClock = displayClock || undefined
          } else if (config.key === 'nba') {
            const qtr = ['1st', '2nd', '3rd', '4th'][period - 1] ?? `Q${period}`
            gameClock = displayClock ? `${displayClock} · ${qtr}` : qtr
          } else if (config.key === 'nfl') {
            const qtr = ['1st', '2nd', '3rd', '4th'][period - 1] ?? `Q${period}`
            gameClock = displayClock ? `${displayClock} · ${qtr}` : qtr
          } else if (config.key === 'nhl') {
            const per = ['1st', '2nd', '3rd'][period - 1] ?? `P${period}`
            gameClock = displayClock ? `${displayClock} · ${per}` : per
          }
        }

        return {
          id: event.id as string,
          sport: config.label,
          sportKey: config.key,
          homeTeam: (homeTeam.displayName as string) ?? 'Home',
          awayTeam: (awayTeam.displayName as string) ?? 'Away',
          homeRecord: parseRecord(home),
          awayRecord: parseRecord(away),
          homeScore: isLive ? (home.score as string) ?? undefined : undefined,
          awayScore: isLive ? (away.score as string) ?? undefined : undefined,
          gameClock,
          gameTime: formatGameTime(event.date as string),
          gameDate: event.date as string,
          isLive,
        }
      })
  } catch {
    return []
  }
}

export async function fetchAllSports(): Promise<Record<string, EspnGame[]>> {
  const results = await Promise.allSettled(
    SPORT_CONFIGS.map(s =>
      fetchEspnGames(s.key).then(games => ({ key: s.key, games }))
    )
  )

  const out: Record<string, EspnGame[]> = {}
  for (const r of results) {
    if (r.status === 'fulfilled') {
      out[r.value.key] = r.value.games
    }
  }
  return out
}
