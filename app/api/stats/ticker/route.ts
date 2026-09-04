import { NextResponse } from 'next/server'
import { getTickerStats } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const stats = await getTickerStats()
  return NextResponse.json(stats)
}
