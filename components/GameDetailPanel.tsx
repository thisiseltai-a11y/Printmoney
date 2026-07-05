'use client'
import { useEffect, useState } from 'react'
import { X, Lock } from 'lucide-react'
import type { GameDetail } from '@/app/api/game-detail/route'
import type { GamePick } from '@/app/api/today-games/route'

type Sentiment = 'positive' | 'negative' | 'neutral'
type Tier = 1 | 2 | 3

function TierBadge({ tier }: { tier: Tier }) {
  const s: Record<Tier, string> = {
    1: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
    2: 'bg-neon/10 text-neon border-neon/20',
    3: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }
  return (
    <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${s[tier]}`}>
      Tier {tier}
    </span>
  )
}

function FactorPill({ label, sentiment }: { label: string; sentiment: Sentiment }) {
  const s: Record<Sentiment, string> = {
    positive: 'text-emerald-400 bg-emerald-500/7 border-emerald-500/15',
    negative: 'text-red-400 bg-red-500/7 border-red-500/15',
    neutral: 'text-white/40 bg-white/4 border-white/10',
  }
  return <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${s[sentiment]}`}>{label}</span>
}

function FormDot({ result }: { result: 'W' | 'L' | 'D' }) {
  const s = result === 'W' ? 'bg-neon text-black' : result === 'D' ? 'bg-white/20 text-white' : 'bg-red-500/80 text-white'
  return (
    <span className={`w-6 h-6 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 ${s}`}>
      {result}
    </span>
  )
}

function StatRow({ label, home, away, homeTeam, awayTeam }: {
  label: string; home: string; away: string; homeTeam: string; awayTeam: string
}) {
  const homeNum = parseFloat(home)
  const awayNum = parseFloat(away)
  const homeWins = !isNaN(homeNum) && !isNaN(awayNum) && homeNum > awayNum
  const awayWins = !isNaN(homeNum) && !isNaN(awayNum) && awayNum > homeNum

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className={`text-[13px] font-black tabular-nums w-12 text-right ${homeWins ? 'text-neon' : 'text-white/60'}`}>{home}</span>
      <span className="flex-1 text-center text-[11px] text-white/35 font-medium capitalize">{label}</span>
      <span className={`text-[13px] font-black tabular-nums w-12 ${awayWins ? 'text-neon' : 'text-white/60'}`}>{away}</span>
    </div>
  )
}

function FireBadge() {
  return (
    <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded"
      style={{ background: 'rgba(249,115,22,0.18)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.30)' }}>
      🔥 Hot
    </span>
  )
}

function FormBar({ label, record, streak }: { label: string; record?: string; streak?: string }) {
  if (!record && !streak) return null
  const [w, l] = (record ?? '').split('-').map(Number)
  const total = (w || 0) + (l || 0)
  const winPct = total > 0 ? (w || 0) / total : 0
  const streakNum = parseInt(streak?.replace(/[WLD]/i, '') ?? '0')
  const streakType = streak?.charAt(0)?.toUpperCase()
  const isWin = streakType === 'W'
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold text-white/30 w-16 shrink-0">{label}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-black text-white/70 tabular-nums font-mono">{record ?? '—'}</span>
          {streak && (
            <span className={`text-[10px] font-black tabular-nums ${isWin ? 'text-neon' : 'text-red-400'}`}>
              {isWin ? '▲' : '▼'} {streakType}{streakNum}
            </span>
          )}
        </div>
        <div className="h-[3px] bg-white/8 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${winPct * 100}%`, background: winPct >= 0.6 ? '#7CFC00' : winPct >= 0.4 ? '#f59e0b' : '#ef4444' }} />
        </div>
      </div>
    </div>
  )
}

function LockedSection({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="rounded-2xl p-5 text-center"
      style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.08)',
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.010) 3px,rgba(255,255,255,0.010) 4px)' }}>
      <div className="w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
        <Lock className="w-4 h-4 text-white/30" />
      </div>
      <p className="text-[13px] font-bold text-white/40 mb-3">Members only</p>
      <p className="text-[11px] text-white/25 mb-4 leading-relaxed">
        Unlock picks, AI analysis, betting angle, and live game breakdowns.
      </p>
      <button onClick={onUnlock}
        className="w-full py-3 rounded-xl text-[13px] font-black text-black bg-neon hover:opacity-90 transition-opacity">
        Unlock for $9.99/mo
      </button>
    </div>
  )
}

interface Props {
  game: GamePick
  isMember: boolean
  onClose: () => void
  onUnlock: () => void
}

export default function GameDetailPanel({ game, isMember, onClose, onUnlock }: Props) {
  const [detail, setDetail] = useState<GameDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch(`/api/game-detail?id=${game.id}&sport=${game.sportKey}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setDetail(data)
      } catch {
        setError(true)
      }
      setLoading(false)
    }
    load()
  }, [game.id, game.sportKey])

  const s = detail?.summary
  const hasScore = s?.isLive && s.homeScore !== undefined
  const homeSide = { name: s?.homeTeam ?? game.homeTeam, record: s?.homeRecord ?? game.homeRecord, score: s?.homeScore }
  const awaySide = { name: s?.awayTeam ?? game.awayTeam, record: s?.awayRecord ?? game.awayRecord, score: s?.awayScore }
  // Prefer Claude's pick; fall back to ESPN streak data
  const hotTeam = detail?.hotTeam ?? (() => {
    const homeWin = s?.homeStreak?.toUpperCase().startsWith('W')
    const awayWin = s?.awayStreak?.toUpperCase().startsWith('W')
    const homeLen = parseInt(s?.homeStreak?.replace(/\D/g, '') ?? '0')
    const awayLen = parseInt(s?.awayStreak?.replace(/\D/g, '') ?? '0')
    if (homeWin && (!awayWin || homeLen >= awayLen)) return s?.homeTeam ?? null
    if (awayWin && (!homeWin || awayLen > homeLen)) return s?.awayTeam ?? null
    return null
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg rounded-t-3xl overflow-hidden flex flex-col animate-slideUp"
        style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.09)', maxHeight: '92vh' }}>

        {/* Handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4 shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {game.sport}
              </span>
              {game.isLive ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  {s?.gameClock ?? game.gameClock ?? 'LIVE'}
                </span>
              ) : (
                <span className="text-[11px] text-white/35 font-mono">{game.gameTime}</span>
              )}
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1 -mr-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scoreboard */}
          <div className="space-y-1.5">
            {[awaySide, homeSide].map((team, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider shrink-0 w-7"
                    style={{ color: 'rgba(255,255,255,0.22)' }}>{i === 0 ? 'AWY' : 'HME'}</span>
                  <span className="text-[15px] font-black text-white truncate">{team.name}</span>
                  {hotTeam && team.name === hotTeam && <span className="text-[12px] shrink-0">🔥</span>}
                </div>
                {hasScore
                  ? <span className={`text-[26px] font-black font-mono tabular-nums leading-none ml-3 shrink-0 ${
                      Number(team.score) > Number(i === 0 ? homeSide.score : awaySide.score) ? 'text-neon' : 'text-white/45'
                    }`}>{team.score}</span>
                  : <span className="text-[11px] text-white/30 font-medium ml-3 shrink-0">{team.record}</span>
                }
              </div>
            ))}
          </div>

          {s?.situation && (
            <div className="mt-2 px-3 py-2 rounded-lg text-[11px] text-white/50 font-medium"
              style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
              🔴 {s.situation}
            </div>
          )}

          {s?.venue && (
            <p className="mt-2 text-center text-[10px] text-white/25">📍 {s.venue}</p>
          )}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 pb-8 space-y-4">

          {/* Loading */}
          {loading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-24 bg-white/5 rounded-2xl" />
              <div className="h-32 bg-white/5 rounded-2xl" />
              <div className="h-40 bg-white/5 rounded-2xl" />
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-white/30 text-sm">
              Couldn't load game details. Try again.
            </div>
          )}

          {!loading && detail && (
            <>
              {/* Live narrative */}
              {detail.liveNarrative && (
                <div className="rounded-2xl p-4"
                  style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.20)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest uppercase text-orange-400">Live Breakdown</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-white/70">{detail.liveNarrative}</p>
                </div>
              )}

              {/* Who's Hot + Momentum */}
              {(detail.hotTeam || detail.momentum) && (
                <div className="rounded-2xl p-4"
                  style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.18)' }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[10px] font-black tracking-widest uppercase text-orange-400">Who's Hot</span>
                  </div>
                  {detail.hotTeam && (
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="text-[15px] font-black text-white">{detail.hotTeam}</span>
                      <FireBadge />
                    </div>
                  )}
                  {detail.momentum && (
                    <p className="text-[12px] leading-relaxed text-white/60">{detail.momentum}</p>
                  )}
                </div>
              )}

              {/* Recent Form */}
              {(s?.homeLastTen || s?.awayLastTen || s?.homeStreak || s?.awayStreak || s?.homeHomeRecord || s?.awayAwayRecord || s?.homeRecord || s?.awayRecord) && (
                <div className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-[9px] font-black tracking-widest uppercase mb-3 text-white/25">
                    {s?.homeLastTen || s?.awayLastTen ? 'Recent Form (Last 10)' : 'Season Records'}
                  </div>
                  <div className="space-y-3">
                    <FormBar
                      label={s?.homeTeam ?? game.homeTeam}
                      record={s?.homeLastTen ?? s?.homeHomeRecord ?? s?.homeRecord}
                      streak={s?.homeStreak}
                    />
                    <FormBar
                      label={s?.awayTeam ?? game.awayTeam}
                      record={s?.awayLastTen ?? s?.awayAwayRecord ?? s?.awayRecord}
                      streak={s?.awayStreak}
                    />
                  </div>
                  {(s?.homeHomeRecord || s?.awayAwayRecord) && (s?.homeLastTen || s?.awayLastTen) && (
                    <div className="mt-3 pt-3 border-t border-white/6 flex justify-between text-[10px] text-white/30">
                      {s?.homeHomeRecord && <span>{s.homeTeam?.split(' ').pop()} at Home: <span className="text-white/55 font-mono">{s.homeHomeRecord}</span></span>}
                      {s?.awayAwayRecord && <span>{s.awayTeam?.split(' ').pop()} Away: <span className="text-white/55 font-mono">{s.awayAwayRecord}</span></span>}
                    </div>
                  )}
                </div>
              )}

              {/* Head to Head */}
              {detail.h2h && (
                <div className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-[9px] font-black tracking-widest uppercase mb-2.5 text-white/25">Head to Head</div>
                  <p className="text-[12px] leading-relaxed text-white/60">{detail.h2h}</p>
                </div>
              )}

              {/* Pick — locked for free users */}
              {!isMember ? (
                <LockedSection onUnlock={onUnlock} />
              ) : (
                <>
                  {/* Pick */}
                  {detail.pick && detail.tier && detail.confidence !== undefined && (
                    <div className="rounded-2xl p-4"
                      style={{ background: 'rgba(124,252,0,0.07)', border: '1px solid rgba(124,252,0,0.18)' }}>
                      <div className="text-[9px] font-black tracking-widest uppercase mb-1.5" style={{ color: 'rgba(124,252,0,0.55)' }}>
                        Our Pick
                      </div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="text-[18px] font-black text-white leading-snug">
                          {detail.pick.includes('—')
                            ? <><span className="text-neon">{detail.pick.split('—')[0].trim()}</span>{' — '}{detail.pick.split('—')[1].trim()}</>
                            : detail.pick
                          }
                        </div>
                        <TierBadge tier={detail.tier as Tier} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] font-bold tracking-widest uppercase text-white/30">Confidence</span>
                          <span className="text-[11px] font-black text-neon font-mono tabular-nums">{detail.confidence}%</span>
                        </div>
                        <div className="h-[3px] bg-white/8 rounded-full overflow-hidden">
                          <div className="h-full bg-neon rounded-full" style={{ width: `${detail.confidence}%` }} />
                        </div>
                      </div>
                      {detail.bettingAngle && (
                        <p className="mt-3 text-[11px] leading-relaxed" style={{ color: 'rgba(124,252,0,0.65)' }}>
                          💡 {detail.bettingAngle}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Analysis */}
                  {detail.analysis && (
                    <div className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="text-[9px] font-black tracking-widest uppercase mb-2 text-white/25">Analysis</div>
                      <p className="text-[13px] leading-relaxed text-white/65 mb-3">{detail.analysis}</p>
                      {detail.factors && detail.factors.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {detail.factors.map(f => (
                            <FactorPill key={f.label} label={f.label} sentiment={f.sentiment as Sentiment} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* How it could go */}
                  {detail.scenarios && detail.scenarios.length > 0 && (
                    <div className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="text-[9px] font-black tracking-widest uppercase mb-3 text-white/25">How It Could Go</div>
                      <div className="space-y-3">
                        {detail.scenarios.map((sc, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="text-[10px] font-black text-neon/60 mt-0.5 shrink-0">→</span>
                            <div>
                              <div className="text-[11px] font-bold text-white/60 mb-0.5">{sc.label}</div>
                              <div className="text-[12px] text-white/40 leading-relaxed">{sc.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Starting pitchers (MLB) */}
              {(s?.homePitcher || s?.awayPitcher) && (
                <div className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-[9px] font-black tracking-widest uppercase mb-3 text-white/25">Starting Pitchers</div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Home', name: s?.homePitcher, stats: s?.homePitcherStats },
                      { label: 'Away', name: s?.awayPitcher, stats: s?.awayPitcherStats },
                    ].filter(p => p.name).map(p => (
                      <div key={p.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white/22 w-8">{p.label}</span>
                          <span className="text-[13px] font-bold text-white">{p.name}</span>
                        </div>
                        {p.stats && <span className="text-[11px] text-white/35 font-mono">{p.stats}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live game stats */}
              {s?.teamStats && s.teamStats.length > 0 && (
                <div className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[9px] font-black tracking-widest uppercase text-white/25">Game Stats</div>
                    <div className="flex gap-6 text-[9px] font-bold uppercase tracking-wider text-white/25">
                      <span>HME</span>
                      <span>AWY</span>
                    </div>
                  </div>
                  {s.teamStats.map(stat => (
                    <StatRow key={stat.label} label={stat.label}
                      home={stat.home} away={stat.away}
                      homeTeam={s.homeTeam} awayTeam={s.awayTeam} />
                  ))}
                </div>
              )}

              {/* Injuries */}
              {((s?.homeInjuries?.length ?? 0) > 0 || (s?.awayInjuries?.length ?? 0) > 0) && (
                <div className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-[9px] font-black tracking-widest uppercase mb-3 text-white/25">Injury Report</div>
                  <div className="space-y-2">
                    {[...( s?.homeInjuries ?? []).map(i => ({ ...i, team: s?.homeTeam })),
                       ...( s?.awayInjuries ?? []).map(i => ({ ...i, team: s?.awayTeam }))
                    ].map((inj, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          inj.status.toLowerCase().includes('out') ? 'bg-red-500/15 text-red-400' :
                          inj.status.toLowerCase().includes('quest') ? 'bg-orange-500/15 text-orange-400' :
                          'bg-white/8 text-white/40'
                        }`}>{inj.status.toUpperCase().slice(0, 4)}</span>
                        <span className="text-[12px] font-bold text-white/70">{inj.player}</span>
                        <span className="text-[10px] text-white/30">{inj.position}</span>
                        <span className="text-[10px] text-white/25 ml-auto shrink-0">{inj.team?.split(' ').pop()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
