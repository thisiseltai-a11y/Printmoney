import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import ListingCard from '@/components/ListingCard'
import { listActiveListings, dbConfigured } from '@/lib/db'
import { EXAMPLE_LISTINGS } from '@/lib/exampleListings'
import { CarFront } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const listings = await listActiveListings()

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <HowItWorks />
      <section id="browse" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-grotesk text-3xl font-semibold tracking-tight text-ink">Browse listings</h2>
        {listings.length === 0 ? (
          <div className="mt-10">
            <div className="mb-6 flex flex-col items-center gap-4 rounded-card border border-dashed border-line bg-panel/60 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber/10">
                <CarFront className="h-7 w-7 text-amber" />
              </div>
              <p className="text-muted">No listings yet — be the first to list a car.</p>
            </div>
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">Example listings</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {EXAMPLE_LISTINGS.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
            {!dbConfigured() && (
              <p className="mt-6 font-mono text-xs text-muted">
                Database isn&apos;t configured yet — set the Supabase env vars to start listing and browsing cars.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}
