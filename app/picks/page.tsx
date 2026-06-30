'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Copy, Check, AlertTriangle, Flame } from 'lucide-react'
import { MOCK_PICKS, MOCK_WARNING } from '@/lib/mockData'
import type { Pick, Sport, Tier } from '@/lib/types'

const SECTIONS: { sport: Sport | string; label: string; emoji: string; trending?: boolean }[] = [
  { sport: 'World Cup', label: 'World Cup', emoji: '🏆', trending: true },
  { sport: 'NFL', label: 'NFL', emoji: '🏈' },
  { sport: 'MLB', label: 'MLB', emoji: '⚾' },
  { sport: 'NBA', label: 'NBA', emoji: '🏀' },
  { sport: 'Soccer', label: 'Soccer', emoji: '⚽' },
  { sport: 'NHL', label: 'NHL', emoji: '🏒' },
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
  const text = `🎯 HeyParlay Pick — ${pick.sport}\n\n${pick.awayTeam} @ ${pick.homeTeam}\n✅ ${pick.line} (${pick.odds})\nTier ${pick.tier} · ${pick.confidence}% AI Confidence\n\n📊 ${pick.research.slice(0, 150)}...\n\n#HeyParlay #${pick.sport.replace(' ', '')}`
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
    <div className="bg-card border border-dim rounded-2xl p-5 card-hover">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <TierBadge tier={pick.tier} />
          </div>
          <h3 className="text-base font-black tracking-tight">{pick.awayTeam} <span className="text-white/30 font-normal">@</span> {pick.homeTeam}</h3>
        </div>
        <CopyBtn pick={pick} />
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
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

      <div className="h-1.5 bg-dim rounded-full overflow-hidden mb-4">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pick.confidence}%`, backgroundColor: confColor }} />
      </div>

      <div className="bg-elevated border border-dim rounded-xl p-3.5">
        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1.5">AI Research</p>
        <p className="text-sm text-white/60 leading-relaxed">{pick.research}</p>
      </div>

      {pick.warning && (
        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-orange-500/5 border border-orange-500/25">
          <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-orange-300 leading-relaxed">{pick.warning}</p>
        </div>
      )}
    </div>
  )
}

function SectionHeader({ section, count }: { section: typeof SECTIONS[0]; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-2xl">{section.emoji}</span>
      <div className="flex items-center gap-2.5 flex-1">
        <h2 className="text-xl font-black tracking-tight">{section.label}</h2>
        {section.trending && (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-black">
            <Flame className="w-3 h-3" /> Trending
          </span>
        )}
        <span className="ml-auto text-xs font-mono text-white/30">{count} {count === 1 ? 'pick' : 'picks'}</span>
      </div>
    </div>
  )
}

export default function PicksPage() {
  const [allPicks, setAllPicks] = useState<Pick[]>(MOCK_PICKS)
  const [warning, setWarning] = useState<Pick>(MOCK_WARNING)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    fetch('/api/generate-picks')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.picks) && data.picks.length > 0) {
          const warnPick = data.picks.find((p: Pick) => p.isWarning)
          const regular = data.picks.filter((p: Pick) => !p.isWarning)
          if (warnPick) setWarning(warnPick)
          if (regular.length) setAllPicks(regular)
          setIsLive(!!data.liveData)
        }
      })
      .catch(() => {})
  }, [])

  const picksBySport = allPicks.reduce<Record<string, Pick[]>>((acc, pick) => {
    const key = pick.sport
    if (!acc[key]) acc[key] = []
    acc[key].push(pick)
    return acc
  }, {})

  const activeSections = SECTIONS.filter(s => (picksBySport[s.sport]?.length ?? 0) > 0)

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">Today&apos;s Picks</h1>
            <p className="text-white/40 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · AI-generated every morning
            </p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold mt-1 shrink-0 ${isLive ? 'bg-neon/10 border-neon/20 text-neon' : 'bg-white/5 border-dim text-white/30'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-neon animate-pulse' : 'bg-white/30'}`} />
            {isLive ? 'Live Data' : 'Demo'}
          </div>
        </div>

        {/* Tomorrow's warning */}
        <div className="bg-orange-500/5 border border-orange-500/30 rounded-2xl p-5 mb-10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black text-orange-400 tracking-widest uppercase">⚠ Tomorrow — Avoid</span>
                <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-mono">1 Game Alert</span>
              </div>
              <h3 className="font-bold mb-1">{warning.awayTeam} @ {warning.homeTeam}</h3>
              <p className="text-sm text-orange-200/60 leading-relaxed">{warning.warning}</p>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-orange-500/15">
                <span className="text-xs text-white/30 font-mono">{warning.sport} · {warning.line} ({warning.odds})</span>
                <span className="text-xs text-white/30 font-mono">AI Confidence: {warning.confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sport sections */}
        <div className="space-y-12">
          {activeSections.map(section => {
            const sectionPicks = picksBySport[section.sport] ?? []
            return (
              <div key={section.sport}>
                <SectionHeader section={section} count={sectionPicks.length} />
                <div className="space-y-4">
                  {sectionPicks.map(pick => <PickCard key={pick.id} pick={pick} />)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Upgrade CTA */}
        <div className="mt-14 bg-neon/5 border border-neon/20 rounded-2xl p-8 text-center">
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
