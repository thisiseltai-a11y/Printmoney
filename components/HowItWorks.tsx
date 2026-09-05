import { ScanLine, Gauge, FileLock2 } from 'lucide-react'

const STEPS = [
  {
    icon: ScanLine,
    step: '01',
    title: 'Enter the VIN',
    body: 'Type or paste any 17-character VIN. We validate it instantly, right in the box.',
  },
  {
    icon: Gauge,
    step: '02',
    title: 'Get the free readout',
    body: 'Year, make, model, trim, engine, and a market value estimate — all in seconds, no signup.',
  },
  {
    icon: FileLock2,
    step: '03',
    title: 'Unlock the full report',
    body: 'Want accidents, title status, and ownership history? Unlock it for a flat one-time fee.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-grotesk text-3xl font-semibold tracking-tight text-ink">How it works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="rounded-card border border-line bg-panel p-6">
              <div className="mb-4 flex items-center justify-between">
                <s.icon className="h-6 w-6 text-amber" />
                <span className="font-mono text-xs text-muted">{s.step}</span>
              </div>
              <h3 className="font-grotesk text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
