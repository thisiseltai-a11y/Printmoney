import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import OfferForm from './OfferForm'
import SpecsPanel from '@/components/SpecsPanel'
import { getListing } from '@/lib/db'
import { getExampleListing } from '@/lib/exampleListings'
import { getSessionUser } from '@/lib/supabase/server'
import { centsToDisplay } from '@/lib/money'
import { Car } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ListingPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const isExample = id < 0
  const [listing, user] = await Promise.all([
    isExample ? Promise.resolve(getExampleListing(id)) : getListing(id),
    getSessionUser(),
  ])
  if (!listing) notFound()

  const title = [listing.year, listing.make, listing.model].filter(Boolean).join(' ')
  const isOwner = user?.id === listing.seller_id

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-card border border-line bg-panel">
              <div className="flex aspect-[4/3] items-center justify-center bg-raised">
                {listing.photos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.photos[0]} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <Car className="h-14 w-14 text-muted" />
                )}
              </div>
              {listing.photos && listing.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {listing.photos.slice(1).map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={p} alt="" className="h-16 w-20 shrink-0 rounded-sm object-cover" />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {isExample && (
              <span className="mb-2 inline-block rounded-full bg-amber/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-amber">
                Example listing
              </span>
            )}
            <h1 className="font-grotesk text-2xl font-semibold text-ink">{title || 'Vehicle'}</h1>
            {listing.trim && <p className="text-sm text-muted">{listing.trim}</p>}

            <div className="mt-6 rounded-card border border-line bg-panel p-6">
              <div className="font-mono text-xs uppercase tracking-wider text-muted">Asking price</div>
              <div className="mt-1 font-mono text-3xl font-semibold text-amber">
                {centsToDisplay(listing.asking_price)}
              </div>
              {isOwner && (
                <div className="mt-2 font-mono text-xs text-teal">
                  Minimum offer considered: {centsToDisplay(listing.minimum_offer)}
                </div>
              )}

              {isExample ? (
                <>
                  <OfferForm listingId={listing.id} askingPrice={listing.asking_price} preview />
                  <p className="mt-3 rounded-sm border border-line bg-raised px-4 py-3 text-sm text-muted">
                    This is an example listing —{' '}
                    <Link href="/sell/new" className="text-teal hover:underline">
                      list your own car
                    </Link>{' '}
                    to start getting real offers.
                  </p>
                </>
              ) : listing.status !== 'active' ? (
                <p className="mt-5 rounded-sm border border-line bg-raised px-4 py-3 text-sm text-muted">
                  This listing is no longer active.
                </p>
              ) : isOwner ? (
                <p className="mt-5 rounded-sm border border-line bg-raised px-4 py-3 text-sm text-muted">
                  This is your listing — manage offers from your{' '}
                  <Link href="/dashboard" className="text-teal hover:underline">
                    dashboard
                  </Link>
                  .
                </p>
              ) : user ? (
                <OfferForm listingId={listing.id} askingPrice={listing.asking_price} />
              ) : (
                <p className="mt-5 text-sm text-muted">
                  <Link href={`/login?next=/listings/${listing.id}`} className="text-teal hover:underline">
                    Log in
                  </Link>{' '}
                  to make an offer.
                </p>
              )}
            </div>

            <div className="mt-6">
              <SpecsPanel listing={listing} />
            </div>

            {listing.description && (
              <div className="mt-6">
                <h2 className="mb-2 font-grotesk text-lg font-semibold text-ink">Description</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{listing.description}</p>
              </div>
            )}

            {listing.vin && (
              <div className="mt-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted">VIN</div>
                <div className="readout mt-1 text-sm text-ink">{listing.vin}</div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
