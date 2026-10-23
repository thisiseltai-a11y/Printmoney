import { CheckCircle2, ArrowRight } from 'lucide-react'

// Purely decorative — illustrates the negotiation flow on the hero so the
// product reads at a glance instead of needing the copy to carry it alone.
// NOTE: example-bmw-3-series.png is a placeholder stock/press-style photo
// for local preview only — swap for a properly licensed image (or remove
// the <img> block below) before this goes out to real users.
export default function OfferMockup() {
  return (
    <div className="card-lift relative w-full max-w-sm overflow-hidden rounded-card border border-line bg-panel shadow-xl shadow-black/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/example-bmw-3-series.png" alt="" className="h-40 w-full object-cover" />
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="font-grotesk text-sm font-semibold text-ink">2025 BMW 3 Series</div>
            <div className="font-mono text-xs text-muted">Asking $33,500</div>
          </div>
          <span className="rounded-full bg-amber/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-amber">
            Pending sale
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between rounded-sm bg-raised px-4 py-2.5">
            <span className="text-xs text-muted">Buyer offered</span>
            <span className="readout text-sm text-ink">$30,000</span>
          </div>
          <div className="flex items-center justify-center text-muted">
            <ArrowRight className="h-3.5 w-3.5 rotate-90" />
          </div>
          <div className="flex items-center justify-between rounded-sm bg-raised px-4 py-2.5">
            <span className="text-xs text-muted">Seller countered</span>
            <span className="readout text-sm text-amber">$32,000</span>
          </div>
          <div className="flex items-center justify-center text-muted">
            <ArrowRight className="h-3.5 w-3.5 rotate-90" />
          </div>
          <div className="flex items-center justify-between rounded-sm border border-teal/30 bg-teal/5 px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-xs text-teal">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Buyer accepted
            </span>
            <span className="readout text-sm font-semibold text-teal">$32,000</span>
          </div>
        </div>
      </div>
    </div>
  )
}
