import type { Listing } from './db'

// Shown on the homepage whenever there are zero real listings, and viewable
// at /listings/[id] via their negative ids — so clicking one actually shows
// the real listing-detail layout instead of a dead link or a login wall.
// They disappear automatically everywhere the moment real listings exist.
// Only the BMW has a (placeholder) photo; see components/OfferMockup.tsx
// for the note on that image.
export const EXAMPLE_LISTINGS: Listing[] = [
  {
    id: -1,
    seller_id: 'example',
    year: 2025,
    make: 'BMW',
    model: '3 Series',
    trim: null,
    mileage: 17748,
    vin: null,
    description: 'Example listing — this is what a real one looks like once you post your car.',
    photos: ['/example-bmw-3-series.png'],
    asking_price: 3350000,
    minimum_offer: 3000000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: -2,
    seller_id: 'example',
    year: 2021,
    make: 'Toyota',
    model: 'Tacoma',
    trim: 'TRD Off-Road',
    mileage: 31200,
    vin: null,
    description: 'Example listing — this is what a real one looks like once you post your car.',
    photos: [],
    asking_price: 2850000,
    minimum_offer: 2500000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: -3,
    seller_id: 'example',
    year: 2019,
    make: 'Honda',
    model: 'Civic',
    trim: 'Sport',
    mileage: 48900,
    vin: null,
    description: 'Example listing — this is what a real one looks like once you post your car.',
    photos: [],
    asking_price: 1695000,
    minimum_offer: 1500000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: -4,
    seller_id: 'example',
    year: 2023,
    make: 'Tesla',
    model: 'Model 3',
    trim: 'Long Range',
    mileage: 9100,
    vin: null,
    description: 'Example listing — this is what a real one looks like once you post your car.',
    photos: [],
    asking_price: 3395000,
    minimum_offer: 3100000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
]

export function getExampleListing(id: number): Listing | null {
  return EXAMPLE_LISTINGS.find((l) => l.id === id) ?? null
}
