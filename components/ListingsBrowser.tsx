'use client'

import { useMemo, useState } from 'react'
import ListingCard from './ListingCard'
import type { Listing } from '@/lib/db'
import { CarFront, SlidersHorizontal } from 'lucide-react'

export default function ListingsBrowser({
  listings,
  isExample,
  dbConfigured,
}: {
  listings: Listing[]
  isExample: boolean
  dbConfigured: boolean
}) {
  const [year, setYear] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')

  const years = useMemo(
    () => Array.from(new Set(listings.map((l) => l.year).filter((y): y is number => y != null))).sort((a, b) => b - a),
    [listings]
  )
  const makes = useMemo(
    () => Array.from(new Set(listings.map((l) => l.make))).sort(),
    [listings]
  )
  // Models narrow to whichever make is selected, so you never see a model
  // that doesn't exist for that make.
  const models = useMemo(
    () =>
      Array.from(new Set(listings.filter((l) => !make || l.make === make).map((l) => l.model))).sort(),
    [listings, make]
  )

  function handleMakeChange(value: string) {
    setMake(value)
    // Clear the model if it no longer applies to the newly chosen make.
    if (value && model) {
      const stillValid = listings.some((l) => l.make === value && l.model === model)
      if (!stillValid) setModel('')
    }
  }

  const filtered = listings.filter(
    (l) => (!year || l.year === Number(year)) && (!make || l.make === make) && (!model || l.model === model)
  )
  const hasFilters = !!(year || make || model)

  return (
    <div className="mt-8">
      {isExample && (
        <>
          <div className="mb-6 flex flex-col items-center gap-4 rounded-card border border-dashed border-line bg-panel/60 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber/10">
              <CarFront className="h-7 w-7 text-amber" />
            </div>
            <p className="text-muted">No listings yet — be the first to list a car.</p>
          </div>
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted">Example listings</p>
        </>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </span>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="field-input h-10 w-auto">
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select value={make} onChange={(e) => handleMakeChange(e.target.value)} className="field-input h-10 w-auto">
          <option value="">All makes</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={model} onChange={(e) => setModel(e.target.value)} className="field-input h-10 w-auto">
          <option value="">All models</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              setYear('')
              setMake('')
              setModel('')
            }}
            className="font-mono text-xs text-teal hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">No listings match those filters.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {isExample && !dbConfigured && (
        <p className="mt-6 font-mono text-xs text-muted">
          Database isn&apos;t configured yet — set the Supabase env vars to start listing and browsing cars.
        </p>
      )}
    </div>
  )
}
