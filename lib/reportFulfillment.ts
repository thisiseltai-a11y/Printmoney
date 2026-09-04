import { getReport, saveReport, logLookup } from './db'
import { getHistoryReport, type HistoryReport } from './vehicleHistory'

// Idempotent: called from both the success-page verification and the Stripe
// webhook, whichever fires first wins and the other becomes a no-op read.
export async function fulfillReport(vin: string, email: string, stripeSessionId?: string): Promise<HistoryReport> {
  const existing = await getReport(vin, email)
  if (existing) return existing

  const report = await getHistoryReport(vin)
  await saveReport({ vin, email, stripeSessionId, report })
  await logLookup(vin, 'paid')
  return report
}
