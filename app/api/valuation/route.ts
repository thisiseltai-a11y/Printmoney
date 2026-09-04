import { NextRequest, NextResponse } from 'next/server'
import { validateVin } from '@/lib/vin'
import { getValuation } from '@/lib/valuation'
import { attachValuationToLookup } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { valid, vin, reason } = validateVin(body.vin ?? '')
    if (!valid) {
      return NextResponse.json({ error: reason }, { status: 400 })
    }

    const mileage = Number(body.mileage)
    if (!Number.isFinite(mileage) || mileage < 0 || mileage > 500000) {
      return NextResponse.json({ error: 'Enter a valid mileage.' }, { status: 400 })
    }

    const result = await getValuation({
      vin,
      year: String(body.year ?? ''),
      make: String(body.make ?? ''),
      model: String(body.model ?? ''),
      trim: body.trim ? String(body.trim) : undefined,
      mileage,
    })

    await attachValuationToLookup(vin, result.estimate)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Valuation error:', err)
    return NextResponse.json({ error: 'Valuation failed. Please try again.' }, { status: 500 })
  }
}
