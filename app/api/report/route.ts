import { NextRequest, NextResponse } from 'next/server'
import { validateVin } from '@/lib/vin'
import { getReport } from '@/lib/db'

export async function GET(req: NextRequest) {
  const rawVin = req.nextUrl.searchParams.get('vin') ?? ''
  const email = req.nextUrl.searchParams.get('email') ?? ''

  const { valid, vin, reason } = validateVin(rawVin)
  if (!valid) return NextResponse.json({ error: reason }, { status: 400 })
  if (!email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }

  const report = await getReport(vin, email)
  if (!report) {
    return NextResponse.json({ error: 'No report found for that VIN + email.' }, { status: 404 })
  }
  return NextResponse.json({ report })
}
