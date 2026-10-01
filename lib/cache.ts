import { getSupabase } from './supabase'

function dbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// ─── VIN decode cache ──────────────────────────────────────────────────
// Used by the "auto-fill from VIN" helper on the create-listing form.
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
