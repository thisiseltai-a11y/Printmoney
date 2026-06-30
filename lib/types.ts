export type Tier = 1 | 2 | 3
export type Sport = 'NFL' | 'MLB' | 'NBA' | 'Soccer' | 'NHL' | 'World Cup'
export type BetResult = 'pending' | 'win' | 'loss' | 'push'
export type SubTier = 'free' | 'premium' | 'vip'

export interface Pick {
  id: string
  sport: Sport
  homeTeam: string
  awayTeam: string
  line: string
  odds: string
  confidence: number
  tier: Tier
  research: string
  warning?: string
  result: BetResult
  gameDate: string
  isWarning?: boolean
}

export interface Bet {
  id: string
  pickId?: string
  sport: Sport
  description: string
  amount: number
  odds: string
  tier: Tier
  result: BetResult
  payout?: number
  createdAt: string
}

export interface UserProfile {
  id: string
  email: string
  subTier: SubTier
  stripeCustomerId?: string
  createdAt: string
}

export interface ParlayLeg {
  pick: Pick
  odds: string
}
