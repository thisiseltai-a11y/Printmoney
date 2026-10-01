import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
            WorthCars lets sellers list a vehicle with an asking price and a minimum offer, and lets signed-in
            buyers submit offers, negotiate, and get notified when the seller responds. WorthCars is not a party to
            any resulting sale — it&apos;s between the buyer and seller to agree final terms, inspect the vehicle,
            and complete the transaction (title transfer, payment, etc.) themselves.
          </Section>
          <Section title="No warranty on listings">
            Sellers are solely responsible for the accuracy of their listing. WorthCars doesn&apos;t inspect
            vehicles or verify listing details.
          </Section>
          <Section title="Offers are not binding contracts">
            An accepted offer on WorthCars indicates mutual interest at a price — it is not itself a binding sale
            contract. Buyers and sellers are responsible for completing the sale through their own legal process.
          </Section>
          <Section title="Acceptable use">
            Don&apos;t submit offers you don&apos;t intend to honor, post listings for vehicles you don&apos;t have
            the right to sell, or try to circumvent a seller&apos;s stated minimum offer.
          </Section>
          <Section title="Contact">Questions? Reach us at support@worthcars.com.</Section>
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
