import { Lock } from 'lucide-react'
import { REPORT_PRICE_DISPLAY } from '@/lib/constants'

const FREE_FIELDS = [
  ['Year / Make / Model', '2023 Tesla Model 3'],
  ['Trim', 'Long Range AWD'],
  ['Body Type', 'Sedan'],
  ['Estimated Value', '$27,450'],
]

const LOCKED_FIELDS = [
  ['Accident History', '1 reported accident'],
  ['Number of Owners', '2 previous owners'],
  ['Title Status', 'Clean'],
  ['Service Records', '6 records on file'],
]

export default function ReportPreview() {
  return (
    <section id="report-preview" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-grotesk text-3xl font-semibold tracking-tight text-ink">What&apos;s in the report</h2>
            <p className="mt-2 max-w-xl text-muted">
              The vehicle lookup and value estimate are always free. The full history report adds what a used-car buyer
              actually needs to know.
            </p>
          </div>
          <span className="rounded-full border border-amber/40 px-3 py-1 font-mono text-xs text-amber">
            Full report: {REPORT_PRICE_DISPLAY} one-time
          </span>
        </div>

        <div className="overflow-hidden rounded-card border border-line bg-panel">
          <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="p-6">
              <div className="mb-4 font-mono text-xs uppercase tracking-wider text-teal">Free — always visible</div>
              <dl className="space-y-4">
                {FREE_FIELDS.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-muted">{label}</dt>
                    <dd className="readout text-sm text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative p-6">
              <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-amber">
                <Lock className="h-3.5 w-3.5" />
                Locked — unlock to view
              </div>
              <dl className="space-y-4">
                {LOCKED_FIELDS.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-muted">{label}</dt>
                    <dd className="locked-field readout text-sm text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
