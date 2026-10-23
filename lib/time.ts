export const OFFER_RESPONSE_WINDOW_HOURS = 48

export function offerDeadline(): string {
  return new Date(Date.now() + OFFER_RESPONSE_WINDOW_HOURS * 60 * 60 * 1000).toISOString()
}

export function isPastDeadline(expiresAt: string | null): boolean {
  return !!expiresAt && new Date(expiresAt).getTime() <= Date.now()
}

// A short "time left" label for a pending offer, or null once past the
// deadline (the caller should be showing an "Expired" state by then instead).
export function formatTimeRemaining(expiresAt: string | null): string | null {
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return null
  const hours = Math.ceil(ms / (60 * 60 * 1000))
  if (hours >= 24) return `Expires in ${Math.ceil(hours / 24)}d`
  return `Expires in ${hours}h`
}
