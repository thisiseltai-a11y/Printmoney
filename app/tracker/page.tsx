'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Plus, Trash2, TrendingUp, TrendingDown, Target, DollarSign, X } from 'lucide-react'
import { MOCK_BETS } from '@/lib/mockData'
import type { Bet, Sport, Tier, BetResult } from '@/lib/types'

const SPORTS: Sport[] = ['NFL', 'MLB', 'NBA', 'Soccer', 'NHL', 'World Cup']

function calcStats(bets: Bet[]) {
  const settled = bets.filter(b => b.result !== 'pending')
  const wins = settled.filter(b => b.result === 'win')
  const totalWagered = settled.reduce((s, b) => s + b.amount, 0)
  const totalPayout = settled.reduce((s, b) => s + (b.payout ?? 0), 0)
  const profit = totalPayout - totalWagered
  const roi = totalWagered > 0 ? ((profit / totalWagered) * 100) : 0
  const winRate = settled.length > 0 ? (wins.length / settled.length) * 100 : 0
  return { wins: wins.length, losses: settled.length - wins.length, settled: settled.length, totalWagered, totalPayout, profit, roi, winRate }
}

function PLChart({ bets }: { bets: Bet[] }) {
  const sorted = [...bets].filter(b => b.result !== 'pending').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  let running = 0
  const points = sorted.map(b => {
    const p = (b.payout ?? 0) - b.amount
    running += p
    return running
  })

  if (points.length < 2) return (
    <div className="h-40 flex items-center justify-center text-white/20 text-sm">Not enough data yet</div>
  )

  const min = Math.min(0, ...points)
  const max = Math.max(0, ...points)
  const range = max - min || 1
  const w = 100 / (points.length - 1)

  const svgPoints = points.map((p, i) => `${i * w},${100 - ((p - min) / range) * 100}`).join(' ')
  const zeroY = 100 - ((0 - min) / range) * 100
  const finalProfit = points[points.length - 1]

  return (
    <div className="relative h-40">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={finalProfit >= 0 ? '#7CFC00' : '#ef4444'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={finalProfit >= 0 ? '#7CFC00' : '#ef4444'} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Zero line */}
        <line x1="0" y1={zeroY} x2="100" y2={zeroY} stroke="#333" strokeWidth="0.5" />
        {/* Area fill */}
        <polygon
          points={`0,${zeroY} ${svgPoints} ${(points.length - 1) * w},${zeroY}`}
          fill="url(#profitGrad)"
        />
        {/* Line */}
        <polyline
          points={svgPoints}
          fill="none"
          stroke={finalProfit >= 0 ? '#7CFC00' : '#ef4444'}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute top-0 right-0 text-xs font-mono font-bold" style={{ color: finalProfit >= 0 ? '#7CFC00' : '#ef4444' }}>
        {finalProfit >= 0 ? '+' : ''}${finalProfit.toFixed(0)}
      </div>
    </div>
  )
}

const RESULT_STYLES: Record<BetResult, string> = {
  win: 'bg-neon/15 text-neon border-neon/30',
  loss: 'bg-red-500/15 text-red-400 border-red-500/30',
  pending: 'bg-white/5 text-white/40 border-white/10',
  push: 'bg-white/10 text-white/60 border-white/20',
}

export default function TrackerPage() {
  const [bets, setBets] = useState<Bet[]>(MOCK_BETS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ sport: 'NFL' as Sport, description: '', amount: '', odds: '', tier: '1' as unknown as Tier, result: 'pending' as BetResult })

  useEffect(() => {
    const saved = localStorage.getItem('heyparlay_bets')
    if (saved) setBets(JSON.parse(saved))
  }, [])

  const save = (updated: Bet[]) => {
    setBets(updated)
    localStorage.setItem('heyparlay_bets', JSON.stringify(updated))
  }

  const addBet = () => {
    if (!form.description || !form.amount) return
    const amount = parseFloat(form.amount)
    const odds = form.odds
    let payout = 0
    if (form.result === 'win') {
      const o = parseInt(odds.replace('+', ''))
      payout = o > 0 ? amount * (o / 100) + amount : amount * (100 / Math.abs(o)) + amount
    }
    const bet: Bet = {
      id: crypto.randomUUID(),
      sport: form.sport,
      description: form.description,
      amount,
      odds,
      tier: form.tier,
      result: form.result,
      payout: form.result === 'win' ? payout : 0,
      createdAt: new Date().toISOString(),
    }
    save([...bets, bet])
    setForm({ sport: 'NFL', description: '', amount: '', odds: '', tier: 1 as Tier, result: 'pending' })
    setShowForm(false)
  }

  const updateResult = (id: string, result: BetResult) => {
    const updated = bets.map(b => {
      if (b.id !== id) return b
      const o = parseInt(b.odds.replace('+', ''))
      const payout = result === 'win' ? (o > 0 ? b.amount * (o / 100) + b.amount : b.amount * (100 / Math.abs(o)) + b.amount) : 0
      return { ...b, result, payout: result === 'win' ? payout : 0 }
    })
    save(updated)
  }

  const deleteBet = (id: string) => save(bets.filter(b => b.id !== id))

  const stats = calcStats(bets)

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">Bet Tracker</h1>
            <p className="text-white/40 text-sm">Track every bet. Know your edge.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon text-black font-bold text-sm hover:bg-neon/90 transition-all hover:shadow-neon"
          >
            <Plus className="w-4 h-4" />
            Log Bet
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Win Rate', value: `${stats.winRate.toFixed(0)}%`, icon: <Target className="w-4 h-4" />, color: 'text-neon' },
            { label: 'Record', value: `${stats.wins}–${stats.losses}`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-white' },
            { label: 'Total P&L', value: `${stats.profit >= 0 ? '+' : ''}$${stats.profit.toFixed(0)}`, icon: <DollarSign className="w-4 h-4" />, color: stats.profit >= 0 ? 'text-neon' : 'text-red-400' },
            { label: 'ROI', value: `${stats.roi.toFixed(1)}%`, icon: stats.roi >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />, color: stats.roi >= 0 ? 'text-neon' : 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-dim rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-white/30 text-xs mb-2">
                {s.icon} {s.label}
              </div>
              <p className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* P&L Chart */}
        <div className="bg-card border border-dim rounded-2xl p-5 mb-8">
          <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neon" />
            Weekly P&amp;L
          </h2>
          <PLChart bets={bets} />
        </div>

        {/* Add bet form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card border border-dim rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg">Log a Bet</h3>
                <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Sport</label>
                    <select value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value as Sport }))} className="w-full bg-elevated border border-dim rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50">
                      {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Tier</label>
                    <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: parseInt(e.target.value) as Tier }))} className="w-full bg-elevated border border-dim rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50">
                      <option value={1}>Tier 1 — Safe</option>
                      <option value={2}>Tier 2 — Balanced</option>
                      <option value={3}>Tier 3 — High Risk</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Description</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Chiefs -7.5, Dodgers ML, 3-leg parlay..." className="w-full bg-elevated border border-dim rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-neon/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Wager ($)</label>
                    <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="100" className="w-full bg-elevated border border-dim rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-neon/50" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Odds</label>
                    <input value={form.odds} onChange={e => setForm(f => ({ ...f, odds: e.target.value }))} placeholder="-110 or +250" className="w-full bg-elevated border border-dim rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-neon/50" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Result</label>
                  <div className="flex gap-2">
                    {(['pending', 'win', 'loss', 'push'] as BetResult[]).map(r => (
                      <button key={r} onClick={() => setForm(f => ({ ...f, result: r }))} className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${form.result === r ? RESULT_STYLES[r] : 'border-dim text-white/30 hover:text-white'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={addBet} className="w-full py-3 rounded-xl bg-neon text-black font-bold text-sm hover:bg-neon/90 transition-all">
                  Save Bet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bet history */}
        <div className="bg-card border border-dim rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dim">
            <h2 className="font-bold">Bet History</h2>
          </div>
          <div className="divide-y divide-dim">
            {[...bets].reverse().map(bet => (
              <div key={bet.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-mono text-white/30">{bet.sport}</span>
                    <span className="text-xs text-white/20">·</span>
                    <span className="text-xs font-mono text-white/30">Tier {bet.tier}</span>
                  </div>
                  <p className="text-sm font-semibold truncate">{bet.description}</p>
                  <p className="text-xs text-white/30 mt-0.5 font-mono">{new Date(bet.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-white/30 mb-0.5">Wager</p>
                  <p className="font-mono text-sm">${bet.amount}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-white/30 mb-0.5">{bet.result === 'win' ? 'Payout' : 'P&L'}</p>
                  <p className={`font-mono text-sm font-bold ${bet.result === 'win' ? 'text-neon' : bet.result === 'loss' ? 'text-red-400' : 'text-white/40'}`}>
                    {bet.result === 'win' ? `+$${((bet.payout ?? 0) - bet.amount).toFixed(0)}` : bet.result === 'loss' ? `-$${bet.amount}` : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={bet.result}
                    onChange={e => updateResult(bet.id, e.target.value as BetResult)}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border bg-transparent focus:outline-none ${RESULT_STYLES[bet.result]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="win">Win</option>
                    <option value="loss">Loss</option>
                    <option value="push">Push</option>
                  </select>
                  <button onClick={() => deleteBet(bet.id)} className="text-white/20 hover:text-red-400 transition-colors p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {bets.length === 0 && (
              <div className="py-16 text-center text-white/20 text-sm">No bets logged yet. Hit &quot;Log Bet&quot; to start tracking.</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
