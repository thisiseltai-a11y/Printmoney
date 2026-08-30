import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Own The Marque',
  description: 'Terms governing Own The Marque\'s specialist car search and introduction service.',
}

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link href="/" className="wordmark">
          <span className="wordmark-badge" aria-hidden="true">OTM</span>
          Own The Marque
        </Link>
      </header>

      <main className="legal-main">
        <p className="eyebrow">Legal</p>
        <div className="rule"></div>
        <h1 className="display display-lg">Terms of Service</h1>
        <p className="legal-meta">Effective date: January 1, 2026 · Last updated: January 1, 2026</p>

        <div className="legal-body">
          <section className="legal-section">
            <h2>What Own The Marque does</h2>
            <p>Own The Marque is a specialist search and introduction service for exotic and classic cars. We locate vehicles matching your specification through our network of dealers, auction contacts, private sellers, and collector clubs, and we introduce you to the seller when a suitable match is found.</p>
            <p>We are not a dealership, broker, or licensed vehicle dealer. We do not purchase cars on your behalf, hold title to any vehicle, or act as your legal representative in any transaction. You negotiate and close directly with the seller.</p>
          </section>

          <section className="legal-section">
            <h2>Our fee</h2>
            <p>Our finder&apos;s fee is 5% of the final vehicle sale price. This fee becomes due when:</p>
            <ul>
              <li>We introduce you to a seller (or identify a specific vehicle for you), and</li>
              <li>You subsequently purchase that vehicle from that seller</li>
            </ul>
            <p>No fee is due if we do not find a car that results in a purchase. We do not charge retainers, search fees, or consultation fees.</p>
            <p>If you are introduced to a vehicle through us and purchase it through a different route (e.g., directly approaching the seller after our introduction), the finder&apos;s fee still applies.</p>
          </section>

          <section className="legal-section">
            <h2>What we do not guarantee</h2>
            <p>Submitting a search request does not guarantee that we will find the car you are looking for. The availability of specific exotic and classic vehicles is inherently limited, and results depend on what is available in the market at the time of your search.</p>
            <p>We do not guarantee any particular search timeline. We will communicate honestly about what we find and the progress of the search.</p>
          </section>

          <section className="legal-section">
            <h2>Inspections and due diligence</h2>
            <p>Where we coordinate a third party inspection, the inspection is conducted by an independent specialist. We are not responsible for the findings, conclusions, or accuracy of any third party inspection report. You are responsible for conducting your own due diligence, including any independent inspection, title search, and legal review, before purchasing any vehicle.</p>
            <p>Purchasing a vehicle is your decision. We provide information and introductions; we do not advise on whether a specific purchase is the right financial or personal decision for you.</p>
          </section>

          <section className="legal-section">
            <h2>Your responsibilities</h2>
            <p>By submitting a search request, you represent that:</p>
            <ul>
              <li>You are at least 18 years old</li>
              <li>The information you provide is accurate and in good faith</li>
              <li>You will notify us promptly if your requirements or budget change significantly</li>
              <li>You will not approach any seller we introduce to you through a separate channel to avoid the finder&apos;s fee</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Confidentiality</h2>
            <p>We treat all search enquiries with strict confidentiality. In turn, we ask that any seller introductions we make, including seller identity and vehicle details prior to your purchase, are treated as confidential and not shared with third parties.</p>
          </section>

          <section className="legal-section">
            <h2>Limitation of liability</h2>
            <p>Own The Marque&apos;s liability in connection with any search engagement is limited to the amount of the finder&apos;s fee paid. We are not liable for any loss arising from your decision to purchase or not purchase a vehicle, the condition of any vehicle, or the conduct of any seller we introduce.</p>
          </section>

          <section className="legal-section">
            <h2>Governing law</h2>
            <p>These terms are governed by the laws of the State of Florida. Any disputes shall be resolved in the courts of Miami-Dade County, Florida.</p>
          </section>

          <section className="legal-section">
            <h2>Changes to these terms</h2>
            <p>We may update these terms from time to time. The effective date above will be updated accordingly. Your continued use of this site after an update constitutes acceptance of the revised terms.</p>
          </section>

          <section className="legal-section">
            <h2>Contact</h2>
            <p>Questions about these terms? Email <a href="mailto:hello@ownthemarque.com">hello@ownthemarque.com</a>.</p>
          </section>
        </div>

        <div className="legal-back">
          <Link href="/" className="btn-ghost">← Back to ownthemarque.com</Link>
        </div>
      </main>

      <footer className="legal-footer">
        <p>© 2026 Own The Marque · <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a></p>
      </footer>

      <style>{`
        .legal-page {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
        }
        .legal-header {
          padding: 24px clamp(24px, 5vw, 80px);
          border-bottom: 1px solid var(--border);
        }
        .legal-main {
          flex: 1;
          max-width: 720px;
          margin: 0 auto;
          padding: clamp(48px, 8vw, 96px) clamp(24px, 5vw, 48px);
          width: 100%;
        }
        .legal-meta {
          font-size: 13px;
          color: var(--text-3);
          margin-top: 8px;
          margin-bottom: 48px;
          max-width: none;
        }
        .legal-body {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .legal-section h2 {
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 12px;
          letter-spacing: 0.01em;
        }
        .legal-section p {
          font-size: 15px;
          line-height: 1.8;
          color: var(--text-2);
          max-width: none;
          margin-bottom: 12px;
        }
        .legal-section p:last-child { margin-bottom: 0; }
        .legal-section ul {
          margin: 10px 0 12px 0;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .legal-section ul li {
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-2);
        }
        .legal-section a {
          color: var(--gold);
          text-decoration: underline;
          text-decoration-color: var(--gold-dim);
          text-underline-offset: 3px;
        }
        .legal-back { margin-top: 56px; padding-top: 32px; border-top: 1px solid var(--border); }
        .legal-footer {
          padding: 28px clamp(24px, 5vw, 80px);
          border-top: 1px solid var(--border);
          font-size: 12px;
          color: var(--text-3);
        }
        .legal-footer a { color: var(--text-3); }
        .legal-footer a:hover { color: var(--text); }
      `}</style>
    </div>
  )
}
