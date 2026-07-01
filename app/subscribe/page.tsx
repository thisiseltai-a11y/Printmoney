'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Check, Lock, Zap, Loader2 } from 'lucide-react'

const PLANS = {
  free: { name: 'Free', price: '$0', features: ['1 warning post/day', 'Basic Tier 1 picks', 'Bet tracker (5 bets)', 'Community access'] },
  premium: { name: 'Premium', price: '$9.99/mo', features: ['All picks — all tiers', 'All sports', 'Unlimited bet tracker', 'Copy-ready posts', 'Lineup alerts'] },
  vip: { name: 'VIP', price: '$24.99/mo', features: ['Everything in Premium', 'Props & player props', 'Live updates', 'Direct Telegram channel', 'Priority support'] },
}

function SubscribeForm() {
  const params = useSearchParams()
  const planKey = (params.get('plan') ?? 'free') as keyof typeof PLANS
  const plan = PLANS[planKey] ?? PLANS.free

  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    if (planKey === 'free') {
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      router.push('/dashboard')
      return
    }

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, email }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Plan badge */}
      <div className={`flex items-center justify-between p-4 rounded-xl border ${planKey !== 'free' ? 'bg-neon/5 border-neon/30' : 'bg-elevated border-dim'}`}>
        <div>
          <p className="text-xs text-white/40 mb-0.5">Selected Plan</p>
          <p className="font-black">{plan.name}</p>
        </div>
        <span className="font-mono font-black text-neon text-lg">{plan.price}</span>
      </div>

      {/* Features */}
      <ul className="space-y-2">
        {plan.features.map(f => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
            <Check className="w-4 h-4 text-neon flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <div className="border-t border-dim pt-4">
        <label className="block text-xs text-white/40 mb-1.5">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full bg-elevated border border-dim rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-neon/50 transition-colors"
        />
      </div>

      {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-neon text-black font-black text-base hover:bg-neon/90 transition-all hover:shadow-neon disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          : planKey === 'free'
            ? <><Zap className="w-4 h-4" /> Get Started Free</>
            : <><Lock className="w-4 h-4" /> Subscribe — {plan.price}</>
        }
      </button>

      {planKey !== 'free' && (
        <p className="text-center text-xs text-white/20">
          Secured by Stripe · Cancel anytime · No hidden fees
        </p>
      )}

      <p className="text-center text-xs text-white/20 pt-1">
        <a href="/pricing" className="hover:text-white/50 transition-colors">View all plans →</a>
      </p>
    </form>
  )
}

export default function SubscribePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark bg-grid flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/20 text-neon text-xs font-bold tracking-widest uppercase mb-4">
              <Zap className="w-3 h-3" />
              HeyParlay
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Join HeyParlay</h1>
            <p className="text-white/40 text-sm">AI-Powered Picks. Research Backed. No Cap.</p>
          </div>

          <div className="bg-card border border-dim rounded-2xl p-6">
            <Suspense fallback={<div className="py-8 text-center text-white/30 text-sm">Loading...</div>}>
              <SubscribeForm />
            </Suspense>
          </div>

          <p className="text-center text-xs text-white/20 mt-5">
            For entertainment purposes only · Must be 21+ · Please gamble responsibly
          </p>
        </div>
      </main>
    </>
  )
}
