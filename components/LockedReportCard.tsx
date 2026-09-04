'use client'

import { useState, FormEvent } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { REPORT_PRICE_DISPLAY } from '@/lib/constants'

const LOCKED_ROWS = [
  ['Accident History', '1 reported accident'],
  ['Number of Owners', '2 previous owners'],
  ['Title Status', 'Clean'],
  ['Service Records', '6 records on file'],
]

export default function LockedReportCard({
  onUnlock,
  onRetrieve,
  unlocking,
  retrieving,
  error,
}: {
  onUnlock: (email: string) => void
  onRetrieve: (email: string) => void
  unlocking: boolean
  retrieving: boolean
  error?: string
}) {
  const [email, setEmail] = useState('')
  const [showRetrieve, setShowRetrieve] = useState(false)
  const [retrieveEmail, setRetrieveEmail] = useState('')

  function submitUnlock(e: FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    onUnlock(email)
  }

  function submitRetrieve(e: FormEvent) {
    e.preventDefault()
    if (!retrieveEmail.includes('@')) return
    onRetrieve(retrieveEmail)
  }

  return (
    <div className="rounded-card border border-line bg-panel p-6">
      <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-amber">
        <Lock className="h-3.5 w-3.5" />
        Full history report — locked
      </div>

      <dl className="mb-6 space-y-3">
        {LOCKED_ROWS.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="locked-field readout text-sm text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <form onSubmit={submitUnlock} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="readout h-12 flex-1 rounded-sm border border-line bg-raised px-4 text-sm text-ink outline-none focus:border-amber"
        />
        <button
          type="submit"
          disabled={unlocking}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-sm bg-amber px-6 font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
        >
          {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : `Unlock Full Report — ${REPORT_PRICE_DISPLAY}`}
        </button>
      </form>
      {error && <p className="mt-2 font-mono text-xs text-amber">{error}</p>}
      <p className="mt-2 font-mono text-xs text-muted">One-time payment via Stripe. No subscription.</p>

      <button
        type="button"
        onClick={() => setShowRetrieve((v) => !v)}
        className="mt-4 font-mono text-xs text-muted underline decoration-line underline-offset-4 hover:text-ink"
      >
        Already unlocked this VIN?
      </button>
      {showRetrieve && (
        <form onSubmit={submitRetrieve} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={retrieveEmail}
            onChange={(e) => setRetrieveEmail(e.target.value)}
            placeholder="Email used at purchase"
            className="readout h-11 flex-1 rounded-sm border border-line bg-raised px-4 text-sm text-ink outline-none focus:border-teal"
          />
          <button
            type="submit"
            disabled={retrieving}
            className="h-11 shrink-0 rounded-sm border border-teal/40 px-5 font-mono text-xs text-teal transition hover:bg-teal hover:text-bg disabled:opacity-60"
          >
            {retrieving ? 'Checking…' : 'Retrieve report'}
          </button>
        </form>
      )}
    </div>
  )
}
