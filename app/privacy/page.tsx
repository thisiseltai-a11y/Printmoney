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
          <Section title="Accounts">
            Making or receiving offers requires an account (email and password). We store your email, display name,
            listings, offers, and the messages/notifications tied to your activity on the platform.
          </Section>
          <Section title="Listings and offers">
            Listing details and photos you post are visible to anyone browsing the site. Offer amounts and
            negotiation history are visible only to the buyer and seller involved.
          </Section>
          <Section title="VIN decoding">
            If you enter a VIN while creating a listing, the vehicle attributes (year/make/model/trim/engine) come
            from the NHTSA vPIC API, a public federal service. We don&apos;t share your VIN with anyone else.
          </Section>
          <Section title="Data retention">
            Account, listing, and offer data is retained to operate the service. Contact us to request deletion of
            your account and associated data.
          </Section>
          <Section title="Contact">Questions about this policy? Reach us at privacy@worthcars.com.</Section>
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
