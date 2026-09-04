import { NextRequest, NextResponse } from 'next/server'
import { validateVin } from '@/lib/vin'
import { decodeVin } from '@/lib/nhtsa'
import { logLookup } from '@/lib/db'

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

    const decoded = await decodeVin(vin)
    if (decoded.errorCode && decoded.errorCode !== '0') {
      return NextResponse.json(
        { error: decoded.errorText || 'Could not decode this VIN.' },
        { status: 422 }
      )
    }

    await logLookup(vin, 'free')

    return NextResponse.json({ vin, decoded })
  } catch (err) {
    console.error('Decode error:', err)
    return NextResponse.json({ error: 'Decode failed. Please try again.' }, { status: 500 })
  }
}
