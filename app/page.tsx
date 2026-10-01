import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import ListingCard from '@/components/ListingCard'
import { listActiveListings, dbConfigured } from '@/lib/db'
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
        {!dbConfigured() ? (
          <p className="mt-6 text-muted">
            Database isn&apos;t configured yet — set the Supabase env vars to start listing and browsing cars.
          </p>
        ) : listings.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-panel/60 p-12 text-center">
            <CarFront className="h-8 w-8 text-muted" />
            <p className="text-muted">No listings yet — be the first to list a car.</p>
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
