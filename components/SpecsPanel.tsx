import { Gauge, Fuel, Palette, Cog, Settings2, Car } from 'lucide-react'
import type { Listing } from '@/lib/db'

const DRIVE_TYPE_LABELS: Record<string, string> = {
  FWD: 'Front-Wheel Drive',
  RWD: 'Rear-Wheel Drive',
  AWD: 'All-Wheel Drive',
  '4WD': 'Four-Wheel Drive',
  '4X4': 'Four-Wheel Drive',
}

function driveTypeLabel(value: string) {
  return DRIVE_TYPE_LABELS[value.toUpperCase()] ?? value
}

export default function SpecsPanel({ listing }: { listing: Listing }) {
  const rows: { icon: typeof Gauge; label: string }[] = []

  if (listing.mileage != null) {
    rows.push({ icon: Gauge, label: `${listing.mileage.toLocaleString()} miles` })
  }
  if (listing.city_mpg != null || listing.highway_mpg != null) {
    const parts = []
    if (listing.city_mpg != null) parts.push(`${listing.city_mpg} City`)
    if (listing.highway_mpg != null) parts.push(`${listing.highway_mpg} Highway`)
    rows.push({ icon: Fuel, label: parts.join(' / ') })
  }
  if (listing.exterior_color) {
    rows.push({ icon: Palette, label: `${listing.exterior_color} Exterior` })
  }
  if (listing.interior_color) {
    rows.push({ icon: Palette, label: `${listing.interior_color} Interior` })
  }
  if (listing.engine) {
    rows.push({ icon: Cog, label: listing.engine })
  }
  if (listing.transmission) {
    rows.push({ icon: Settings2, label: listing.transmission })
  }
  if (listing.drive_type) {
    rows.push({ icon: Car, label: driveTypeLabel(listing.drive_type) })
  }

  if (rows.length === 0) return null

  return (
    <div className="overflow-hidden rounded-card border border-line bg-panel">
      {rows.map((row, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-line' : ''}`}
        >
          <row.icon className="h-5 w-5 shrink-0 text-muted" />
          <span className="text-sm font-medium text-ink">{row.label}</span>
        </div>
      ))}
    </div>
  )
}
