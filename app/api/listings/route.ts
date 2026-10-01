import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/supabase/server'
import { createListing } from '@/lib/db'
import { dollarsToCents } from '@/lib/money'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 })

  const body = await req.json()
  const make = String(body.make || '').trim()
  const model = String(body.model || '').trim()
  const askingPrice = Number(body.askingPrice)
  const minimumOffer = Number(body.minimumOffer)

  if (!make || !model) {
    return NextResponse.json({ error: 'Make and model are required.' }, { status: 400 })
  }
  if (!Number.isFinite(askingPrice) || askingPrice <= 0) {
    return NextResponse.json({ error: 'Enter a valid asking price.' }, { status: 400 })
  }
  if (!Number.isFinite(minimumOffer) || minimumOffer <= 0) {
    return NextResponse.json({ error: 'Enter a valid minimum offer.' }, { status: 400 })
  }
  if (minimumOffer > askingPrice) {
    return NextResponse.json({ error: "Minimum offer can't be higher than the asking price." }, { status: 400 })
  }

  const listing = await createListing({
    seller_id: user.id,
    year: body.year ? Number(body.year) : null,
    make,
    model,
    trim: body.trim ? String(body.trim) : null,
    mileage: body.mileage ? Number(body.mileage) : null,
    vin: body.vin ? String(body.vin).toUpperCase() : null,
    description: body.description ? String(body.description) : null,
    photos: Array.isArray(body.photos) ? body.photos.slice(0, 12) : [],
    asking_price: dollarsToCents(askingPrice),
    minimum_offer: dollarsToCents(minimumOffer),
  })

  return NextResponse.json({ listing })
}
