import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import OfferForm from './OfferForm'
import { getListing } from '@/lib/db'
import { getSessionUser } from '@/lib/supabase/server'
import { centsToDisplay } from '@/lib/money'
import { Car } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ListingPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const [listing, user] = await Promise.all([getListing(id), getSessionUser()])
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

            {listing.description && (
              <div className="mt-6">
                <h2 className="mb-2 font-grotesk text-lg font-semibold text-ink">Description</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{listing.description}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <h1 className="font-grotesk text-2xl font-semibold text-ink">{title || 'Vehicle'}</h1>
            {listing.trim && <p className="text-sm text-muted">{listing.trim}</p>}

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {listing.mileage != null && (
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted">Mileage</div>
                  <div className="readout text-ink">{listing.mileage.toLocaleString()} mi</div>
                </div>
              )}
              {listing.vin && (
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted">VIN</div>
                  <div className="readout text-ink">{listing.vin}</div>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-card border border-line bg-panel p-6">
              <div className="font-mono text-xs uppercase tracking-wider text-muted">Asking price</div>
              <div className="mt-1 font-mono text-3xl font-semibold text-amber">
                {centsToDisplay(listing.asking_price)}
              </div>
              <div className="mt-2 font-mono text-xs text-teal">
                Minimum offer considered: {centsToDisplay(listing.minimum_offer)}
              </div>

              {listing.status !== 'active' ? (
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
                <OfferForm listingId={listing.id} minimumOffer={listing.minimum_offer} />
              ) : (
                <p className="mt-5 text-sm text-muted">
                  <Link href={`/login?next=/listings/${listing.id}`} className="text-teal hover:underline">
                    Log in
                  </Link>{' '}
                  to make an offer.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
