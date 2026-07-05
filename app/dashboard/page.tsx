'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import GameDetailPanel from '@/components/GameDetailPanel'
import { createClient } from '@/lib/supabase/client'
import type { GamePick } from '@/app/api/today-games/route'

// ── Types ─────────────────────────────────────────────────────────────────────

type Sentiment = 'positive' | 'negative' | 'neutral'
type Tier = 1 | 2 | 3

// ── Sport tabs config ─────────────────────────────────────────────────────────

const SPORT_TABS = [
  { key: 'wc',  label: 'World Cup' },
  { key: 'mlb', label: 'MLB' },
  { key: 'nfl', label: 'NFL' },
  { key: 'nba', label: 'NBA' },
  { key: 'nhl', label: 'NHL' },
]

const OFF_SEASON: Record<string, { emoji: string; message: string }> = {
  nfl: { emoji: '🏈', message: 'NFL Preseason starts August — picks ready opening week.' },
  nba: { emoji: '🏀', message: 'NBA Offseason — back in October with opening night picks.' },
  nhl: { emoji: '🏒', message: 'NHL Offseason — season resumes in October.' },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: Tier }) {
  const styles: Record<Tier, string> = {
    1: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
    2: 'bg-neon/10 text-neon border-neon/20',
    3: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }
  return (
    <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${styles[tier]}`}>
      Tier {tier}
    </span>
  )
}

function FactorChip({ label, sentiment }: { label: string; sentiment: Sentiment }) {
  const styles: Record<Sentiment, string> = {
    positive: 'text-emerald-400 bg-emerald-500/7 border-emerald-500/15',
    negative: 'text-red-400 bg-red-500/7 border-red-500/15',
    neutral: 'text-white/40 bg-white/4 border-white/10',
  }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${styles[sentiment]}`}>
      {label}
    </span>
  )
}

function LockSVG() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="opacity-50">
      <rect x="2" y="7" width="10" height="8" rx="2" stroke="white" strokeWidth="1.4" />
      <path d="M4 7V5C4 3.3 5.3 2 7 2C8.7 2 10 3.3 10 5V7" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="7" cy="11" r="1.2" fill="white" />
    </svg>
  )
}

function ConfBar({ value, tier }: { value: number; tier: Tier }) {
  const fill = value >= 75 ? '#7CFC00' : value >= 60 ? '#f59e0b' : '#ef4444'
  const label = tier === 1 ? '#7CFC00' : tier === 2 ? '#7CFC00' : '#f59e0b'
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-bold tracking-widest uppercase text-white/30">Confidence</span>
        <span className="text-[11px] font-black font-mono tabular-nums" style={{ color: label }}>{value}%</span>
      </div>
      <div className="h-[3px] bg-white/8 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: fill }} />
      </div>
    </div>
  )
}

function GameCard({ game, isMember, onUnlock, onClick }: {
  game: GamePick
  isMember: boolean
  onUnlock: () => void
  onClick: () => void
}) {
  const pickParts = game.pick?.split('—') ?? []
  const pickTeam = pickParts[0]?.trim()
  const pickDesc = pickParts[1]?.trim()
  const hasScore = game.isLive && game.homeScore !== undefined && game.awayScore !== undefined

  const homeSide = { name: game.homeTeam, record: game.homeRecord, score: game.homeScore }
  const awaySide = { name: game.awayTeam, record: game.awayRecord, score: game.awayScore }

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.985] transition-transform select-none"
      style={{
        background: '#111',
        border: game.isLive ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(255,255,255,0.07)',
        boxShadow: game.isLive ? '0 0 0 1px rgba(249,115,22,0.08) inset' : 'none',
      }}
      onClick={onClick}
    >
      {/* Top accent bar */}
      <div className="h-[3px]" style={{
        background: game.isLive
          ? 'linear-gradient(90deg,#f97316,#fb923c)'
          : 'linear-gradient(90deg,rgba(255,255,255,0.06),transparent)',
      }} />

      {/* Header */}
      <div className="px-4 pt-3 pb-2.5 flex items-center justify-between">
        <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {game.sport}
        </span>
        {game.isLive ? (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" />
            {game.gameClock ?? 'LIVE'}
          </span>
        ) : (
          <span className="text-[11px] font-medium font-mono tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {game.gameTime}
          </span>
        )}
      </div>

      {/* Scoreboard — stacked rows */}
      <div className="px-4 pb-4 space-y-1">
        {[awaySide, homeSide].map((team, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-wider shrink-0"
                style={{ color: 'rgba(255,255,255,0.22)' }}>
                {i === 0 ? 'AWY' : 'HME'}
              </span>
              <span className="text-[14px] font-black text-white truncate">{team.name}</span>
            </div>
            <div className="shrink-0 ml-3">
              {hasScore
                ? <span className={`text-[22px] font-black font-mono tabular-nums leading-none ${
                    Number(team.score) > Number(i === 0 ? homeSide.score : awaySide.score)
                      ? 'text-neon' : 'text-white/50'
                  }`}>{team.score}</span>
                : <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.30)' }}>
                    {team.record}
                  </span>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Free — locked */}
      {!isMember && (
        <div className="mx-4 mb-4 rounded-xl px-4 py-3 flex items-center justify-between"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.010) 3px,rgba(255,255,255,0.010) 4px)',
          }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <LockSVG />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.30)' }}>Members Only</div>
              <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.18)' }}>Pick · Analysis · Confidence</div>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onUnlock() }}
            className="text-[11px] font-black text-neon px-3 py-1.5 rounded-lg shrink-0 transition-colors"
            style={{ background: 'rgba(124,252,0,0.10)', border: '1px solid rgba(124,252,0,0.22)' }}
          >
            Unlock →
          </button>
        </div>
      )}

      {/* Member — pick */}
      {isMember && game.pick && game.tier && game.confidence !== undefined && (
        <>
          <div className="mx-4 mb-3 rounded-xl p-3.5"
            style={{ background: 'rgba(124,252,0,0.07)', border: '1px solid rgba(124,252,0,0.16)' }}>
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div>
                <div className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: 'rgba(124,252,0,0.55)' }}>
                  Our Pick
                </div>
                <div className="text-[15px] font-black tracking-tight leading-snug">
                  {pickTeam && <span className="text-neon">{pickTeam}</span>}
                  {pickDesc && <span className="text-white"> — {pickDesc}</span>}
                  {!pickParts[1] && <span className="text-white">{game.pick}</span>}
                </div>
              </div>
              <TierBadge tier={game.tier as Tier} />
            </div>
            <ConfBar value={game.confidence} tier={game.tier as Tier} />
          </div>

          {game.analysis && (
            <div className="mx-4 mb-4 rounded-xl p-3.5"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-[9px] font-black tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.20)' }}>
                Analysis
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(240,240,240,0.52)' }}>{game.analysis}</p>
              {game.factors && game.factors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {game.factors.map(f => (
                    <FactorChip key={f.label} label={f.label} sentiment={f.sentiment as Sentiment} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function WarningCard({ game, isMember }: { game: GamePick; isMember: boolean }) {
  return (
    <div className="mx-3.5 mb-2.5 rounded-2xl p-4 flex items-start gap-2.5"
      style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.22)' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[13px]"
        style={{ background: 'rgba(249,115,22,0.15)' }}>⚠️</div>
      <div>
        <div className="text-[9px] font-black tracking-widest uppercase text-orange-400 mb-0.5">Avoid · Today</div>
        <div className="text-[13px] font-black text-white mb-1">{game.homeTeam} vs {game.awayTeam}</div>
        <div className="text-[11px] font-medium leading-relaxed" style={{ color: 'rgba(249,115,22,0.65)' }}>
          {isMember
            ? game.warningText ?? 'High-risk game — recommend avoiding.'
            : 'Members only — unlock to see why we\'re flagging this game.'}
        </div>
      </div>
    </div>
  )
}

function SubscribeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-t-3xl px-6 pt-6 pb-10 animate-slideUp"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.10)' }}>
        <div className="w-9 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.20)' }} />
        <h2 className="text-[22px] font-black tracking-tight text-white mb-1.5">Unlock Every Pick</h2>
        <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.50)' }}>
          Get the full pick, AI analysis, injury report, and team form for every game — every day.
        </p>
        <div className="rounded-xl p-4 flex items-center justify-between mb-4"
          style={{ background: 'rgba(124,252,0,0.08)', border: '1px solid rgba(124,252,0,0.20)' }}>
          <div>
            <div className="text-[15px] font-black text-white">Premium</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>All sports · All picks · Cancel anytime</div>
          </div>
          <div className="text-[20px] font-black text-neon font-mono tabular-nums">
            $9.99<span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.40)' }}>/mo</span>
          </div>
        </div>
        <a href="/subscribe?plan=premium"
          className="block w-full py-4 text-center rounded-xl bg-neon text-black font-black text-[15px] hover:opacity-90 transition-opacity">
          Get Full Access
        </a>
        <button onClick={onClose}
          className="block w-full py-3 text-center text-[13px] font-semibold transition-colors hover:text-white mt-2"
          style={{ color: 'rgba(255,255,255,0.40)' }}>
          Maybe later
        </button>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-card border border-dim rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-16 bg-white/8 rounded" />
        <div className="h-4 w-20 bg-white/8 rounded" />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-5 bg-white/8 rounded" />
        <div className="w-6 h-4 bg-white/8 rounded" />
        <div className="flex-1 h-5 bg-white/8 rounded" />
      </div>
      <div className="h-14 bg-white/5 rounded-xl" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('wc')
  const [isMember, setIsMember] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState<GamePick | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [gamesLoading, setGamesLoading] = useState(true)
  const [allGames, setAllGames] = useState<Record<string, GamePick[]>>({})
  const [activeSports, setActiveSports] = useState<string[]>([])
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  // Check subscription
  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const { data } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('email', user.email)
          .eq('status', 'active')
          .maybeSingle()
        setIsMember(!!data)
      }
      setAuthLoading(false)
    }
    check()
  }, [])

  // Fetch games from ESPN + Claude
  useEffect(() => {
    const load = async () => {
      setGamesLoading(true)
      try {
        const res = await fetch('/api/today-games')
        const data = await res.json()
        const games: GamePick[] = data.games ?? []

        // Group by sportKey
        const grouped: Record<string, GamePick[]> = {}
        for (const game of games) {
          const key = game.sportKey ?? 'wc'
          if (!grouped[key]) grouped[key] = []
          grouped[key].push(game)
        }
        setAllGames(grouped)
        setActiveSports(data.sportsWithGames ?? Object.keys(grouped))

        // Auto-switch to first sport with games
        if (data.sportsWithGames?.length > 0 && !data.sportsWithGames.includes(activeTab)) {
          setActiveTab(data.sportsWithGames[0])
        }
      } catch {
        // silently fall through — show off-season placeholder
      }
      setGamesLoading(false)
    }
    load()
  }, [])

  const tabGames = allGames[activeTab] ?? []
  const warningGame = tabGames.find(g => g.isWarning)
  const regularGames = tabGames.filter(g => !g.isWarning)
  const hasGames = tabGames.length > 0
  const offSeason = OFF_SEASON[activeTab]
  const showOffSeason = !gamesLoading && (!hasGames || offSeason)

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto">

        {/* Sport tabs */}
        <div className="overflow-x-auto scrollbar-hide border-b border-dim">
          <div className="flex px-4 pt-3.5" style={{ width: 'max-content' }}>
            {SPORT_TABS.map(tab => {
              const hasData = activeSports.includes(tab.key)
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 pb-3 text-[13px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                    activeTab === tab.key
                      ? 'text-white border-neon'
                      : 'text-white/40 border-transparent hover:text-white/65'
                  }`}
                >
                  {hasData && <span className="w-1.5 h-1.5 rounded-full bg-neon shrink-0" />}
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Loading skeletons */}
        {gamesLoading && (
          <div className="flex flex-col gap-2.5 px-3.5 pt-4 pb-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* Off-season or no games */}
        {showOffSeason && (
          <div className="py-14 text-center text-white/40">
            <div className="text-3xl mb-3">{offSeason?.emoji ?? '📅'}</div>
            <p className="text-[13px] leading-relaxed px-8">
              {offSeason?.message ?? 'No games scheduled today. Check back tomorrow.'}
            </p>
          </div>
        )}

        {/* Game list */}
        {!gamesLoading && hasGames && !offSeason && (() => {
          const todayET = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' })
          const tomorrowDate = new Date(Date.now() + 86400000)
          const tomorrowET = tomorrowDate.toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' })

          const todayGames = regularGames.filter(g => {
            const d = new Date(g.gameDate).toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' })
            return d === todayET
          })
          const tomorrowGames = regularGames.filter(g => {
            const d = new Date(g.gameDate).toLocaleDateString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' })
            return d === tomorrowET
          })
          const tomorrowLabel = tomorrowDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/New_York' })

          return (
            <>
              {warningGame && (
                <div className="px-3.5 pt-3">
                  <WarningCard game={warningGame} isMember={!authLoading && isMember} />
                </div>
              )}

              {todayGames.length > 0 && (
                <>
                  <div className="flex items-baseline justify-between px-5 pt-4 pb-3">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-white/40">{today}</span>
                    <span className="text-[11px] text-white/30">{todayGames.length} game{todayGames.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-col gap-2.5 px-3.5">
                    {todayGames.map(game => (
                      <GameCard key={game.id} game={game} isMember={!authLoading && isMember}
                        onUnlock={() => setShowModal(true)} onClick={() => setSelectedGame(game)} />
                    ))}
                  </div>
                </>
              )}

              {tomorrowGames.length > 0 && (
                <>
                  <div className="flex items-baseline justify-between px-5 pt-5 pb-3">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-white/40">Tomorrow · {tomorrowLabel}</span>
                    <span className="text-[11px] text-white/30">{tomorrowGames.length} game{tomorrowGames.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-col gap-2.5 px-3.5">
                    {tomorrowGames.map(game => (
                      <GameCard key={game.id} game={game} isMember={!authLoading && isMember}
                        onUnlock={() => setShowModal(true)} onClick={() => setSelectedGame(game)} />
                    ))}
                  </div>
                </>
              )}
              <div className="pb-6" />
            </>
          )
        })()}

        {/* Bottom CTA */}
        {!authLoading && !isMember && (
          <div className="text-center pb-8">
            <button
              onClick={() => setShowModal(true)}
              className="text-[11px] font-bold transition-colors hover:text-neon"
              style={{ color: 'rgba(124,252,0,0.70)' }}
            >
              Unlock all picks — $9.99/mo →
            </button>
          </div>
        )}
        {!authLoading && isMember && (
          <div className="text-center pb-8">
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(124,252,0,0.60)' }}>
              Member Access Active
            </span>
          </div>
        )}
      </main>

      {showModal && <SubscribeModal onClose={() => setShowModal(false)} />}

      {selectedGame && (
        <GameDetailPanel
          game={selectedGame}
          isMember={!authLoading && isMember}
          onClose={() => setSelectedGame(null)}
          onUnlock={() => { setSelectedGame(null); setShowModal(true) }}
        />
      )}
    </>
  )
}
