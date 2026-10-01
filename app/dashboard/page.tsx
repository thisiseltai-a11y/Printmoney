import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import OfferActions from '@/components/OfferActions'
import CancelListingButton from '@/components/CancelListingButton'
import { getSessionUser } from '@/lib/supabase/server'
import { listListingsBySeller, listOffersForSeller, listOffersForBuyer } from '@/lib/db'
import { centsToDisplay } from '@/lib/money'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login?next=/dashboard')

  const [listings, sellerOffers, buyerOffers] = await Promise.all([
    listListingsBySeller(user.id),
    listOffersForSeller(user.id),
    listOffersForBuyer(user.id),
  ])

  const offersByListing = new Map<number, typeof sellerOffers>()
  for (const offer of sellerOffers) {
    const list = offersByListing.get(offer.listing_id) ?? []
    list.push(offer)
    offersByListing.set(offer.listing_id, list)
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <h1 className="mb-8 font-grotesk text-2xl font-semibold text-ink">Dashboard</h1>

        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-grotesk text-lg font-semibold text-ink">Selling</h2>
            <Link href="/sell/new" className="text-sm text-teal hover:underline">
              + List another car
            </Link>
          </div>
          {listings.length === 0 ? (
            <p className="rounded-card border border-dashed border-line bg-panel/60 p-6 text-sm text-muted">
              You haven&apos;t listed a car yet.
            </p>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => {
                const offers = offersByListing.get(listing.id) ?? []
                const title = [listing.year, listing.make, listing.model].filter(Boolean).join(' ')
                return (
                  <div key={listing.id} className="card-lift rounded-card border border-line bg-panel p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link href={`/listings/${listing.id}`} className="font-grotesk font-semibold text-ink hover:underline">
                        {title || 'Vehicle'}
                      </Link>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-amber">{centsToDisplay(listing.asking_price)}</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-xs uppercase ${
                            listing.status === 'active'
                              ? 'bg-teal/10 text-teal'
                              : listing.status === 'sold'
                                ? 'bg-amber/10 text-amber'
                                : 'bg-raised text-muted'
                          }`}
                        >
                          {listing.status}
                        </span>
                        {listing.status === 'active' && <CancelListingButton listingId={listing.id} />}
                      </div>
                    </div>

                    {offers.length === 0 ? (
                      <p className="mt-3 font-mono text-xs text-muted">No offers yet.</p>
                    ) : (
                      <div className="mt-4 space-y-3 border-t border-line pt-4">
                        {offers.map((offer) => (
                          <div key={offer.id} className="flex flex-wrap items-center justify-between gap-3">
                            <span className="readout text-sm text-ink">{centsToDisplay(offer.amount)}</span>
                            <OfferActions offerId={offer.id} status={offer.status} role="seller" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-grotesk text-lg font-semibold text-ink">Buying</h2>
          {buyerOffers.length === 0 ? (
            <p className="rounded-card border border-dashed border-line bg-panel/60 p-6 text-sm text-muted">
              You haven&apos;t made any offers yet.{' '}
              <Link href="/#browse" className="text-teal hover:underline">
                Browse listings
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-4">
              {buyerOffers.map((offer) => {
                const title = [offer.listing.year, offer.listing.make, offer.listing.model].filter(Boolean).join(' ')
                return (
                  <div key={offer.id} className="card-lift rounded-card border border-line bg-panel p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <Link href={`/listings/${offer.listing_id}`} className="font-grotesk font-semibold text-ink hover:underline">
                          {title || 'Vehicle'}
                        </Link>
                        <div className="readout mt-1 text-sm text-amber">{centsToDisplay(offer.amount)}</div>
                      </div>
                      <OfferActions offerId={offer.id} status={offer.status} role="buyer" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
