import { CheckCircle2, AlertTriangle, Users, Wrench } from 'lucide-react'
import type { HistoryReport } from '@/lib/vehicleHistory'

export default function HistoryReportCard({ report }: { report: HistoryReport }) {
  const clean = report.titleStatus.toLowerCase() === 'clean'

  return (
    <div className="rounded-card border border-teal/40 bg-panel p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-grotesk text-lg font-semibold text-ink">Full History Report</h3>
        <span className="rounded-full bg-teal/10 px-3 py-1 font-mono text-xs text-teal">Unlocked</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-sm bg-raised p-4">
          <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
            {report.accidentCount > 0 ? (
              <AlertTriangle className="h-4 w-4 text-amber" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-teal" />
            )}
            Accident History
          </div>
          {report.accidentCount === 0 ? (
            <p className="text-sm text-ink">No accidents reported.</p>
          ) : (
            <ul className="space-y-2">
              {report.accidents.map((a, i) => (
                <li key={i} className="text-sm text-ink">
                  <span className="readout text-muted">{a.date}</span> — {a.description} ({a.severity})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-sm bg-raised p-4">
          <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
            {clean ? <CheckCircle2 className="h-4 w-4 text-teal" /> : <AlertTriangle className="h-4 w-4 text-amber" />}
            Title Status
          </div>
          <p className={`text-sm font-medium ${clean ? 'text-teal' : 'text-amber'}`}>{report.titleStatus}</p>
        </div>

        <div className="rounded-sm bg-raised p-4">
          <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
            <Users className="h-4 w-4 text-amber" />
            Ownership
          </div>
          <p className="text-sm text-ink">{report.ownerCount} previous owner{report.ownerCount === 1 ? '' : 's'}</p>
        </div>

        <div className="rounded-sm bg-raised p-4">
          <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
            <Wrench className="h-4 w-4 text-amber" />
            Service Records
          </div>
          {report.serviceRecords.length === 0 ? (
            <p className="text-sm text-ink">No service records on file.</p>
          ) : (
            <ul className="space-y-1.5">
              {report.serviceRecords.map((s, i) => (
                <li key={i} className="text-sm text-ink">
                  <span className="readout text-muted">{s.date}</span> — {s.description}
                  <span className="readout text-muted"> · {s.mileage.toLocaleString()} mi</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {report.source === 'demo' && (
        <p className="mt-4 font-mono text-xs text-muted">
          Demo data — connect a live history provider key to show real records.
        </p>
      )}
    </div>
  )
}
