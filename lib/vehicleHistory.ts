// Paid vehicle history report adapter.
//
// Primary provider: VinAudit Vehicle History API — an NMVTIS-approved data
// provider (www.vinaudit.com/vehicle-history-report-api). Carfax data itself
// cannot be scraped or resold; VinAudit (or another NMVTIS-approved provider
// such as VINData) is a properly licensed source for title/theft/accident
// records. Confirm the live request/response shape in the VinAudit API
// console once VINAUDIT_HISTORY_KEY is issued — this is the one function to
// update if the wire format differs from what's stubbed below.

export interface HistoryReport {
  accidentCount: number
  accidents: { date: string; description: string; severity: string }[]
  titleStatus: string
  ownerCount: number
  serviceRecords: { date: string; description: string; mileage: number }[]
  source: 'vinaudit' | 'demo'
}

export async function getHistoryReport(vin: string): Promise<HistoryReport> {
  const apiKey = process.env.VINAUDIT_HISTORY_KEY

  if (apiKey) {
    const url = new URL('https://api.vinaudit.com/v2/history')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('vin', vin)
    url.searchParams.set('format', 'json')

    const res = await fetch(url.toString(), { next: { revalidate: 0 } })
    if (res.ok) {
      const data = await res.json()
      if (data?.success !== false) {
        return normalizeVinAuditHistory(data)
      }
    }
    throw new Error('Vehicle history provider did not return a usable report.')
  }

  // No live key configured — this must never ship to a paying customer in
  // production. In that case, generating a report should fail loudly rather
  // than fabricate accident/title data. Demo mode is only for local dev.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Vehicle history provider is not configured.')
  }
  return demoHistory(vin)
}

function normalizeVinAuditHistory(data: any): HistoryReport {
  const records = data?.records ?? {}
  return {
    accidentCount: records.accidents?.length ?? 0,
    accidents: (records.accidents ?? []).map((a: any) => ({
      date: a.date ?? 'Unknown',
      description: a.description ?? 'Accident reported',
      severity: a.severity ?? 'Unknown',
    })),
    titleStatus: records.title?.status ?? 'Clean',
    ownerCount: records.ownership?.count ?? 1,
    serviceRecords: (records.service ?? []).map((s: any) => ({
      date: s.date ?? 'Unknown',
      description: s.description ?? 'Service record',
      mileage: s.mileage ?? 0,
    })),
    source: 'vinaudit',
  }
}

function demoHistory(vin: string): HistoryReport {
  // Deterministic pseudo-data seeded off the VIN so the same VIN always
  // renders the same demo report during local development.
  const seed = vin.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hasAccident = seed % 3 === 0

  return {
    accidentCount: hasAccident ? 1 : 0,
    accidents: hasAccident
      ? [{ date: '2022-08-14', description: 'Minor rear-end collision, reported to insurance', severity: 'Minor' }]
      : [],
    titleStatus: seed % 11 === 0 ? 'Salvage' : 'Clean',
    ownerCount: (seed % 3) + 1,
    serviceRecords: [
      { date: '2024-02-10', description: 'Oil change, tire rotation', mileage: (seed % 50) * 1000 + 12000 },
      { date: '2023-05-02', description: 'Brake pad replacement', mileage: (seed % 50) * 1000 + 4000 },
    ],
    source: 'demo',
  }
}
