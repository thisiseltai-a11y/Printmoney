export const SPORT_LABEL: Record<string, string> = {
  americanfootball_nfl: 'NFL',
  baseball_mlb: 'MLB',
  basketball_nba: 'NBA',
  soccer_epl: 'Soccer',
  icehockey_nhl: 'NHL',
}

export interface NormalizedGame {
  sport: string
  homeTeam: string
  awayTeam: string
  gameDate: string
  homeMoneyline: string | null
  awayMoneyline: string | null
  homeSpread: number | null
  homeSpreadOdds: string | null
  awaySpread: number | null
  awaySpreadOdds: string | null
}
