'use client'
import { useState, useEffect } from 'react'
import { X, Zap, Mail } from 'lucide-react'

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [duplicate, setDuplicate] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('popup_dismissed')) return
    const timer = setTimeout(() => setShow(true), 15000)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    setShow(false)
    sessionStorage.setItem('popup_dismissed', '1')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.duplicate) {
        setDuplicate(true)
      } else {
        setSubmitted(true)
      }
      sessionStorage.setItem('popup_dismissed', '1')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-600" />

        <div className="p-7">
          <button
            onClick={dismiss}
            className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {duplicate ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📬</div>
              <h3 className="text-xl font-bold text-white mb-2">Already sent!</h3>
              <p className="text-slate-400 text-sm">
                We already sent a link to <span className="text-white font-medium">{email}</span>. Check your inbox!
              </p>
            </div>
          ) : !submitted ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-5">
                <Zap className="w-3 h-3" />
                Save Your Spot
              </div>

              <h3 className="text-2xl font-extrabold text-white mb-2 leading-tight">
                Come back when you&apos;re ready
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Drop your email and we&apos;ll send you a private link so you can pick up right where you left off. No spam, use it whenever you&apos;re ready.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send My Link →'}
                </button>
              </form>

              <p className="text-center text-xs text-slate-600 mt-4">
                No subscription. No spam. One-time payment when you&apos;re ready.
              </p>
            </>
          ) : submitted ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Check your inbox!</h3>
              <p className="text-slate-400 text-sm">
                Your link is on its way to <span className="text-white font-medium">{email}</span>. Use it whenever you&apos;re ready.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
