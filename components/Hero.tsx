import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'
import OfferMockup from './OfferMockup'

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="ambient-glow" />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs uppercase tracking-wider text-teal">
            <Tag className="h-3.5 w-3.5" />
            No listing fees
          </span>
          <h1 className="font-grotesk text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            List your car. <span className="text-amber">Get real offers.</span> Skip the lowballs.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Sellers set a minimum they&apos;ll actually consider — so every offer that comes through is one worth
            your time. Buyers negotiate straight from their dashboard, with a notification the moment the seller
            responds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/sell/new"
              className="flex items-center gap-2 rounded-sm bg-amber px-7 py-4 font-semibold text-bg transition hover:opacity-90 active:scale-[0.98]"
            >
              List your car
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#browse"
              className="rounded-sm border border-line px-7 py-4 font-semibold text-ink transition hover:border-amber/40 hover:bg-panel"
            >
              Browse listings
            </Link>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <OfferMockup />
        </div>
      </div>
    </section>
  )
}
