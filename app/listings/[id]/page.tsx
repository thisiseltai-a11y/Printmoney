import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import OfferForm from './OfferForm'
import PhotoGallery from './PhotoGallery'
import SpecsPanel from '@/components/SpecsPanel'
import SaveButton from '@/components/SaveButton'
import SimilarListings from '@/components/SimilarListings'
import { getListing, listSimilarListings, isListingSaved } from '@/lib/db'
import { getExampleListing, EXAMPLE_LISTINGS } from '@/lib/exampleListings'
import { getSessionUser } from '@/lib/supabase/server'
import { centsToDisplay } from '@/lib/money'
import { ShieldCheck } from 'lucide-react'
import styles from './listing.module.css'

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

  const [similarListings, saved] = await Promise.all([
    isExample ? EXAMPLE_LISTINGS.filter((l) => l.id !== id).slice(0, 4) : listSimilarListings(listing),
    user && !isExample ? isListingSaved(user.id, listing.id) : Promise.resolve(false),
  ])

  const title = [listing.year, listing.make, listing.model].filter(Boolean).join(' ')
  const isOwner = user?.id === listing.seller_id

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className={styles.layout}>
          <div className={styles.left}>
            <div className={styles.photo}>
              <PhotoGallery photos={listing.photos ?? []} title={title || 'Vehicle'} />
            </div>

            {listing.description && (
              <div className={styles.description}>
                <h2 className="mb-2 font-grotesk text-lg font-semibold text-ink">Description</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{listing.description}</p>
              </div>
            )}
          </div>

          <div className={styles.right}>
            <div className={styles.title}>
              {isExample && (
                <span className="mb-2 inline-block rounded-full bg-amber/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-amber">
                  Example listing
                </span>
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="font-grotesk text-2xl font-semibold text-ink">{title || 'Vehicle'}</h1>
                  {listing.trim && <p className="text-sm text-muted">{listing.trim}</p>}
                </div>
                {!isOwner && (
                  <SaveButton listingId={listing.id} initialSaved={saved} loggedIn={!!user} preview={isExample} />
                )}
              </div>
            </div>

            <div className={`${styles.price} rounded-card border border-line bg-panel p-6`}>
              <div className="font-mono text-xs uppercase tracking-wider text-muted">Asking price</div>
              <div className="mt-1 font-mono text-3xl font-semibold text-amber">
                {centsToDisplay(listing.asking_price)}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-teal" />
                No hidden fees — the price you see is the price.
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

            <div className={styles.specs}>
              <SpecsPanel listing={listing} />
            </div>

            {listing.vin && (
              <div className={styles.vin}>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted">VIN</div>
                <div className="readout mt-1 text-sm text-ink">{listing.vin}</div>
              </div>
            )}
          </div>
        </div>

        <SimilarListings listings={similarListings} />
      </main>
      <Footer />
    </div>
  )
}
