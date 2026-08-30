import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Own The Marque',
  description: 'How Own The Marque collects, uses, and protects your personal information.',
}

export default function PrivacyPolicy() {
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
        <h1 className="display display-lg">Privacy Policy</h1>
        <p className="legal-meta">Effective date: January 1, 2026 · Last updated: January 1, 2026</p>

        <div className="legal-body">
          <section className="legal-section">
            <h2>Who we are</h2>
            <p>Own The Marque (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a specialist search service for exotic and classic cars, operating at ownthemarque.com. We are based in South Florida. You can reach us at <a href="mailto:hello@ownthemarque.com">hello@ownthemarque.com</a>.</p>
          </section>

          <section className="legal-section">
            <h2>What information we collect</h2>
            <p>When you submit a search request through our intake form, we collect:</p>
            <ul>
              <li>Your name</li>
              <li>Your email address</li>
              <li>Your phone number (optional)</li>
              <li>Details about the car you&apos;re looking for (make, model, year, specification)</li>
              <li>Your stated budget range</li>
              <li>Your intended payment method</li>
              <li>Your search timeline</li>
            </ul>
            <p>We do not collect payment card information. We do not use cookies for tracking or advertising.</p>
          </section>

          <section className="legal-section">
            <h2>How we use your information</h2>
            <p>We use the information you provide solely to:</p>
            <ul>
              <li>Respond to your search enquiry</li>
              <li>Contact you about cars we find that match your specification</li>
              <li>Coordinate the search process and any third-party inspections on your behalf</li>
            </ul>
            <p>We do not sell, rent, share, or disclose your personal information to any third party for marketing purposes. We do not add you to any mailing list without your consent.</p>
          </section>

          <section className="legal-section">
            <h2>How long we keep your data</h2>
            <p>We retain your enquiry information for as long as your search is active and for a reasonable period afterward for record-keeping. If you would like your information deleted, email us at <a href="mailto:hello@ownthemarque.com">hello@ownthemarque.com</a> and we will remove it promptly.</p>
          </section>

          <section className="legal-section">
            <h2>How we protect your information</h2>
            <p>Enquiries submitted through this site are handled directly by us — there is no third-party CRM or marketing platform storing your data. We treat every enquiry with the same discretion we apply to the search itself.</p>
          </section>

          <section className="legal-section">
            <h2>Third-party services</h2>
            <p>This site is hosted on Vercel. Vercel may log standard server request information (IP address, browser type, request time) as part of normal hosting operations. We do not use Google Analytics, Meta Pixel, or any other third-party tracking.</p>
          </section>

          <section className="legal-section">
            <h2>Your rights</h2>
            <p>You may request access to, correction of, or deletion of any personal information we hold about you at any time. To do so, email <a href="mailto:hello@ownthemarque.com">hello@ownthemarque.com</a>. We will respond within a reasonable timeframe.</p>
          </section>

          <section className="legal-section">
            <h2>Changes to this policy</h2>
            <p>If we make material changes to this policy, we will update the effective date above. We encourage you to review this page periodically.</p>
          </section>

          <section className="legal-section">
            <h2>Contact</h2>
            <p>Questions about this policy? Email us at <a href="mailto:hello@ownthemarque.com">hello@ownthemarque.com</a>.</p>
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
