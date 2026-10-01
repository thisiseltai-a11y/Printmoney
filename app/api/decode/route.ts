import { NextRequest, NextResponse } from 'next/server'
import { validateVin } from '@/lib/vin'
import { decodeVin, type DecodedVehicle } from '@/lib/nhtsa'
import { getCachedDecode, setCachedDecode } from '@/lib/cache'

// Used by the "auto-fill from VIN" helper on the create-listing form.
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

    return NextResponse.json({ vin, decoded })
  } catch (err) {
    console.error('Decode error:', err)
    return NextResponse.json({ error: 'Lookup failed. Please try again.' }, { status: 500 })
  }
}
