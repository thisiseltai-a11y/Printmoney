import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — NurseEdge',
  description: 'Terms and conditions for using the NurseEdge TEAS exam prep platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">NurseEdge</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: August 30, 2025</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using NurseEdge ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p>NurseEdge is an exam prep platform providing practice questions, study tools, and AI-powered explanations to help nursing students prepare for the ATI TEAS exam. Content is for educational purposes only and is not affiliated with ATI Testing or any official exam body.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Subscription &amp; Payments</h2>
            <p>NurseEdge operates on a monthly subscription basis. Your subscription begins after a 7-day free trial and renews automatically each month at the then-current rate. Payments are processed by Stripe. You may cancel at any time; your access continues through the end of the current billing period.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Refund Policy</h2>
            <p>If you are not satisfied with your subscription within the first 7 days of a paid period (after the free trial ends), contact us at <a href="mailto:support@nurseedge.co" className="text-blue-400 hover:text-blue-300">support@nurseedge.co</a> for a full refund. Refund requests after this window are evaluated on a case-by-case basis.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Share, redistribute, or resell access to NurseEdge content or your account</li>
              <li>Attempt to scrape, copy, or reproduce our question bank</li>
              <li>Use the Service in any way that violates applicable law</li>
              <li>Attempt to reverse-engineer or interfere with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Intellectual Property</h2>
            <p>All practice questions, explanations, and platform content are owned by NurseEdge. No content may be reproduced or distributed without written permission. The ATI TEAS name and related trademarks are owned by ATI Testing and are not affiliated with NurseEdge.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is." We do not guarantee that use of NurseEdge will result in passing any exam. Exam outcomes depend on individual preparation, test conditions, and many factors outside our control.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, NurseEdge's total liability to you for any claim arising from use of the Service shall not exceed the total subscription fees you paid in the three months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the Service after changes constitutes acceptance. We will post the updated date at the top of this page.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
            <p>Questions? Email <a href="mailto:support@nurseedge.co" className="text-blue-400 hover:text-blue-300">support@nurseedge.co</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">← Back to NurseEdge</Link>
        </div>
      </main>
    </div>
  )
}
