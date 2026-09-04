import { getSupabase } from './supabase'

function dbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_FREE_LOOKUPS_PER_IP = 20 // generous for a real shopper, tight enough to blunt scripted abuse

export function getClientIp(req: Request): string | null {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip')
}

// Counts this IP's free lookups (decode + valuation both log to the same
// `lookups` row per VIN check — see attachValuationToLookup) in the
// trailing hour. Fails OPEN — if the DB isn't configured or the check
// itself errors, the request is allowed rather than blocking a real visitor
// because of a rate-limiter outage.
export async function isRateLimited(ip: string | null): Promise<boolean> {
  if (!ip || !dbConfigured()) return false
  try {
    const supabase = getSupabase()
    const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()
    const { count } = await supabase
      .from('lookups')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .eq('type', 'free')
      .gte('created_at', windowStart)
    return (count ?? 0) >= MAX_FREE_LOOKUPS_PER_IP
  } catch (err) {
    console.error('isRateLimited check failed:', err)
    return false
  }
}
