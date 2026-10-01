import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'

export default function Hero() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-24">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs uppercase tracking-wider text-teal">
          <Tag className="h-3.5 w-3.5" />
          No listing fees
        </span>
        <h1 className="mx-auto max-w-3xl font-grotesk text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          List your car. <span className="text-amber">Get real offers.</span> Skip the lowballs.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Sellers set a minimum they&apos;ll actually consider — so every offer that comes through is one worth your time.
          Buyers negotiate straight from their dashboard, with a notification the moment the seller responds.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/sell/new"
            className="flex items-center gap-2 rounded-sm bg-amber px-7 py-4 font-semibold text-bg transition hover:opacity-90"
          >
            List your car
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/#browse"
            className="rounded-sm border border-line px-7 py-4 font-semibold text-ink transition hover:border-amber/40"
          >
            Browse listings
          </Link>
        </div>
      </div>
    </section>
  )
}
