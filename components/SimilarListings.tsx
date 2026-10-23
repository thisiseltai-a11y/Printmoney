import ListingCard from './ListingCard'
import type { Listing } from '@/lib/db'

export default function SimilarListings({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="mb-5 font-grotesk text-lg font-semibold text-ink">Similar listings</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}
