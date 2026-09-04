// Semi-circular dashboard-style gauge. `pct` is 0–100.
export default function ArcGauge({
  pct,
  label,
  value,
  color = '#FF8A3D',
}: {
  pct: number
  label: string
  value: string
  color?: string
}) {
  const clamped = Math.min(100, Math.max(0, pct))
  const radius = 42
  const circumference = Math.PI * radius // half circle
  const offset = circumference - (clamped / 100) * circumference
  const angle = -90 + (clamped / 100) * 180

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 56" className="w-32">
        <path
          d="M 8 50 A 42 42 0 0 1 92 50"
          fill="none"
          stroke="#2C313A"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 8 50 A 42 42 0 0 1 92 50"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }}
        />
        <g
          className="gauge-needle"
          style={{ ['--needle-angle' as any]: `${angle}deg` }}
        >
          <line x1="50" y1="50" x2="50" y2="14" stroke="#EDEFF2" strokeWidth="2" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="50" r="3.5" fill="#EDEFF2" />
      </svg>
      <div className="-mt-1 font-mono text-lg font-semibold text-ink">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  )
}
