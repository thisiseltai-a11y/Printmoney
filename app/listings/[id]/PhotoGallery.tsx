'use client'

import { useState } from 'react'
import { Car } from 'lucide-react'

export default function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const [active, setActive] = useState(0)

  return (
    <div className="overflow-hidden rounded-card border border-line bg-panel">
      <div className="flex aspect-[4/3] items-center justify-center bg-raised">
        {photos[active] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photos[active]} alt={title} className="h-full w-full object-cover" />
        ) : (
          <Car className="h-14 w-14 text-muted" />
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {photos.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-sm border transition ${
                i === active ? 'border-amber' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
