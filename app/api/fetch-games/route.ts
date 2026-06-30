import { NextResponse } from 'next/server'
import { SPORT_LABEL, type NormalizedGame } from '@/lib/oddsApi'

const SPORT_KEYS = [
  'soccer_fifa_world_cup',
  'americanfootball_nfl',
  'baseball_mlb',
  'basketball_nba',
  'soccer_epl',
  'icehockey_nhl',
]

interface OddsOutcome {
  name: string
  price: number
  point?: number
}

interface OddsGame {
  id: string
  sport_key: string
  home_team: string
  away_team: string
  commence_time: string
  bookmakers: Array<{
    key: string
    markets: Array<{
      key: string
      outcomes: OddsOutcome[]
    }>
  }>
}

function toAmerican(decimal: number): string {
  if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`
  return `${Math.round(-100 / (decimal - 1))}`
}

async function fetchSport(sportKey: string, apiKey: string): Promise<NormalizedGame[]> {
  const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=h2h,spreads&oddsFormat=decimal&dateFormat=iso`
  const res = await fetch(url, { next: { revalidate: 1800 } })
  if (!res.ok) return []
  const games: OddsGame[] = await res.json()

  const now = Date.now()
  const cutoff = now + 48 * 60 * 60 * 1000

  return games
    .filter(g => {
      const t = new Date(g.commence_time).getTime()
      return t > now && t < cutoff
    })
    .slice(0, 4)
    .map(game => {
      const bm = game.bookmakers.find(b => b.key === 'draftkings') ?? game.bookmakers[0]
      const h2h = bm?.markets.find(m => m.key === 'h2h')
      const spreads = bm?.markets.find(m => m.key === 'spreads')

      const homeH2h = h2h?.outcomes.find(o => o.name === game.home_team)
      const awayH2h = h2h?.outcomes.find(o => o.name === game.away_team)
      const homeSpreadOut = spreads?.outcomes.find(o => o.name === game.home_team)
      const awaySpreadOut = spreads?.outcomes.find(o => o.name === game.away_team)

      return {
        sport: SPORT_LABEL[sportKey] ?? sportKey,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        gameDate: game.commence_time,
        homeMoneyline: homeH2h ? toAmerican(homeH2h.price) : null,
        awayMoneyline: awayH2h ? toAmerican(awayH2h.price) : null,
        homeSpread: homeSpreadOut?.point ?? null,
        homeSpreadOdds: homeSpreadOut ? toAmerican(homeSpreadOut.price) : null,
        awaySpread: awaySpreadOut?.point ?? null,
        awaySpreadOdds: awaySpreadOut ? toAmerican(awaySpreadOut.price) : null,
      }
    })
}

export async function GET() {
  if (!process.env.ODDS_API_KEY) {
    return NextResponse.json({ error: 'Odds API not configured.' }, { status: 503 })
  }

  const results = await Promise.allSettled(
    SPORT_KEYS.map(key => fetchSport(key, process.env.ODDS_API_KEY!))
  )

  const games = results
    .filter((r): r is PromiseFulfilledResult<NormalizedGame[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)

  return NextResponse.json({ games, count: games.length })
}
