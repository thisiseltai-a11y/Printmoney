import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { REPORT_PRICE_DISPLAY } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms of Service — WorthCars',
  description: 'Terms governing use of WorthCars.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-16 text-muted">
        <h1 className="font-grotesk text-3xl font-semibold text-ink">Terms of Service</h1>
        <p className="mt-2 font-mono text-xs text-muted">Last updated {new Date().toLocaleDateString()}</p>

        <div className="mt-8 space-y-6 leading-relaxed">
          <Section title="The service">
            WorthCars provides a free VIN lookup and estimated market value for any vehicle, plus an optional paid
            full history report ({REPORT_PRICE_DISPLAY}, one-time, non-recurring) covering accident history, title
            status, ownership, and service records where available.
          </Section>
          <Section title="No warranty on estimates">
            Value estimates are statistical approximations based on comparable market data and are not an
            appraisal. Actual sale prices vary with condition, location, and market timing. History reports
            reflect only what has been reported to our data provider and may not capture every incident.
          </Section>
          <Section title="Payments">
            Full history reports are billed once via Stripe at the price shown at checkout. There are no
            subscriptions. Reports are non-refundable once generated, except where required by law.
          </Section>
          <Section title="Acceptable use">
            Don&apos;t use WorthCars to scrape, resell, or bulk-harvest vehicle data, or to circumvent the payment
            required for the full history report.
          </Section>
          <Section title="Contact">
            Questions? Reach us at support@worthcars.com.
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-grotesk text-lg font-semibold text-ink">{title}</h2>
      <p>{children}</p>
    </section>
  )
}
