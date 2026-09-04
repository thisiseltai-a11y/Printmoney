import { getSupabase } from './supabase'
import { REPORT_PRICE_CENTS } from './constants'
import type { HistoryReport } from './vehicleHistory'

function dbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function logLookup(vin: string, type: 'free' | 'paid', estimatedValue?: number) {
  if (!dbConfigured()) return
  try {
    const supabase = getSupabase()
    await supabase.from('lookups').insert({
      vin,
      type,
      estimated_value: estimatedValue ?? null,
    })
  } catch (err) {
    console.error('logLookup failed:', err)
  }
}

export async function saveReport(input: {
  vin: string
  email: string
  stripeSessionId?: string
  report: HistoryReport
}) {
  if (!dbConfigured()) return
  const supabase = getSupabase()
  await supabase.from('reports').upsert(
    {
      vin: input.vin,
      email: input.email,
      stripe_session_id: input.stripeSessionId,
      amount_cents: REPORT_PRICE_CENTS,
      report_json: input.report,
    },
    { onConflict: 'vin,email' }
  )
}

export async function getReport(vin: string, email: string): Promise<HistoryReport | null> {
  if (!dbConfigured()) return null
  const supabase = getSupabase()
  const { data } = await supabase
    .from('reports')
    .select('report_json')
    .eq('vin', vin)
    .eq('email', email)
    .maybeSingle()
  return (data?.report_json as HistoryReport) ?? null
}

// Called once a mileage-based valuation completes for a VIN that was just
// decoded, so the ticker's value-trend math has a number to work with
// without inserting a second "lookup" row for the same visit.
export async function attachValuationToLookup(vin: string, estimatedValue: number) {
  if (!dbConfigured()) return
  try {
    const supabase = getSupabase()
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('lookups')
      .select('id')
      .eq('vin', vin)
      .eq('type', 'free')
      .is('estimated_value', null)
      .gte('created_at', tenMinAgo)
      .order('created_at', { ascending: false })
      .limit(1)

    if (data && data.length) {
      await supabase.from('lookups').update({ estimated_value: estimatedValue }).eq('id', data[0].id)
    } else {
      await supabase.from('lookups').insert({ vin, type: 'free', estimated_value: estimatedValue })
    }
  } catch (err) {
    console.error('attachValuationToLookup failed:', err)
  }
}

export interface TickerStats {
  lookupsLastHour: number
  reportsUnlockedToday: number
  valueTrend: 'up' | 'down'
  valueTrendPct: number
  live: boolean
}

// Seed numbers keep the strip feeling alive before there's real traffic.
// Once real counts clear these floors, the real numbers take over on their own.
const SEED_LOOKUPS_PER_HOUR = 40
const SEED_REPORTS_PER_DAY = 12
const SEED_TREND_PCT = 2.4

export async function getTickerStats(): Promise<TickerStats> {
  if (!dbConfigured()) {
    return {
      lookupsLastHour: SEED_LOOKUPS_PER_HOUR,
      reportsUnlockedToday: SEED_REPORTS_PER_DAY,
      valueTrend: 'up',
      valueTrendPct: SEED_TREND_PCT,
      live: false,
    }
  }

  try {
    const supabase = getSupabase()
    const now = Date.now()
    const hourAgo = new Date(now - 60 * 60 * 1000).toISOString()
    const dayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString()

    const [{ count: lastHourCount }, { count: unlockedTodayCount }, thisWeekVals, lastWeekVals] =
      await Promise.all([
        supabase.from('lookups').select('id', { count: 'exact', head: true }).gte('created_at', hourAgo),
        supabase
          .from('lookups')
          .select('id', { count: 'exact', head: true })
          .eq('type', 'paid')
          .gte('created_at', dayStart),
        supabase
          .from('lookups')
          .select('estimated_value')
          .not('estimated_value', 'is', null)
          .gte('created_at', weekAgo),
        supabase
          .from('lookups')
          .select('estimated_value')
          .not('estimated_value', 'is', null)
          .gte('created_at', twoWeeksAgo)
          .lt('created_at', weekAgo),
      ])

    const avg = (rows: { estimated_value: number | null }[] | null) => {
      const vals = (rows ?? []).map((r) => r.estimated_value).filter((v): v is number => v != null)
      if (!vals.length) return null
      return vals.reduce((a, b) => a + b, 0) / vals.length
    }

    const thisWeekAvg = avg(thisWeekVals.data)
    const lastWeekAvg = avg(lastWeekVals.data)

    let valueTrend: 'up' | 'down' = 'up'
    let valueTrendPct = SEED_TREND_PCT
    if (thisWeekAvg != null && lastWeekAvg != null && lastWeekAvg > 0) {
      const pct = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100
      valueTrend = pct >= 0 ? 'up' : 'down'
      valueTrendPct = Math.round(Math.abs(pct) * 10) / 10
    }

    return {
      lookupsLastHour: Math.max(lastHourCount ?? 0, SEED_LOOKUPS_PER_HOUR),
      reportsUnlockedToday: Math.max(unlockedTodayCount ?? 0, SEED_REPORTS_PER_DAY),
      valueTrend,
      valueTrendPct,
      live: (lastHourCount ?? 0) > 0,
    }
  } catch (err) {
    console.error('getTickerStats failed:', err)
    return {
      lookupsLastHour: SEED_LOOKUPS_PER_HOUR,
      reportsUnlockedToday: SEED_REPORTS_PER_DAY,
      valueTrend: 'up',
      valueTrendPct: SEED_TREND_PCT,
      live: false,
    }
  }
}

export interface AdminStats {
  totalLookups: number
  totalFree: number
  totalPaid: number
  totalRevenueCents: number
  recent: { vin: string; type: string; created_at: string }[]
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!dbConfigured()) {
    return { totalLookups: 0, totalFree: 0, totalPaid: 0, totalRevenueCents: 0, recent: [] }
  }
  const supabase = getSupabase()
  const [{ count: totalLookups }, { count: totalFree }, { count: totalPaid }, { data: reports }, { data: recent }] =
    await Promise.all([
      supabase.from('lookups').select('id', { count: 'exact', head: true }),
      supabase.from('lookups').select('id', { count: 'exact', head: true }).eq('type', 'free'),
      supabase.from('lookups').select('id', { count: 'exact', head: true }).eq('type', 'paid'),
      supabase.from('reports').select('amount_cents'),
      supabase.from('lookups').select('vin, type, created_at').order('created_at', { ascending: false }).limit(25),
    ])

  const totalRevenueCents = (reports ?? []).reduce((sum, r) => sum + (r.amount_cents ?? 0), 0)

  return {
    totalLookups: totalLookups ?? 0,
    totalFree: totalFree ?? 0,
    totalPaid: totalPaid ?? 0,
    totalRevenueCents,
    recent: recent ?? [],
  }
}
