'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Search, Unlock } from 'lucide-react'
import type { TickerStats } from '@/lib/db'

export default function TickerStrip({ initial }: { initial: TickerStats }) {
  const [stats, setStats] = useState<TickerStats>(initial)

  useEffect(() => {
    const id = setInterval(() => {
      fetch('/api/stats/ticker')
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [])

  const items = [
    {
      icon: Search,
      text: `${stats.lookupsLastHour.toLocaleString()} VINs checked in the last hour`,
    },
    {
      icon: stats.valueTrend === 'up' ? TrendingUp : TrendingDown,
      text: `Avg. value trending ${stats.valueTrend} ${stats.valueTrendPct}% this week`,
      color: stats.valueTrend === 'up' ? 'text-teal' : 'text-amber',
    },
    {
      icon: Unlock,
      text: `${stats.reportsUnlockedToday.toLocaleString()} full reports unlocked today`,
    },
  ]
  const loop = [...items, ...items]

  return (
    <div className="overflow-hidden border-y border-line bg-panel py-3">
      <div className="ticker-track flex w-max gap-12">
        {loop.map((item, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap px-2 font-mono text-sm text-muted">
            <item.icon className={`h-4 w-4 ${item.color ?? 'text-amber'}`} />
            <span>{item.text}</span>
            <span className="ml-10 text-line">•</span>
          </div>
        ))}
      </div>
    </div>
  )
}
