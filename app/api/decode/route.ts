import { NextRequest, NextResponse } from 'next/server'
import { validateVin } from '@/lib/vin'
import { decodeVin, type DecodedVehicle } from '@/lib/nhtsa'
import { logLookup } from '@/lib/db'
import { getCachedDecode, setCachedDecode } from '@/lib/cache'
import { getClientIp, isRateLimited } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const { vin: raw } = await req.json()
    if (typeof raw !== 'string') {
      return NextResponse.json({ error: 'VIN is required.' }, { status: 400 })
    }

    const { valid, vin, reason } = validateVin(raw)
    if (!valid) {
      return NextResponse.json({ error: reason }, { status: 400 })
    }

    const ip = getClientIp(req)
    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many lookups from this connection. Try again in a bit.' },
        { status: 429 }
      )
    }

    let decoded = await getCachedDecode<DecodedVehicle>(vin)
    if (!decoded) {
      decoded = await decodeVin(vin)
      if (decoded.errorCode && decoded.errorCode !== '0') {
        return NextResponse.json(
          { error: decoded.errorText || 'Could not find details for this VIN.' },
          { status: 422 }
        )
      }
      await setCachedDecode(vin, decoded)
    }

    await logLookup(vin, 'free', { ip })

    return NextResponse.json({ vin, decoded })
  } catch (err) {
    console.error('Decode error:', err)
    return NextResponse.json({ error: 'Lookup failed. Please try again.' }, { status: 500 })
  }
}
