import ArcGauge from './ArcGauge'
import ValueBand from './ValueBand'
import { CheckCircle2 } from 'lucide-react'

// Static sample readout for the hero — illustrates what a decode looks like
// before the visitor has run one themselves.
export default function GaugeCluster() {
  return (
    <div className="rounded-card border border-line bg-panel p-6 shadow-2xl shadow-black/40">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-muted">Sample lookup</span>
        <span className="rounded-full bg-teal/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-teal">
          Live
        </span>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-sm border border-line bg-raised px-4 py-3">
        <span className="readout text-sm text-ink">5YJ3E1EA...004352</span>
        <span className="font-grotesk text-sm font-medium text-ink">2023 Tesla Model 3</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="flex justify-center rounded-sm bg-raised/60 py-4">
          <ArcGauge pct={38} label="Mileage" value="31.2k" color="#3ED9C0" />
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-sm bg-raised/60 py-4">
          <CheckCircle2 className="h-8 w-8 text-teal" />
          <div className="font-mono text-xs uppercase tracking-wider text-muted">Title Status</div>
          <div className="font-grotesk text-sm font-semibold text-teal">Clean</div>
        </div>
      </div>

      <div className="mt-5 rounded-sm bg-raised/60 p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-muted">Estimated Value</span>
          <span className="font-mono text-2xl font-semibold text-amber">$27,450</span>
        </div>
        <ValueBand low={25100} estimate={27450} high={29800} />
      </div>
    </div>
  )
}
