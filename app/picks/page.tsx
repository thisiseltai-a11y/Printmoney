'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Copy, Check, AlertTriangle, Filter } from 'lucide-react'
import { MOCK_PICKS, MOCK_WARNING } from '@/lib/mockData'
import type { Pick, Sport, Tier } from '@/lib/types'

const SPORTS: { label: string; value: Sport | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: '🏈 NFL', value: 'NFL' },
  { label: '⚾ MLB', value: 'MLB' },
  { label: '⚽ Soccer', value: 'Soccer' },
  { label: '🏀 NBA', value: 'NBA' },
]

function TierBadge({ tier }: { tier: Tier }) {
  const s: Record<Tier, string> = {
    1: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    2: 'bg-neon/10 text-neon border-neon/30',
    3: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  }
  const l: Record<Tier, string> = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' }
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${s[tier]}`}>{l[tier]}</span>
}

function CopyBtn({ pick }: { pick: Pick }) {
  const [copied, setCopied] = useState(false)
  const text = `🎯 HeyParlay Pick — ${pick.sport}\n\n${pick.awayTeam} @ ${pick.homeTeam}\n✅ ${pick.line} (${pick.odds})\nTier ${pick.tier} · ${pick.confidence}% AI Confidence\n\n📊 Research: ${pick.research.slice(0, 150)}...\n\n#HeyParlay #${pick.sport}`
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <button onClick={copy} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${copied ? 'bg-neon/15 text-neon border-neon/30' : 'bg-elevated text-white/50 border-dim hover:text-white hover:border-dim/80'}`}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function PickCard({ pick }: { pick: Pick }) {
  const confColor = pick.confidence >= 75 ? '#7CFC00' : pick.confidence >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="bg-card border border-dim rounded-2xl p-6 card-hover">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs font-mono text-white/30 uppercase tracking-widest">{pick.sport}</span>
            <TierBadge tier={pick.tier} />
            {pick.isWarning && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                <AlertTriangle className="w-3 h-3" /> Warning
              </span>
            )}
          </div>
          <h3 className="text-lg font-black tracking-tight">{pick.awayTeam} <span className="text-white/30 font-normal">@</span> {pick.homeTeam}</h3>
        </div>
        <CopyBtn pick={pick} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-elevated border border-dim rounded-xl p-3 text-center">
          <p className="text-xs text-white/30 mb-1">Line</p>
          <p className="font-bold text-sm">{pick.line}</p>
        </div>
        <div className="bg-elevated border border-dim rounded-xl p-3 text-center">
          <p className="text-xs text-white/30 mb-1">Odds</p>
          <p className="font-mono font-bold text-sm text-neon">{pick.odds}</p>
        </div>
        <div className="bg-elevated border border-dim rounded-xl p-3 text-center">
          <p className="text-xs text-white/30 mb-1">Confidence</p>
          <p className="font-mono font-bold text-sm" style={{ color: confColor }}>{pick.confidence}%</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-5">
        <div className="h-2 bg-dim rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pick.confidence}%`, backgroundColor: confColor }} />
        </div>
      </div>

      {/* Research */}
      <div className="bg-elevated border border-dim rounded-xl p-4">
        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">AI Research Summary</p>
        <p className="text-sm text-white/60 leading-relaxed">{pick.research}</p>
      </div>

      {/* Warning */}
      {pick.warning && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-orange-500/5 border border-orange-500/25">
          <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-orange-300 leading-relaxed">{pick.warning}</p>
        </div>
      )}
    </div>
  )
}

export default function PicksPage() {
  const [sport, setSport] = useState<Sport | 'All'>('All')
  const [tierFilter, setTierFilter] = useState<Tier | 0>(0)

  const allPicks = [MOCK_WARNING, ...MOCK_PICKS]
  const filtered = allPicks.filter(p =>
    (sport === 'All' || p.sport === sport) &&
    (tierFilter === 0 || p.tier === tierFilter)
  )

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-1">Today&apos;s Picks</h1>
          <p className="text-white/40 text-sm">AI-generated picks updated every morning · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-1.5 p-1 bg-card border border-dim rounded-xl">
            {SPORTS.map(s => (
              <button
                key={s.value}
                onClick={() => setSport(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sport === s.value ? 'bg-neon text-black' : 'text-white/50 hover:text-white'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-card border border-dim rounded-xl">
            <Filter className="w-3.5 h-3.5 text-white/30 ml-2" />
            {([0, 1, 2, 3] as const).map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tierFilter === t ? 'bg-neon text-black' : 'text-white/50 hover:text-white'}`}
              >
                {t === 0 ? 'All Tiers' : `Tier ${t}`}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-white/30 mb-4 font-mono">{filtered.length} picks found</p>

        {/* Pick cards */}
        <div className="space-y-4">
          {filtered.length > 0
            ? filtered.map(pick => <PickCard key={pick.id} pick={pick} />)
            : <div className="text-center py-20 text-white/30">No picks match your filters.</div>
          }
        </div>

        {/* Upgrade prompt */}
        <div className="mt-10 bg-neon/5 border border-neon/20 rounded-2xl p-8 text-center">
          <p className="text-xs font-bold text-neon tracking-widest uppercase mb-3">Premium</p>
          <h3 className="text-xl font-black mb-2">Get Props, Live Updates & More</h3>
          <p className="text-sm text-white/50 mb-5 max-w-md mx-auto">Upgrade to Premium or VIP to unlock player props, live line movement alerts, and direct Telegram picks.</p>
          <a href="/subscribe?plan=premium" className="inline-block px-6 py-3 rounded-xl bg-neon text-black font-bold text-sm hover:bg-neon/90 transition-all hover:shadow-neon">
            Upgrade to Premium — $9.99/mo
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}
