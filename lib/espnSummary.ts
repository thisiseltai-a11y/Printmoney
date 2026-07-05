export interface TeamStat { label: string; home: string; away: string }
export interface Injury { player: string; position: string; status: string; detail?: string }
export interface FormResult { result: 'W' | 'L' | 'D'; opponent: string; score: string }

export interface GameSummary {
  id: string
  sportKey: string
  sport: string
  homeTeam: string
  awayTeam: string
  homeRecord: string
  awayRecord: string
  homeScore?: string
  awayScore?: string
  gameClock?: string
  gameTime: string
  isLive: boolean
  venue?: string
  // MLB
  homePitcher?: string
  awayPitcher?: string
  homePitcherStats?: string
  awayPitcherStats?: string
  // Form
  homeForm: FormResult[]
  awayForm: FormResult[]
  // Last 10 + streak
  homeLastTen?: string
  awayLastTen?: string
  homeStreak?: string
  awayStreak?: string
  homeHomeRecord?: string
  awayAwayRecord?: string
  // Stats
  teamStats: TeamStat[]
  // Injuries
  homeInjuries: Injury[]
  awayInjuries: Injury[]
  // Situation (live)
  situation?: string
  // H2H
  h2hSummary?: string
}

function safeStr(v: unknown): string {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : ''
}

function getRecordByType(recs: Array<Record<string, unknown>>, ...types: string[]): string | undefined {
  for (const type of types) {
    const r = recs.find(x =>
      safeStr(x.type).toLowerCase() === type.toLowerCase() ||
      safeStr(x.name).toLowerCase() === type.toLowerCase()
    )
    if (r) return safeStr(r.summary) || undefined
  }
  return undefined
}

function extractForm(team: Record<string, unknown>): FormResult[] {
  const records = (team?.records as Array<Record<string, unknown>>) ?? []
  const splits = ((team?.splits as Record<string, unknown>)?.categories as Array<Record<string, unknown>>) ?? []
  // Try to get last 5 results from linescores or records
  const form: FormResult[] = []
  for (const rec of records) {
    if (safeStr(rec.type) === 'home' || safeStr(rec.name) === 'Last 5') {
      // parse summary like "3-1-1"
    }
  }
  // Fall back to empty — Claude will use its own knowledge
  return form
}

function extractPitcher(probables: Array<Record<string, unknown>>, homeAway: 'home' | 'away'): { name?: string; stats?: string } {
  const p = probables?.find(x => safeStr(x.homeAway) === homeAway)
  if (!p) return {}
  const athlete = p.athlete as Record<string, unknown> | undefined
  if (!athlete) return {}
  const name = safeStr(athlete.fullName || athlete.displayName)
  const stats = (p.statistics as Array<Record<string, unknown>>) ?? []
  const era = stats.find(s => safeStr(s.name) === 'ERA' || safeStr(s.abbreviation) === 'ERA')
  const eraVal = era ? safeStr(era.displayValue || era.value) : ''
  const wins = stats.find(s => safeStr(s.name) === 'wins' || safeStr(s.abbreviation) === 'W')
  const winsVal = wins ? safeStr(wins.displayValue || wins.value) : ''
  const statStr = [winsVal && `${winsVal}W`, eraVal && `ERA ${eraVal}`].filter(Boolean).join(' · ')
  return { name, stats: statStr || undefined }
}

function extractTeamStats(
  homeStats: Array<Record<string, unknown>>,
  awayStats: Array<Record<string, unknown>>,
  sportKey: string
): TeamStat[] {
  const WANT: Record<string, string[]> = {
    mlb: ['hits', 'runs', 'errors', 'strikeouts', 'ERA', 'batting average'],
    wc: ['possession', 'shots', 'shots on target', 'fouls', 'corner kicks', 'saves'],
    nfl: ['total yards', 'passing yards', 'rushing yards', 'turnovers', 'sacks'],
    nba: ['points', 'rebounds', 'assists', 'turnovers', 'field goal %'],
    nhl: ['shots', 'goals', 'power play opportunities', 'faceoff wins'],
  }
  const wanted = WANT[sportKey] ?? []
  const result: TeamStat[] = []

  const findStat = (stats: Array<Record<string, unknown>>, key: string): string => {
    for (const s of stats) {
      const n = safeStr(s.name || s.abbreviation || s.label).toLowerCase()
      if (n.includes(key.toLowerCase())) {
        return safeStr(s.displayValue || s.value)
      }
    }
    return '—'
  }

  for (const label of wanted) {
    const home = findStat(homeStats, label)
    const away = findStat(awayStats, label)
    if (home !== '—' || away !== '—') {
      result.push({ label, home, away })
    }
  }
  return result
}

function extractInjuries(injuryData: Array<Record<string, unknown>>): { home: Injury[]; away: Injury[] } {
  const home: Injury[] = []
  const away: Injury[] = []
  for (const team of injuryData) {
    const side = safeStr(team.homeAway)
    const injuries = (team.injuries as Array<Record<string, unknown>>) ?? []
    const list = side === 'home' ? home : away
    for (const inj of injuries.slice(0, 5)) {
      const athlete = inj.athlete as Record<string, unknown> | undefined
      const status = inj.status as Record<string, unknown> | undefined
      list.push({
        player: safeStr(athlete?.fullName || athlete?.displayName),
        position: safeStr((athlete?.position as Record<string, unknown>)?.abbreviation),
        status: safeStr(status?.type || status?.name || inj.type),
        detail: safeStr(inj.detail || status?.description),
      })
    }
  }
  return { home, away }
}

export async function fetchGameSummary(espnId: string, sportKey: string): Promise<GameSummary | null> {
  const sportMap: Record<string, { sport: string; league: string; label: string }> = {
    wc:  { sport: 'soccer',     league: 'fifa.worldcup.2026', label: 'World Cup' },
    mlb: { sport: 'baseball',   league: 'mlb',           label: 'MLB' },
    nfl: { sport: 'football',   league: 'nfl',           label: 'NFL' },
    nba: { sport: 'basketball', league: 'nba',           label: 'NBA' },
    nhl: { sport: 'hockey',     league: 'nhl',           label: 'NHL' },
  }
  const cfg = sportMap[sportKey]
  if (!cfg) return null

  const url = `https://site.api.espn.com/apis/site/v2/sports/${cfg.sport}/${cfg.league}/summary?event=${espnId}`

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { 'User-Agent': 'Mozilla/5.0 GambitParlay/1.0' },
    })
    if (!res.ok) return null
    const data = await res.json()

    // Header / competition
    const comp = (data.header?.competitions as Array<Record<string, unknown>>)?.[0] ?? {}
    const competitors = (comp.competitors as Array<Record<string, unknown>>) ?? []
    const home = competitors.find(c => safeStr(c.homeAway) === 'home') ?? {}
    const away = competitors.find(c => safeStr(c.homeAway) === 'away') ?? {}
    const homeTeamObj = (home.team as Record<string, unknown>) ?? {}
    const awayTeamObj = (away.team as Record<string, unknown>) ?? {}
    const statusObj = (comp.status as Record<string, unknown>) ?? {}
    const statusType = (statusObj.type as Record<string, unknown>) ?? {}
    const isLive = safeStr(statusType.name).includes('IN_PROGRESS')
    const shortDetail = safeStr(statusType.shortDetail)

    // Records
    const homeRecords = (home.records as Array<Record<string, unknown>>) ?? []
    const awayRecords = (away.records as Array<Record<string, unknown>>) ?? []
    const getRecord = (recs: Array<Record<string, unknown>>) => {
      const r = recs.find(x => safeStr(x.type) === 'total' || safeStr(x.name) === 'overall') ?? recs[0]
      return safeStr(r?.summary)
    }

    // Scores
    const homeScore = isLive ? safeStr(home.score) : undefined
    const awayScore = isLive ? safeStr(away.score) : undefined

    // Venue
    const venue = safeStr((data.gameInfo?.venue as Record<string, unknown>)?.fullName)

    // Pitchers (MLB)
    let homePitcher, awayPitcher, homePitcherStats, awayPitcherStats
    if (sportKey === 'mlb') {
      const probables = (comp.probables as Array<Record<string, unknown>>) ?? []
      const hp = extractPitcher(probables, 'home')
      const ap = extractPitcher(probables, 'away')
      homePitcher = hp.name
      homePitcherStats = hp.stats
      awayPitcher = ap.name
      awayPitcherStats = ap.stats
    }

    // Team stats from boxscore
    const boxTeams = (data.boxscore?.teams as Array<Record<string, unknown>>) ?? []
    const bHome = boxTeams.find(t => safeStr((t.team as Record<string, unknown>)?.id) === safeStr(homeTeamObj.id)) ?? {}
    const bAway = boxTeams.find(t => safeStr((t.team as Record<string, unknown>)?.id) === safeStr(awayTeamObj.id)) ?? {}
    const homeStatsList = (bHome.statistics as Array<Record<string, unknown>>) ?? []
    const awayStatsList = (bAway.statistics as Array<Record<string, unknown>>) ?? []
    const teamStats = extractTeamStats(homeStatsList, awayStatsList, sportKey)

    // Injuries
    const injuryData = (data.injuries as Array<Record<string, unknown>>) ?? []
    const { home: homeInjuries, away: awayInjuries } = extractInjuries(injuryData)

    // Live situation
    let situation: string | undefined
    if (isLive && data.situation) {
      const sit = data.situation as Record<string, unknown>
      if (sportKey === 'mlb') {
        const outs = safeStr(sit.outs)
        const balls = safeStr(sit.balls)
        const strikes = safeStr(sit.strikes)
        const onFirst = sit.onFirst ? '1st' : ''
        const onSecond = sit.onSecond ? '2nd' : ''
        const onThird = sit.onThird ? '3rd' : ''
        const bases = [onFirst, onSecond, onThird].filter(Boolean).join(', ')
        situation = `${outs} out${outs !== '1' ? 's' : ''}${bases ? `, runners on ${bases}` : ''} · ${balls}-${strikes} count`
      } else if (sportKey === 'nfl') {
        situation = safeStr(sit.shortDownDistanceText || sit.possessionText)
      }
    }

    // Game time
    const gameDate = safeStr(comp.date || data.header?.competitions?.[0]?.date)
    const gameTime = gameDate
      ? new Date(gameDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' }) + ' ET'
      : ''

    return {
      id: espnId,
      sportKey,
      sport: cfg.label,
      homeTeam: safeStr(homeTeamObj.displayName || homeTeamObj.name),
      awayTeam: safeStr(awayTeamObj.displayName || awayTeamObj.name),
      homeRecord: getRecord(homeRecords),
      awayRecord: getRecord(awayRecords),
      homeScore: homeScore || undefined,
      awayScore: awayScore || undefined,
      gameClock: isLive && shortDetail && shortDetail !== 'In Progress' ? shortDetail : undefined,
      gameTime,
      isLive,
      venue: venue || undefined,
      homePitcher,
      awayPitcher,
      homePitcherStats,
      awayPitcherStats,
      homeForm: [],
      awayForm: [],
      homeLastTen: getRecordByType(homeRecords, 'last10', 'Last 10', 'lastTen'),
      awayLastTen: getRecordByType(awayRecords, 'last10', 'Last 10', 'lastTen'),
      homeStreak: getRecordByType(homeRecords, 'streak', 'Streak'),
      awayStreak: getRecordByType(awayRecords, 'streak', 'Streak'),
      homeHomeRecord: getRecordByType(homeRecords, 'home', 'Home'),
      awayAwayRecord: getRecordByType(awayRecords, 'away', 'Away'),
      teamStats,
      homeInjuries,
      awayInjuries,
      situation,
    }
  } catch (err) {
    console.error('ESPN summary error:', err)
    return null
  }
}
