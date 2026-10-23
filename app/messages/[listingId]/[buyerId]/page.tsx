import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MessageThread from '@/components/MessageThread'
import { getListing, listMessagesForThread, hasMessageRelationship } from '@/lib/db'
import { getSessionUser } from '@/lib/supabase/server'
import { ArrowLeft, Car } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MessageThreadPage({
  params,
}: {
  params: { listingId: string; buyerId: string }
}) {
  const user = await getSessionUser()
  if (!user) redirect(`/login?next=/messages/${params.listingId}/${params.buyerId}`)

  const listingId = Number(params.listingId)
  if (!Number.isFinite(listingId)) notFound()

  const listing = await getListing(listingId)
  if (!listing) notFound()

  const isSeller = listing.seller_id === user.id
  const isBuyer = params.buyerId === user.id
  if (!isSeller && !isBuyer) notFound()

  const canMessage = await hasMessageRelationship(listingId, params.buyerId)
  const title = [listing.year, listing.make, listing.model].filter(Boolean).join(' ')

  if (!canMessage) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <Navbar />
        <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
          <Link href="/dashboard" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="rounded-card border border-line bg-panel p-6 text-center">
            <p className="text-sm text-muted">
              {isBuyer
                ? 'Make an offer on this listing before messaging the seller.'
                : "This buyer hasn't made an offer on this listing yet."}
            </p>
            <Link href={`/listings/${listing.id}`} className="mt-3 inline-block text-sm text-teal hover:underline">
              View {title || 'the listing'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const messages = await listMessagesForThread(listingId, params.buyerId)

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <Link href="/dashboard" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="overflow-hidden rounded-card border border-line bg-panel">
          <div className="flex items-center gap-3 border-b border-line p-4">
            <Link
              href={`/listings/${listing.id}`}
              className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-raised"
            >
              {listing.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={listing.photos[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <Car className="h-5 w-5 text-muted" />
              )}
            </Link>
            <div>
              <Link href={`/listings/${listing.id}`} className="font-grotesk font-semibold text-ink hover:underline">
                {title || 'Vehicle'}
              </Link>
              <div className="font-mono text-xs text-muted">{isSeller ? 'Message from a buyer' : 'Message with the seller'}</div>
            </div>
          </div>

          <MessageThread
            listingId={listingId}
            buyerId={params.buyerId}
            currentUserId={user.id}
            initialMessages={messages}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
