'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Lock, X, Zap, AlertTriangle } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type Sentiment = 'positive' | 'negative' | 'neutral'
type Tier = 1 | 2 | 3

interface Factor {
  label: string
  sentiment: Sentiment
}

interface Game {
  id: string
  sport: string
  homeTeam: string
  awayTeam: string
  homeRecord: string
  awayRecord: string
  gameTime: string
  pick?: string
  tier?: Tier
  confidence?: number
  analysis?: string
  factors?: Factor[]
  isWarning?: boolean
  warningText?: string
}

// ── Mock data (replaced by ESPN API later) ───────────────────────────────────

const GAMES: Record<string, Game[]> = {
  wc: [
    {
      id: 'wc-1',
      sport: 'World Cup',
      homeTeam: 'France 🇫🇷',
      awayTeam: 'Portugal 🇵🇹',
      homeRecord: '4–0–1',
      awayRecord: '3–1–1',
      gameTime: '3:00 PM ET',
      pick: 'France — Draw No Bet',
      tier: 1,
      confidence: 81,
      analysis: "France unbeaten in last 9 QF appearances. Mbappé fully fit after resting vs Morocco. Portugal missing Dias (hamstring) — exposed at CB. Les Bleus 4–0 in tournament play this year.",
      factors: [
        { label: 'France 4–0 form', sentiment: 'positive' },
        { label: 'Mbappé fit', sentiment: 'positive' },
        { label: 'Dias injured', sentiment: 'negative' },
        { label: 'Home advantage: neutral', sentiment: 'neutral' },
      ],
    },
    {
      id: 'wc-2',
      sport: 'World Cup',
      homeTeam: 'Brazil 🇧🇷',
      awayTeam: 'Argentina 🇦🇷',
      homeRecord: '4–1–0',
      awayRecord: '3–1–1',
      gameTime: '6:00 PM ET',
      pick: 'Over 2.5 Goals',
      tier: 2,
      confidence: 74,
      analysis: "The Clásico del Continente. 4 of last 5 H2H meetings produced 3+ goals. Both defenses showing fatigue — Brazil conceded in 3 straight. Messi in vintage form, 4 goals this tournament.",
      factors: [
        { label: 'High-scoring H2H', sentiment: 'positive' },
        { label: 'Messi 4 goals', sentiment: 'positive' },
        { label: 'Brazil defense leaky', sentiment: 'negative' },
      ],
    },
    {
      id: 'wc-3',
      sport: 'World Cup',
      homeTeam: 'Spain 🇪🇸',
      awayTeam: 'Germany 🇩🇪',
      homeRecord: '5–0–0',
      awayRecord: '3–2–0',
      gameTime: '9:00 PM ET',
      pick: 'Spain — ML',
      tier: 1,
      confidence: 79,
      analysis: "Spain only team with perfect record this World Cup. Yamal in electric form. Germany vulnerable on the counter — gave up 2 vs Japan. Spain's possession game suffocates high-press teams.",
      factors: [
        { label: 'Only perfect record', sentiment: 'positive' },
        { label: 'Yamal on fire', sentiment: 'positive' },
        { label: 'Germany press susceptible', sentiment: 'negative' },
      ],
    },
    {
      id: 'wc-warn',
      sport: 'World Cup',
      homeTeam: 'Germany 🇩🇪',
      awayTeam: 'Portugal 🇵🇹',
      homeRecord: '3–2–0',
      awayRecord: '3–1–1',
      gameTime: 'Tomorrow',
      isWarning: true,
      warningText: "Avoid: Germany missing Müller and Gnabry. Facing a motivated Portugal side on a 6-game win streak — line has moved 12 points against them in 48 hours.",
    },
  ],
  mlb: [
    {
      id: 'mlb-1',
      sport: 'MLB',
      homeTeam: 'Yankees',
      awayTeam: 'Red Sox',
      homeRecord: '52–31 · Home',
      awayRecord: '40–43 · Away',
      gameTime: '1:10 PM ET',
      pick: 'Yankees — ML',
      tier: 1,
      confidence: 77,
      analysis: "Yankees 8–2 in last 10 at Yankee Stadium. Gerrit Cole on the mound — 2.18 ERA vs Boston this season. Red Sox bullpen ranks 28th in ERA over last 14 days.",
      factors: [
        { label: 'Cole 2.18 ERA vs BOS', sentiment: 'positive' },
        { label: '8–2 at home L10', sentiment: 'positive' },
        { label: 'BOS bullpen struggling', sentiment: 'negative' },
      ],
    },
    {
      id: 'mlb-2',
      sport: 'MLB',
      homeTeam: 'Dodgers',
      awayTeam: 'Giants',
      homeRecord: '55–28 · Home',
      awayRecord: '38–45 · Away',
      gameTime: '4:05 PM ET',
      pick: 'Under 8 Runs',
      tier: 2,
      confidence: 68,
      analysis: "Ohtani vs Webb — two elite arms. Dodger Stadium plays as pitcher-friendly park in July. Last 6 Ohtani starts: 5 went under. Giants score 2.8 runs/game vs LHP.",
      factors: [
        { label: 'Ohtani 5/6 unders', sentiment: 'positive' },
        { label: "Pitcher's park", sentiment: 'positive' },
        { label: 'Giants weak vs LHP', sentiment: 'negative' },
      ],
    },
  ],
}

const OFF_SEASON: Record<string, { emoji: string; message: string }> = {
  nfl: { emoji: '🏈', message: 'NFL Preseason starts August — picks ready opening week.' },
  nba: { emoji: '🏀', message: 'NBA Offseason — back in October with opening night picks.' },
  nhl: { emoji: '🏒', message: 'NHL Offseason — season resumes in October.' },
}

const SPORT_TABS = [
  { key: 'wc', label: 'World Cup', live: true },
  { key: 'mlb', label: 'MLB' },
  { key: 'nfl', label: 'NFL' },
  { key: 'nba', label: 'NBA' },
  { key: 'nhl', label: 'NHL' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: Tier }) {
  const styles: Record<Tier, string> = {
    1: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
    2: 'bg-neon/10 text-neon border-neon/20',
    3: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }
  const labels: Record<Tier, string> = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' }
  return (
    <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${styles[tier]}`}>
      {labels[tier]}
    </span>
  )
}

function FactorChip({ factor }: { factor: Factor }) {
  const styles: Record<Sentiment, string> = {
    positive: 'text-emerald-400 bg-emerald-500/7 border-emerald-500/15',
    negative: 'text-red-400 bg-red-500/7 border-red-500/15',
    neutral: 'text-white/40 bg-white/4 border-white/10',
  }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${styles[factor.sentiment]}`}>
      {factor.label}
    </span>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="opacity-50">
      <rect x="2" y="7" width="10" height="8" rx="2" stroke="white" strokeWidth="1.4" />
      <path d="M4 7V5C4 3.3 5.3 2 7 2C8.7 2 10 3.3 10 5V7" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="7" cy="11" r="1.2" fill="white" />
    </svg>
  )
}

function ConfidenceBar({ value, tier }: { value: number; tier: Tier }) {
  const color = tier === 1 ? '#7CFC00' : tier === 2 ? '#7CFC00' : '#f59e0b'
  const barColor = value >= 75 ? '#7CFC00' : value >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] font-bold tracking-widest uppercase text-white/30">Confidence</span>
        <span className="text-[11px] font-black font-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="h-[3px] bg-white/8 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: barColor }} />
      </div>
    </div>
  )
}

function GameCard({ game, isMember, onUnlock }: { game: Game; isMember: boolean; onUnlock: () => void }) {
  return (
    <div
      className="bg-card border border-dim rounded-2xl overflow-hidden cursor-pointer active:scale-[0.985] transition-transform"
      onClick={!isMember ? onUnlock : undefined}
    >
      {/* Top row */}
      <div className="px-4 pt-3.5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border text-white/40 bg-white/5 border-white/10">
            {game.sport}
          </span>
          <span className="text-[11px] font-medium text-white/40 font-mono tabular-nums">{game.gameTime}</span>
        </div>
      </div>

      {/* Matchup */}
      <div className="px-4 pb-3.5 flex items-center gap-2.5">
        <div className="flex-1">
          <div className="text-[15px] font-black tracking-tight text-white leading-tight">{game.homeTeam}</div>
          <div className="text-[11px] text-white/40 font-medium mt-0.5">{game.homeRecord}</div>
        </div>
        <span className="text-[11px] font-bold text-white/20 shrink-0">VS</span>
        <div className="flex-1 text-right">
          <div className="text-[15px] font-black tracking-tight text-white leading-tight">{game.awayTeam}</div>
          <div className="text-[11px] text-white/40 font-medium mt-0.5">{game.awayRecord}</div>
        </div>
      </div>

      {/* Locked state */}
      {!isMember && (
        <div className="mx-4 mb-3.5 rounded-xl overflow-hidden relative bg-[#0c0c0c] border border-white/8 px-4 py-3.5 flex items-center justify-between"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.012) 3px,rgba(255,255,255,0.012) 4px)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/4 border border-white/10 flex items-center justify-center shrink-0">
              <LockIcon />
            </div>
            <div>
              <div className="text-[12px] font-bold text-white/35 tracking-widest uppercase">Members Only</div>
              <div className="text-[10px] text-white/20 font-medium mt-0.5">Pick + full analysis</div>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onUnlock() }}
            className="text-[11px] font-black text-neon bg-neon/10 border border-neon/20 px-3 py-1.5 rounded-lg shrink-0 hover:bg-neon/18 transition-colors"
          >
            Unlock
          </button>
        </div>
      )}

      {/* Unlocked — pick */}
      {isMember && game.pick && game.tier !== undefined && game.confidence !== undefined && (
        <>
          <div className="mx-4 mb-2.5 rounded-xl bg-neon/8 border border-neon/18 p-3 pb-3.5">
            <div className="text-[9px] font-black tracking-widest uppercase text-neon/60 mb-1">Our Pick</div>
            <div className="text-[16px] font-black tracking-tight text-white">
              {game.pick.split('—')[0] && <span className="text-neon">{game.pick.split('—')[0].trim()}</span>}
              {game.pick.includes('—') && <span className="text-white"> — {game.pick.split('—')[1]?.trim()}</span>}
            </div>
            <div className="flex items-center gap-2.5 mt-2.5">
              <TierBadge tier={game.tier} />
              <ConfidenceBar value={game.confidence} tier={game.tier} />
            </div>
          </div>

          {game.analysis && (
            <div className="mx-4 mb-3.5 rounded-xl bg-white/2 border border-white/8 p-3">
              <div className="text-[9px] font-black tracking-widest uppercase text-white/20 mb-1.5">Analysis</div>
              <p className="text-[12px] leading-relaxed text-white/55">{game.analysis}</p>
              {game.factors && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {game.factors.map(f => <FactorChip key={f.label} factor={f} />)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function WarningCard({ game, isMember }: { game: Game; isMember: boolean }) {
  return (
    <div className="mx-3.5 mb-2.5 bg-orange-500/5 border border-orange-500/22 rounded-2xl p-4 flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0 text-[13px]">⚠️</div>
      <div>
        <div className="text-[9px] font-black tracking-widest uppercase text-orange-400 mb-0.5">Avoid · Tomorrow</div>
        <div className="text-[13px] font-black text-white mb-1">{game.homeTeam} vs {game.awayTeam}</div>
        <div className="text-[11px] text-orange-400/65 leading-relaxed font-medium">
          {isMember
            ? game.warningText
            : 'Members only — unlock to see why we\'re flagging this game.'}
        </div>
      </div>
    </div>
  )
}

function SubscribeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/85"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-t-3xl px-6 pt-6 pb-10 animate-slideUp">
        <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mb-5" />
        <h2 className="text-[22px] font-black tracking-tight text-white mb-1.5">Unlock Every Pick</h2>
        <p className="text-[13px] text-white/50 leading-relaxed mb-5">
          Get the full pick, AI analysis, injury report, and team form for every game — every day.
        </p>
        <div className="bg-neon/8 border border-neon/20 rounded-xl p-4 flex items-center justify-between mb-4">
          <div>
            <div className="text-[15px] font-black text-white">Premium</div>
            <div className="text-[11px] text-white/40 mt-0.5">All sports · All picks · Cancel anytime</div>
          </div>
          <div className="text-[20px] font-black text-neon font-mono">
            $9.99<span className="text-[12px] font-medium text-white/40">/mo</span>
          </div>
        </div>
        <a
          href="/subscribe?plan=premium"
          className="block w-full py-4 text-center rounded-xl bg-neon text-black font-black text-[15px] hover:opacity-90 transition-opacity"
        >
          Get Full Access
        </a>
        <button
          onClick={onClose}
          className="block w-full py-3 text-center text-[13px] font-semibold text-white/40 hover:text-white transition-colors mt-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('wc')
  const [isMember, setIsMember] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const { data } = await supabase
          .from('subscriptions')
          .select('status, plan')
          .eq('email', user.email)
          .eq('status', 'active')
          .maybeSingle()
        setIsMember(!!data)
      }
      setLoading(false)
    }
    check()
  }, [])

  const games = GAMES[activeTab] ?? []
  const warningGame = games.find(g => g.isWarning)
  const regularGames = games.filter(g => !g.isWarning)
  const offSeason = OFF_SEASON[activeTab]

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto">

        {/* Sport tabs */}
        <div className="overflow-x-auto scrollbar-hide border-b border-dim">
          <div className="flex px-4 pt-3.5" style={{ width: 'max-content' }}>
            {SPORT_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 pb-3 text-[13px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key
                    ? 'text-white border-neon'
                    : 'text-white/40 border-transparent hover:text-white/65'
                }`}
              >
                {tab.live && <span className="w-1.5 h-1.5 rounded-full bg-neon shrink-0" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Off-season placeholder */}
        {offSeason && (
          <div className="py-14 text-center text-white/40">
            <div className="text-3xl mb-3">{offSeason.emoji}</div>
            <p className="text-[13px] leading-relaxed px-8">{offSeason.message}</p>
          </div>
        )}

        {/* Game list */}
        {!offSeason && (
          <>
            <div className="flex items-baseline justify-between px-5 pt-4 pb-3">
              <span className="text-[11px] font-bold tracking-widest uppercase text-white/40">{today}</span>
              <span className="text-[11px] text-white/30">{regularGames.length} games today</span>
            </div>

            <div className="flex flex-col gap-2.5 px-3.5 pb-6">
              {/* Warning card at top */}
              {warningGame && <WarningCard game={warningGame} isMember={isMember} />}

              {/* Game cards */}
              {regularGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  isMember={loading ? false : isMember}
                  onUnlock={() => setShowModal(true)}
                />
              ))}
            </div>
          </>
        )}

        {/* Member status badge (bottom of page, small) */}
        {!loading && (
          <div className="text-center pb-8">
            {isMember ? (
              <span className="text-[10px] font-bold tracking-widest uppercase text-neon/60">Member Access Active</span>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="text-[11px] font-bold text-neon/70 hover:text-neon transition-colors"
              >
                Unlock all picks — $9.99/mo →
              </button>
            )}
          </div>
        )}
      </main>

      {showModal && <SubscribeModal onClose={() => setShowModal(false)} />}

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.22s ease; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; }
      `}</style>
    </>
  )
}
