import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — WorthCars',
  description: 'How WorthCars collects, uses, and protects your information.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-16 text-muted">
        <h1 className="font-grotesk text-3xl font-semibold text-ink">Privacy Policy</h1>
        <p className="mt-2 font-mono text-xs text-muted">Last updated {new Date().toLocaleDateString()}</p>

        <div className="mt-8 space-y-6 leading-relaxed">
          <Section title="What we collect">
            Free VIN decodes and value estimates require no personal information — we log only the VIN, whether the
            lookup was free or paid, and a timestamp, to power the live activity stats and our own analytics.
            When you unlock a paid history report, we collect your email address so we can associate the report
            with your purchase and let you retrieve it again without paying twice.
          </Section>
          <Section title="Payments">
            Payments are processed by Stripe. We never see or store your card details — Stripe handles that
            directly and shares with us only the confirmation needed to unlock your report.
          </Section>
          <Section title="Third-party data providers">
            Vehicle decode data comes from the NHTSA vPIC API (a public federal service). Market value estimates
            and full history reports are sourced from a licensed vehicle data provider. We do not scrape or resell
            Carfax data.
          </Section>
          <Section title="Data retention">
            Lookup logs and purchased reports are retained to support the service (report retrieval, fraud
            prevention, and aggregate stats). Contact us to request deletion of your email and associated reports.
          </Section>
          <Section title="Contact">
            Questions about this policy? Reach us at privacy@worthcars.com.
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
