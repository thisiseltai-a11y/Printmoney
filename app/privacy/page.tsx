import Link from 'next/link'
import { Rocket } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — ResumeRocket',
  description: 'How ResumeRocket collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">ResumeRocket</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: April 21, 2025</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>When you use ResumeRocket, we collect the following information:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Your name and email address (when provided for delivery)</li>
              <li>Job description and resume details you paste into our form</li>
              <li>Payment information — processed securely by Stripe; we never store card details</li>
              <li>Usage data (pages visited, time on site) via standard server logs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Generate your AI-powered resume and cover letter</li>
              <li>Deliver your documents by email if requested</li>
              <li>Process your payment through Stripe</li>
              <li>Improve our AI models and product quality</li>
              <li>Send transactional emails (receipt, document delivery)</li>
            </ul>
            <p className="mt-3">We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Data Retention</h2>
            <p>Resume and job description data submitted to our generation tool is used to produce your output and is not retained on our servers beyond the duration of your session. Email addresses are retained only if you opt in to receive your documents by email.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li><strong className="text-slate-300">Anthropic</strong> — AI model provider for resume generation</li>
              <li><strong className="text-slate-300">Stripe</strong> — Payment processing</li>
              <li><strong className="text-slate-300">Resend</strong> — Transactional email delivery</li>
              <li><strong className="text-slate-300">Vercel</strong> — Hosting and infrastructure</li>
            </ul>
            <p className="mt-3">Each of these services has its own privacy policy governing how they handle data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Cookies</h2>
            <p>We use only essential cookies required to operate the service (e.g., session state). We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Your Rights</h2>
            <p>You have the right to request deletion of any personal data we hold about you. To submit a request, email us at <a href="mailto:privacy@resumerocket.co" className="text-indigo-400 hover:text-indigo-300">privacy@resumerocket.co</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Changes to This Policy</h2>
            <p>We may update this policy from time to time. Changes will be posted on this page with an updated date. Continued use of the service constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Contact</h2>
            <p>Questions about this policy? Email <a href="mailto:privacy@resumerocket.co" className="text-indigo-400 hover:text-indigo-300">privacy@resumerocket.co</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">← Back to ResumeRocket</Link>
        </div>
      </main>
    </div>
  )
}
