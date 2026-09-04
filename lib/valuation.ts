// Market value estimate adapter.
//
// Primary provider: VinAudit Market Value API (data.vinaudit.com/market-values-api).
// NOTE: the exact query params / response field names below are based on VinAudit's
// publicly documented pattern (key + vin + mileage + format=json, returning low/
// average/high figures). Confirm the live request/response shape in the VinAudit
// API console once VINAUDIT_MARKET_VALUE_KEY is issued — this is the one function
// to update if anything differs. Everything else in the app only depends on the
// ValuationResult shape below, so a provider swap (e.g. MarketCheck) is a
// same-file change.

export interface ValuationResult {
  low: number
  estimate: number
  high: number
  source: 'vinaudit' | 'demo'
}

export async function getValuation(params: {
  vin: string
  year: string
  make: string
  model: string
  trim?: string
  mileage: number
}): Promise<ValuationResult> {
  const apiKey = process.env.VINAUDIT_MARKET_VALUE_KEY

  if (apiKey) {
    const url = new URL('https://marketvalues.vinaudit.com/getmarketvalue.php')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('vin', params.vin)
    if (params.mileage) url.searchParams.set('mileage', String(params.mileage))
    url.searchParams.set('format', 'json')

    const res = await fetch(url.toString(), { next: { revalidate: 0 } })
    if (res.ok) {
      const data = await res.json()
      const prices = data?.prices
      if (prices?.average) {
        return {
          low: Math.round(Number(prices.below ?? prices.average * 0.9)),
          estimate: Math.round(Number(prices.average)),
          high: Math.round(Number(prices.above ?? prices.average * 1.1)),
          source: 'vinaudit',
        }
      }
    }
    // Fall through to the demo estimate if the provider call didn't return
    // usable data, so the "instant" flow never dead-ends.
  }

  return demoValuation(params)
}

// Deterministic placeholder so the app is fully demo-able without a live data
// key. Never presented as real market data outside clearly-labeled demo mode —
// see the `source: 'demo'` flag consumed by the UI.
function demoValuation(params: {
  year: string
  make: string
  model: string
  mileage: number
}): ValuationResult {
  const year = parseInt(params.year, 10) || new Date().getFullYear() - 5
  const age = Math.max(0, new Date().getFullYear() - year)

  let base = 32000 - age * 1800
  base = Math.max(base, 3500)

  const mileagePenalty = Math.min(params.mileage, 220000) * 0.045
  const estimate = Math.max(1500, Math.round(base - mileagePenalty))

  return {
    low: Math.round(estimate * 0.9),
    estimate,
    high: Math.round(estimate * 1.1),
    source: 'demo',
  }
}
