import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import ListingCard from '@/components/ListingCard'
import { listActiveListings, dbConfigured, type Listing } from '@/lib/db'
import { CarFront } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Shown only while there are zero real listings, so new visitors see what a
// full grid looks like — it disappears on its own the moment real listings
// exist, no cleanup needed. Only the BMW has a (placeholder) photo; see
// OfferMockup.tsx for the note on that image. The rest use the plain
// no-photo icon treatment, same as any real listing without photos.
const EXAMPLE_LISTINGS: Listing[] = [
  {
    id: -1,
    seller_id: 'example',
    year: 2025,
    make: 'BMW',
    model: '3 Series',
    trim: null,
    mileage: 17748,
    vin: null,
    description: null,
    photos: ['/example-bmw-3-series.png'],
    asking_price: 3350000,
    minimum_offer: 3000000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: -2,
    seller_id: 'example',
    year: 2021,
    make: 'Toyota',
    model: 'Tacoma',
    trim: 'TRD Off-Road',
    mileage: 31200,
    vin: null,
    description: null,
    photos: [],
    asking_price: 2850000,
    minimum_offer: 2500000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: -3,
    seller_id: 'example',
    year: 2019,
    make: 'Honda',
    model: 'Civic',
    trim: 'Sport',
    mileage: 48900,
    vin: null,
    description: null,
    photos: [],
    asking_price: 1695000,
    minimum_offer: 1500000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: -4,
    seller_id: 'example',
    year: 2023,
    make: 'Tesla',
    model: 'Model 3',
    trim: 'Long Range',
    mileage: 9100,
    vin: null,
    description: null,
    photos: [],
    asking_price: 3395000,
    minimum_offer: 3100000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
]

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
                <ListingCard key={l.id} listing={l} href="/sell/new" />
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
