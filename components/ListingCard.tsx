import Link from 'next/link'
import { Car } from 'lucide-react'
import type { Listing } from '@/lib/db'
import { centsToDisplay } from '@/lib/money'

export default function ListingCard({ listing }: { listing: Listing }) {
  const title = [listing.year, listing.make, listing.model].filter(Boolean).join(' ')
  const photo = listing.photos?.[0]

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="card-lift group overflow-hidden rounded-card border border-line bg-panel transition-colors hover:border-amber/40"
    >
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-raised">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={title} className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
        ) : (
          <Car className="h-10 w-10 text-muted" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-grotesk text-base font-semibold text-ink">{title || 'Vehicle'}</h3>
        {listing.trim && <p className="text-xs text-muted">{listing.trim}</p>}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-lg font-semibold text-amber">{centsToDisplay(listing.asking_price)}</span>
          {listing.mileage != null && (
            <span className="readout text-xs text-muted">{listing.mileage.toLocaleString()} mi</span>
          )}
        </div>
      </div>
    </Link>
  )
}
