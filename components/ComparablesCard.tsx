import type { Comparable } from '@/lib/valuation'
import { Clock3 } from 'lucide-react'

export default function ComparablesCard({ comparables }: { comparables?: Comparable[] }) {
  if (!comparables || comparables.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-panel/60 p-6">
        <div className="mb-1 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
          <Clock3 className="h-3.5 w-3.5" />
          Recent Comparable Sales — Coming Soon
        </div>
        <p className="text-sm text-muted">
          We&apos;re working on surfacing similar cars sold nearby to help you sanity-check this estimate.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-card border border-line bg-panel p-6">
      <div className="mb-4 font-mono text-xs uppercase tracking-wider text-muted">Recent Comparable Sales</div>
      <ul className="space-y-2">
        {comparables.slice(0, 3).map((c, i) => (
          <li key={i} className="flex items-center justify-between rounded-sm bg-raised px-4 py-3 text-sm">
            <span className="text-ink">
              Similar vehicle sold nearby
              {c.mileage ? ` · ${c.mileage.toLocaleString()} mi` : ''}
              {c.distanceMiles ? ` · ${c.distanceMiles} mi away` : ''}
              {c.soldDaysAgo ? ` · ${c.soldDaysAgo}d ago` : ''}
            </span>
            <span className="readout text-teal">${c.price.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
