import { getSupabase } from './supabase'

function dbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// ─── VIN decode cache ──────────────────────────────────────────────────
// Decoded vehicle attributes (year/make/model/trim/engine) don't change, so
// once a VIN is decoded it's cached indefinitely — no TTL needed. This
// doesn't save money (NHTSA's decode API is free) but does cut latency and
// load on repeat lookups of the same VIN.

export async function getCachedDecode<T>(vin: string): Promise<T | null> {
  if (!dbConfigured()) return null
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from('decode_cache').select('payload').eq('vin', vin).maybeSingle()
    return (data?.payload as T) ?? null
  } catch (err) {
    console.error('getCachedDecode failed:', err)
    return null
  }
}

export async function setCachedDecode(vin: string, payload: unknown) {
  if (!dbConfigured()) return
  try {
    const supabase = getSupabase()
    await supabase.from('decode_cache').upsert({ vin, payload }, { onConflict: 'vin' })
  } catch (err) {
    console.error('setCachedDecode failed:', err)
  }
}

// ─── Valuation cache ───────────────────────────────────────────────────
// Keyed by VIN + mileage rounded to the nearest 1,000 miles, so a visitor
// re-checking the same car (or checking it again a few minutes later)
// reuses the cached result instead of triggering another paid valuation
// API call. 24h TTL keeps numbers from going stale for long-lived cache
// entries while still absorbing the vast majority of repeat-lookup traffic.

const VALUATION_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export function mileageBucket(mileage: number): number {
  return Math.round(mileage / 1000) * 1000
}

export async function getCachedValuation<T>(vin: string, mileage: number): Promise<T | null> {
  if (!dbConfigured()) return null
  try {
    const supabase = getSupabase()
    const { data } = await supabase
      .from('valuation_cache')
      .select('payload, created_at')
      .eq('vin', vin)
      .eq('mileage_bucket', mileageBucket(mileage))
      .maybeSingle()
    if (!data) return null
    const age = Date.now() - new Date(data.created_at).getTime()
    if (age > VALUATION_CACHE_TTL_MS) return null
    return data.payload as T
  } catch (err) {
    console.error('getCachedValuation failed:', err)
    return null
  }
}

export async function setCachedValuation(vin: string, mileage: number, payload: unknown) {
  if (!dbConfigured()) return
  try {
    const supabase = getSupabase()
    await supabase.from('valuation_cache').upsert(
      { vin, mileage_bucket: mileageBucket(mileage), payload, created_at: new Date().toISOString() },
      { onConflict: 'vin,mileage_bucket' }
    )
  } catch (err) {
    console.error('setCachedValuation failed:', err)
  }
}
