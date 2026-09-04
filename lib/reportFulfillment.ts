import { getReport, saveReport, logLookup } from './db'
import { getHistoryReport, type HistoryReport } from './vehicleHistory'

// Idempotent: called from both the success-page verification and the Stripe
// webhook, whichever fires first wins and the other becomes a no-op read.
export async function fulfillReport(vin: string, email: string, stripeSessionId?: string): Promise<HistoryReport> {
  const existing = await getReport(vin, email)
  if (existing) return existing

  // Only ever called from here — after Stripe confirms payment_status ===
  // 'paid' (see /api/checkout/verify and /api/stripe/webhook). The paid
  // history API is never pre-fetched or called speculatively.
  const report = await getHistoryReport(vin)
  await saveReport({ vin, email, stripeSessionId, report })
  await logLookup(vin, 'paid')
  return report
}
