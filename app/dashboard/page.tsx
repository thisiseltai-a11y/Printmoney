import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import OfferActions from '@/components/OfferActions'
import CancelListingButton from '@/components/CancelListingButton'
import ListingCard from '@/components/ListingCard'
import { getSessionUser } from '@/lib/supabase/server'
import { listListingsBySeller, listOffersForSeller, listOffersForBuyer, listSavedListings } from '@/lib/db'
import { expireOverdueOffers } from '@/lib/offers'
import { centsToDisplay } from '@/lib/money'
import { formatTimeRemaining } from '@/lib/time'
import { redirect } from 'next/navigation'
import { Car, Handshake, Heart, Hourglass } from 'lucide-react'

const LISTING_STATUS_LABELS: Record<string, string> = {
  active: 'active',
  pending_sale: 'pending sale',
  sold: 'sold',
  cancelled: 'cancelled',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login?next=/dashboard')

  const [rawSellerOffers, rawBuyerOffers, listings, savedListings] = await Promise.all([
    listOffersForSeller(user.id),
    listOffersForBuyer(user.id),
    listListingsBySeller(user.id),
    listSavedListings(user.id),
  ])
  // No background job — sweep for any offer whose 48-hour response window
  // passed since the last page load, so the dashboard never shows a stale
  // "Awaiting seller/buyer" past its deadline.
  const [sellerOffers, buyerOffers] = await Promise.all([
    expireOverdueOffers(rawSellerOffers),
    expireOverdueOffers(rawBuyerOffers),
  ])

  const offersByListing = new Map<number, typeof sellerOffers>()
  for (const offer of sellerOffers) {
    const list = offersByListing.get(offer.listing_id) ?? []
    list.push(offer)
    offersByListing.set(offer.listing_id, list)
  }
  // Highest offer first, so the seller sees their best option without
  // having to scan — ties broken by most recent.
  for (const list of Array.from(offersByListing.values())) {
    list.sort((a, b) => b.amount - a.amount || b.updated_at.localeCompare(a.updated_at))
  }

  const activeCount = listings.filter((l) => l.status === 'active').length
  const needsResponseCount =
    sellerOffers.filter((o) => o.status === 'pending_seller').length +
    buyerOffers.filter((o) => o.status === 'pending_buyer').length

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <h1 className="mb-6 font-grotesk text-2xl font-semibold text-ink">Dashboard</h1>

        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile icon={Car} value={activeCount} label="Active listings" />
          <StatTile
            icon={Handshake}
            value={needsResponseCount}
            label="Need your response"
            accent={needsResponseCount > 0}
          />
          <StatTile icon={Hourglass} value={listings.filter((l) => l.status === 'pending_sale').length} label="Pending sale" />
          <StatTile icon={Heart} value={savedListings.length} label="Saved cars" />
        </div>

        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted" />
              <h2 className="font-grotesk text-lg font-semibold text-ink">Selling</h2>
            </div>
            <Link href="/sell/new" className="text-sm text-teal hover:underline">
              + List another car
            </Link>
          </div>
          {listings.length === 0 ? (
            <EmptyState icon={Car} message="You haven't listed a car yet." />
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => {
                const offers = offersByListing.get(listing.id) ?? []
                const title = [listing.year, listing.make, listing.model].filter(Boolean).join(' ')
                const photo = listing.photos?.[0]
                return (
                  <div key={listing.id} className="card-lift rounded-card border border-line bg-panel p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-raised">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photo} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Car className="h-5 w-5 text-muted" />
                          )}
                        </div>
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-grotesk font-semibold text-ink hover:underline"
                        >
                          {title || 'Vehicle'}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-amber">{centsToDisplay(listing.asking_price)}</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-xs uppercase ${
                            listing.status === 'active'
                              ? 'bg-teal/10 text-teal'
                              : listing.status === 'pending_sale' || listing.status === 'sold'
                                ? 'bg-amber/10 text-amber'
                                : 'bg-raised text-muted'
                          }`}
                        >
                          {LISTING_STATUS_LABELS[listing.status]}
                        </span>
                        {listing.status === 'active' && <CancelListingButton listingId={listing.id} />}
                      </div>
                    </div>

                    {offers.length === 0 ? (
                      <p className="mt-3 font-mono text-xs text-muted">No offers yet.</p>
                    ) : (
                      <div className="mt-4 space-y-3 border-t border-line pt-4">
                        {offers.map((offer) => (
                          <div
                            key={offer.id}
                            className={`flex flex-wrap items-center justify-between gap-3 rounded-sm px-3 py-2 ${
                              offer.status === 'pending_seller' ? 'bg-amber/5' : ''
                            }`}
                          >
                            <span className="readout text-sm text-ink">{centsToDisplay(offer.amount)}</span>
                            <OfferActions
                              offerId={offer.id}
                              status={offer.status}
                              role="seller"
                              expiresIn={formatTimeRemaining(offer.expires_at)}
                            />
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
          <div className="mb-4 flex items-center gap-2">
            <Handshake className="h-4 w-4 text-muted" />
            <h2 className="font-grotesk text-lg font-semibold text-ink">Buying</h2>
          </div>
          {buyerOffers.length === 0 ? (
            <EmptyState
              icon={Handshake}
              message={
                <>
                  You haven&apos;t made any offers yet.{' '}
                  <Link href="/#browse" className="text-teal hover:underline">
                    Browse listings
                  </Link>
                  .
                </>
              }
            />
          ) : (
            <div className="space-y-4">
              {buyerOffers.map((offer) => {
                const title = [offer.listing.year, offer.listing.make, offer.listing.model].filter(Boolean).join(' ')
                const photo = offer.listing.photos?.[0]
                return (
                  <div
                    key={offer.id}
                    className={`card-lift rounded-card border p-5 ${
                      offer.status === 'pending_buyer' ? 'border-amber/30 bg-amber/5' : 'border-line bg-panel'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-raised">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photo} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Car className="h-5 w-5 text-muted" />
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/listings/${offer.listing_id}`}
                            className="font-grotesk font-semibold text-ink hover:underline"
                          >
                            {title || 'Vehicle'}
                          </Link>
                          <div className="readout mt-1 text-sm text-amber">{centsToDisplay(offer.amount)}</div>
                        </div>
                      </div>
                      <OfferActions
                        offerId={offer.id}
                        status={offer.status}
                        role="buyer"
                        expiresIn={formatTimeRemaining(offer.expires_at)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted" />
            <h2 className="font-grotesk text-lg font-semibold text-ink">Saved</h2>
          </div>
          {savedListings.length === 0 ? (
            <EmptyState icon={Heart} message="Cars you save will show up here." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {savedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

function StatTile({
  icon: Icon,
  value,
  label,
  accent = false,
}: {
  icon: typeof Car
  value: number
  label: string
  accent?: boolean
}) {
  return (
    <div className="rounded-card border border-line bg-panel p-4">
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full ${
          accent ? 'bg-amber/10' : 'bg-raised'
        }`}
      >
        <Icon className={`h-4 w-4 ${accent ? 'text-amber' : 'text-muted'}`} />
      </div>
      <div className={`font-mono text-2xl font-semibold ${accent ? 'text-amber' : 'text-ink'}`}>{value}</div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
    </div>
  )
}

function EmptyState({ icon: Icon, message }: { icon: typeof Car; message: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-panel/60 p-8 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber/10">
        <Icon className="h-5 w-5 text-amber" />
      </div>
      <p className="text-sm text-muted">{message}</p>
    </div>
  )
}
