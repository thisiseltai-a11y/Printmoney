import { Car, CheckCircle2, ArrowRight } from 'lucide-react'

// Purely decorative — illustrates the negotiation flow on the hero so the
// product reads at a glance instead of needing the copy to carry it alone.
export default function OfferMockup() {
  return (
    <div className="card-lift relative w-full max-w-sm rounded-card border border-line bg-panel p-6 shadow-2xl shadow-black/40">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-raised">
            <Car className="h-5 w-5 text-amber" />
          </div>
          <div>
            <div className="font-grotesk text-sm font-semibold text-ink">2021 Toyota Tacoma</div>
            <div className="font-mono text-xs text-muted">Asking $28,500</div>
          </div>
        </div>
        <span className="rounded-full bg-teal/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-teal">
          Sold
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between rounded-sm bg-raised px-4 py-2.5">
          <span className="text-xs text-muted">Buyer offered</span>
          <span className="readout text-sm text-ink">$24,000</span>
        </div>
        <div className="flex items-center justify-center text-muted">
          <ArrowRight className="h-3.5 w-3.5 rotate-90" />
        </div>
        <div className="flex items-center justify-between rounded-sm bg-raised px-4 py-2.5">
          <span className="text-xs text-muted">Seller countered</span>
          <span className="readout text-sm text-amber">$26,000</span>
        </div>
        <div className="flex items-center justify-center text-muted">
          <ArrowRight className="h-3.5 w-3.5 rotate-90" />
        </div>
        <div className="flex items-center justify-between rounded-sm border border-teal/30 bg-teal/5 px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-xs text-teal">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Buyer accepted
          </span>
          <span className="readout text-sm font-semibold text-teal">$26,000</span>
        </div>
      </div>
    </div>
  )
}
