'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Check, Lock, Zap, Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PLANS = {
  free: { name: 'Free', price: '$0', features: ['1 warning post/day', 'Basic Tier 1 picks', 'Bet tracker (5 bets)', 'Community access'] },
  premium: { name: 'Premium', price: '$9.99/mo', features: ['All picks — all tiers', 'All sports', 'Unlimited bet tracker', 'Copy-ready posts', 'Lineup alerts'] },
  vip: { name: 'VIP', price: '$24.99/mo', features: ['Everything in Premium', 'Props & player props', 'Live updates', 'Direct Telegram channel', 'Priority support'] },
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function SubscribeForm() {
  const params = useSearchParams()
  const planKey = (params.get('plan') ?? 'free') as keyof typeof PLANS
  const plan = PLANS[planKey] ?? PLANS.free

  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkEmail, setCheckEmail] = useState(false)

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (oauthError) {
      setError(oauthError.message)
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setCheckEmail(true)
      setLoading(false)
      return
    }

    if (planKey === 'free') {
      router.push('/dashboard')
      return
    }

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, email }),
      })
      const checkout = await res.json()
      if (checkout.url) {
        window.location.href = checkout.url
      } else {
        setError(checkout.error ?? 'Something went wrong.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (checkEmail) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="text-5xl">📬</div>
        <h3 className="font-black text-lg">Check your email</h3>
        <p className="text-sm text-white/50 leading-relaxed">
          We sent a confirmation link to{' '}
          <span className="text-white font-semibold">{email}</span>.
          Click it to activate your account and get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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

      <div className="border-t border-dim pt-4 space-y-3">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-gray-900 font-bold text-sm hover:bg-white/90 transition-all disabled:opacity-50"
        >
          {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-600" /> : <GoogleIcon />}
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-dim" />
          <span className="text-xs text-white/20">or</span>
          <div className="flex-1 h-px bg-dim" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
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

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full bg-elevated border border-dim rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 focus:outline-none focus:border-neon/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-4 rounded-xl bg-neon text-black font-black text-base hover:bg-neon/90 transition-all hover:shadow-neon disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
            : planKey === 'free'
              ? <><Zap className="w-4 h-4" /> Create Free Account</>
              : <><Lock className="w-4 h-4" /> Create Account — {plan.price}</>
          }
        </button>
      </form>

      <p className="text-center text-xs text-white/30">
        Already have an account?{' '}
        <a href="/login" className="text-neon hover:underline">Log in</a>
      </p>

      {planKey !== 'free' && (
        <p className="text-center text-xs text-white/20">
          Secured by Stripe · Cancel anytime · No hidden fees
        </p>
      )}
    </div>
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
              GambitParlay
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Create Your Account</h1>
            <p className="text-white/40 text-sm">Research. Analyze. Win.</p>
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
