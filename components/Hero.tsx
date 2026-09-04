import VinInput from './VinInput'
import GaugeCluster from './GaugeCluster'

export default function Hero() {
  return (
    <section id="lookup" className="border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="mb-4 inline-block rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs uppercase tracking-wider text-teal">
            Free instant decode
          </span>
          <h1 className="font-grotesk text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Know what a car is <span className="text-amber">actually worth</span> before you buy or sell it.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Drop in any VIN for an instant free decode and market value estimate. Need the full story — accidents,
            title, ownership — unlock the complete report for a flat one-time fee.
          </p>
          <div className="mt-8">
            <VinInput autoFocus />
          </div>
        </div>
        <GaugeCluster />
      </div>
    </section>
  )
}
