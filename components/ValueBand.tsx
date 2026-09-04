export default function ValueBand({
  low,
  estimate,
  high,
}: {
  low: number
  estimate: number
  high: number
}) {
  const span = Math.max(high - low, 1)
  const pct = Math.min(100, Math.max(0, ((estimate - low) / span) * 100))

  return (
    <div>
      <div className="relative h-3 overflow-hidden rounded-full border border-line bg-bg">
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-teal via-teal/70 to-amber" />
        <div
          className="absolute top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-ink shadow-[0_0_8px_rgba(237,239,242,0.6)]"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-sm text-muted">
        <span>${low.toLocaleString()}</span>
        <span>${high.toLocaleString()}</span>
      </div>
    </div>
  )
}
