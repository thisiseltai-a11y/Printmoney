import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import ListingsBrowser from '@/components/ListingsBrowser'
import { listActiveListings, dbConfigured } from '@/lib/db'
import { EXAMPLE_LISTINGS } from '@/lib/exampleListings'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const listings = await listActiveListings()
  const isExample = listings.length === 0

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <HowItWorks />
      <section id="browse" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-grotesk text-3xl font-semibold tracking-tight text-ink">Browse listings</h2>
        <ListingsBrowser
          listings={isExample ? EXAMPLE_LISTINGS : listings}
          isExample={isExample}
          dbConfigured={dbConfigured()}
        />
      </section>
      <Footer />
    </div>
  )
}
