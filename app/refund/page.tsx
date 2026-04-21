import Link from 'next/link'
import { Rocket, Shield } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy — ResumeRocket',
  description: '100% money-back guarantee. Not happy with your resume? We\'ll refund every penny.',
}

export default function RefundPage() {
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white">Refund Policy</h1>
          </div>
        </div>
        <p className="text-slate-500 text-sm mb-10">Last updated: April 21, 2025</p>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-10">
          <p className="text-emerald-300 font-semibold text-base">100% Money-Back Guarantee</p>
          <p className="text-emerald-400/80 text-sm mt-1">If you're not completely satisfied with your resume, we'll refund every penny. No questions asked.</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">How to Request a Refund</h2>
            <p>Email us at <a href="mailto:support@resumerocket.co" className="text-indigo-400 hover:text-indigo-300">support@resumerocket.co</a> within <strong className="text-white">7 days</strong> of your purchase with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>The email address used at checkout</li>
              <li>Your order date or Stripe receipt number (if available)</li>
              <li>A brief note on what wasn't satisfactory (optional — helps us improve)</li>
            </ul>
            <p className="mt-3">We'll process your refund within 1–3 business days. Refunds are returned to your original payment method.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Eligibility</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>One-time purchases (Single and Bundle plans): refund within 7 days of purchase</li>
              <li>Monthly Unlimited subscriptions: refund within 7 days of the most recent charge; cancel anytime to stop future charges</li>
              <li>No limit on reason — if you're not happy, you get your money back</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Cancellations</h2>
            <p>For monthly subscribers, you can cancel at any time from your billing portal. Cancellation stops future charges immediately. No partial refunds are issued for unused days in a billing period unless requested within the 7-day window above.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
            <p>Refund requests: <a href="mailto:support@resumerocket.co" className="text-indigo-400 hover:text-indigo-300">support@resumerocket.co</a></p>
            <p className="mt-1 text-slate-500">We typically respond within 24 hours on business days.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">← Back to ResumeRocket</Link>
        </div>
      </main>
    </div>
  )
}
