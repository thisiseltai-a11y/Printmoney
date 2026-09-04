import { NextRequest, NextResponse } from 'next/server'
import { validateVin } from '@/lib/vin'
import { getValuation, type ValuationResult } from '@/lib/valuation'
import { attachValuationToLookup } from '@/lib/db'
import { getCachedValuation, setCachedValuation } from '@/lib/cache'
import { getClientIp, isRateLimited } from '@/lib/rateLimit'

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

    const ip = getClientIp(req)
    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many lookups from this connection. Try again in a bit.' },
        { status: 429 }
      )
    }

    let result = await getCachedValuation<ValuationResult>(vin, mileage)
    if (!result) {
      result = await getValuation({
        vin,
        year: String(body.year ?? ''),
        make: String(body.make ?? ''),
        model: String(body.model ?? ''),
        trim: body.trim ? String(body.trim) : undefined,
        mileage,
      })
      await setCachedValuation(vin, mileage, result)
    }

    await attachValuationToLookup(vin, result.estimate, ip)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Valuation error:', err)
    return NextResponse.json({ error: 'Valuation failed. Please try again.' }, { status: 500 })
  }
}
