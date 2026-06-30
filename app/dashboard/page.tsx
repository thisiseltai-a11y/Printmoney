'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { Copy, AlertTriangle, Check, TrendingUp, Zap, Bell } from 'lucide-react'
import { MOCK_PICKS, MOCK_WARNING } from '@/lib/mockData'
import type { Pick, Tier } from '@/lib/types'

function TierBadge({ tier }: { tier: Tier }) {
  const styles: Record<Tier, string> = {
    1: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    2: 'bg-neon/10 text-neon border-neon/30',
    3: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  }
  const labels: Record<Tier, string> = { 1: 'Tier 1 · Safe', 2: 'Tier 2 · Balanced', 3: 'Tier 3 · High Risk' }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[tier]}`}>
      {labels[tier]}
    </span>
  )
}

function ConfidenceMeter({ value }: { value: number }) {
  const color = value >= 75 ? '#7CFC00' : value >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/40">AI Confidence</span>
        <span className="font-mono font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-dim rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function CopyButton({ pick }: { pick: Pick }) {
  const [copied, setCopied] = useState(false)
  const text = `🎯 HeyParlay Pick\n\n📊 ${pick.sport} — ${pick.homeTeam} vs ${pick.awayTeam}\n✅ ${pick.line} (${pick.odds})\n🔥 Tier ${pick.tier} · ${pick.confidence}% Confidence\n\n📝 ${pick.research.slice(0, 120)}...\n\n#HeyParlay #${pick.sport} #SportsPicks`
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        copied ? 'bg-neon/20 text-neon border border-neon/30' : 'bg-dim text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy Post'}
    </button>
  )
}

function PickCard({ pick }: { pick: Pick }) {
  return (
    <div className="bg-card border border-dim rounded-2xl p-5 card-hover">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-white/30 font-mono uppercase tracking-widest">{pick.sport}</span>
            <TierBadge tier={pick.tier} />
          </div>
          <h3 className="font-bold text-base leading-tight">
            {pick.awayTeam} <span className="text-white/30">@</span> {pick.homeTeam}
          </h3>
        </div>
        <CopyButton pick={pick} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="bg-elevated border border-dim rounded-xl px-4 py-2 flex-1">
          <p className="text-xs text-white/30 mb-0.5">Line</p>
          <p className="font-bold text-sm">{pick.line}</p>
        </div>
        <div className="bg-elevated border border-dim rounded-xl px-4 py-2 flex-1">
          <p className="text-xs text-white/30 mb-0.5">Odds</p>
          <p className="font-mono font-bold text-sm text-neon">{pick.odds}</p>
        </div>
      </div>

      <ConfidenceMeter value={pick.confidence} />

      <p className="text-xs text-white/45 leading-relaxed mt-4 line-clamp-3">{pick.research}</p>
    </div>
  )
}

function ParlayBuilder({ picks }: { picks: Pick[] }) {
  const [legs, setLegs] = useState<Pick[]>([])
  const [copied, setCopied] = useState(false)

  const toggle = (pick: Pick) => {
    setLegs(l => l.find(p => p.id === pick.id) ? l.filter(p => p.id !== pick.id) : [...l, pick])
  }

  const calcOdds = () => {
    if (!legs.length) return '+000'
    let mult = 1
    legs.forEach(leg => {
      const o = parseInt(leg.odds.replace('+', ''))
      mult *= o > 0 ? (o / 100) + 1 : (100 / Math.abs(o)) + 1
    })
    const combined = Math.round((mult - 1) * 100)
    return `+${combined}`
  }

  const copyParlay = () => {
    const text = `🔥 HeyParlay ${legs.length}-Leg Parlay\n\n` +
      legs.map(l => `✅ ${l.line} (${l.odds}) — ${l.confidence}% conf`).join('\n') +
      `\n\nCombined Odds: ${calcOdds()}\n\n#HeyParlay #Parlay`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-card border border-neon/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-neon" />
        <h3 className="font-bold text-sm">Parlay Builder</h3>
        <span className="ml-auto text-xs text-white/30 font-mono">{legs.length} legs selected</span>
      </div>

      <div className="space-y-2 mb-4">
        {picks.slice(0, 4).map(pick => (
          <button
            key={pick.id}
            onClick={() => toggle(pick)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              legs.find(l => l.id === pick.id)
                ? 'border-neon/40 bg-neon/5'
                : 'border-dim bg-elevated hover:border-dim/60'
            }`}
          >
            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
              legs.find(l => l.id === pick.id) ? 'border-neon bg-neon' : 'border-dim'
            }`}>
              {legs.find(l => l.id === pick.id) && <Check className="w-3 h-3 text-black" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{pick.line}</p>
              <p className="text-xs text-white/30">{pick.sport} · Tier {pick.tier}</p>
            </div>
            <span className="text-xs font-mono text-neon font-bold">{pick.odds}</span>
          </button>
        ))}
      </div>

      {legs.length >= 2 && (
        <div className="border-t border-dim pt-4 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-white/40">Combined Odds</span>
            <span className="font-mono font-black text-neon text-xl">{calcOdds()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/40">$100 to win</span>
            <span className="font-mono text-sm text-white">
              ${Math.round(parseInt(calcOdds().replace('+', '')) + 100)}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={copyParlay}
        disabled={legs.length < 2}
        className="w-full py-3 rounded-xl bg-neon text-black font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neon/90 transition-all flex items-center justify-center gap-2"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : legs.length < 2 ? 'Select 2+ legs to build' : `Copy ${legs.length}-Leg Parlay`}
      </button>
    </div>
  )
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
            <p className="text-sm text-white/40 mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/20 text-neon text-xs font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
            Live Picks Active
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Today's Picks", value: '6', sub: '3 sports' },
            { label: 'Win Rate (L30)', value: '72%', sub: '↑ 4% this week' },
            { label: 'Tier 1 Record', value: '18-7', sub: '72% hit rate' },
            { label: 'Avg Parlay Odds', value: '+380', sub: '3-leg average' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-dim rounded-2xl p-4">
              <p className="text-xs text-white/30 mb-1">{s.label}</p>
              <p className="text-2xl font-black font-mono text-neon">{s.value}</p>
              <p className="text-xs text-white/30 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tomorrow's warning */}
        <div className="bg-orange-500/5 border border-orange-500/30 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black text-orange-400 tracking-widest uppercase">⚠ Tomorrow — 1 Game Alert</span>
                <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-mono">AVOID</span>
              </div>
              <h3 className="font-bold mb-1.5">
                {MOCK_WARNING.awayTeam} @ {MOCK_WARNING.homeTeam}
              </h3>
              <p className="text-sm text-orange-200/60 leading-relaxed">{MOCK_WARNING.warning}</p>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-orange-500/15">
                <span className="text-xs text-white/30 font-mono">{MOCK_WARNING.sport} · {MOCK_WARNING.line} ({MOCK_WARNING.odds})</span>
                <span className="text-xs text-white/30 font-mono">AI Confidence: {MOCK_WARNING.confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-lg">Today&apos;s Picks</h2>
              <a href="/picks" className="text-xs text-neon hover:underline">See all picks →</a>
            </div>
            {MOCK_PICKS.map(pick => <PickCard key={pick.id} pick={pick} />)}
          </div>

          <div className="space-y-5">
            <ParlayBuilder picks={MOCK_PICKS} />

            {/* Lineup alert */}
            <div className="bg-card border border-dim rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-neon" />
                <h3 className="font-bold text-sm">Lineup Alerts</h3>
              </div>
              <div className="space-y-3">
                {[
                  { team: 'Dodgers', note: 'Ohtani confirmed starting', time: '1h before', status: 'green' },
                  { team: 'Chiefs', note: 'Kelce listed as questionable', time: '2h before', status: 'orange' },
                  { team: 'Real Madrid', note: 'Bellingham full training', time: '3h before', status: 'green' },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-elevated border border-dim">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.status === 'green' ? 'bg-neon' : 'bg-orange-400'}`} />
                    <div>
                      <p className="text-xs font-bold">{a.team}</p>
                      <p className="text-xs text-white/40">{a.note}</p>
                    </div>
                    <span className="ml-auto text-xs text-white/20 font-mono whitespace-nowrap">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
