import Link from 'next/link'
import { Rocket } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — ResumeRocket',
  description: 'Terms and conditions for using the ResumeRocket AI resume generation service.',
}

export default function TermsPage() {
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
        <h1 className="text-4xl font-extrabold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: April 21, 2025</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using ResumeRocket ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p>ResumeRocket is an AI-powered tool that generates resumes, cover letters, and LinkedIn summaries tailored to job descriptions provided by users. Documents are generated using large language models and are intended as a starting point — you are responsible for reviewing and verifying all content before submitting applications.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Payments</h2>
            <p>All purchases are one-time payments unless you subscribe to a monthly plan. Payments are processed by Stripe. By completing a purchase, you authorize the charge to your payment method. All prices are in USD.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Refund Policy</h2>
            <p>We offer a 100% money-back guarantee. If you are not satisfied with your generated documents, contact us at <a href="mailto:support@resumerocket.co" className="text-indigo-400 hover:text-indigo-300">support@resumerocket.co</a> within 7 days of purchase for a full refund. See our <Link href="/refund" className="text-indigo-400 hover:text-indigo-300">Refund Policy</Link> for full details.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Use the Service to generate false or misleading information for fraudulent purposes</li>
              <li>Resell or redistribute outputs without permission</li>
              <li>Attempt to reverse-engineer or scrape the Service</li>
              <li>Use the Service in violation of any applicable law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Intellectual Property</h2>
            <p>You own the output documents generated for you. ResumeRocket retains ownership of the platform, prompts, and underlying technology. By submitting content, you grant us a limited license to process it for the purpose of generating your documents.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is." We do not guarantee that AI-generated resumes will result in interviews or employment. Results vary by individual, role, and employer. We are not responsible for hiring decisions made by third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, ResumeRocket's total liability to you for any claim arising from use of the Service shall not exceed the amount you paid for the specific transaction giving rise to the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the Service after changes constitutes acceptance. We will post the updated date at the top of this page.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
            <p>Questions? Email <a href="mailto:support@resumerocket.co" className="text-indigo-400 hover:text-indigo-300">support@resumerocket.co</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">← Back to ResumeRocket</Link>
        </div>
      </main>
    </div>
  )
}
