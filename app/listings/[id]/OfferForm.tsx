'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { centsToDisplay } from '@/lib/money'

export default function OfferForm({ listingId, minimumOffer }: { listingId: number; minimumOffer: number }) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, amount: Number(amount) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not submit offer.')
      setSent(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <p className="mt-5 rounded-sm border border-teal/40 bg-raised px-4 py-3 text-sm text-teal">
        Offer sent! You&apos;ll be notified when the seller responds. Track it from your dashboard.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted">Your offer</label>
      <div className="flex gap-3">
        <input
          type="number"
          required
          min={Math.ceil(minimumOffer / 100)}
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={String(Math.ceil(minimumOffer / 100))}
          className="readout h-12 flex-1 rounded-sm border border-line bg-raised px-4 text-sm text-ink outline-none focus:border-amber"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-sm bg-amber px-6 font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Make offer'}
        </button>
      </div>
      <p className="mt-2 font-mono text-xs text-muted">Minimum the seller will consider: {centsToDisplay(minimumOffer)}</p>
      {error && <p className="mt-2 font-mono text-xs text-amber">{error}</p>}
    </form>
  )
}
