'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { centsToDisplay } from '@/lib/money'

export default function OfferForm({
  listingId,
  askingPrice,
  preview = false,
}: {
  listingId: number
  askingPrice: number
  preview?: boolean
}) {
  const router = useRouter()
  const [showCustom, setShowCustom] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState<'buy' | 'offer' | null>(null)
  const [error, setError] = useState('')
  const [sent, setSent] = useState<'buy' | 'offer' | 'backup' | null>(null)

  async function submit(amountDollars: number, kind: 'buy' | 'offer') {
    if (preview) {
      setSent(kind)
      return
    }
    setLoading(kind)
    setError('')
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, amount: amountDollars }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not submit offer.')
      // Offers under the seller's minimum are auto-declined server-side without
      // telling the buyer what that minimum is — so surface it as "too low",
      // not a silent success, without revealing the number itself.
      if (data.belowMinimum) {
        setError("That offer wasn't high enough for the seller to consider — try offering more.")
        return
      }
      // Submitted while the listing had another accepted offer pending —
      // held back as a backup, not shown to the seller yet.
      setSent(data.backup ? 'backup' : kind)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  function handleBuyNow() {
    submit(Math.ceil(askingPrice / 100), 'buy')
  }

  function handleCustomSubmit(e: FormEvent) {
    e.preventDefault()
    submit(Number(amount), 'offer')
  }

  if (sent === 'buy') {
    return (
      <p className="mt-5 rounded-sm border border-teal/40 bg-raised px-4 py-3 text-sm text-teal">
        You&apos;re buying at the asking price! The seller just needs to confirm — you&apos;ll be notified. Track it
        from your dashboard.
      </p>
    )
  }
  if (sent === 'offer') {
    return (
      <p className="mt-5 rounded-sm border border-teal/40 bg-raised px-4 py-3 text-sm text-teal">
        Offer sent! You&apos;ll be notified when the seller responds. Track it from your dashboard.
      </p>
    )
  }
  if (sent === 'backup') {
    return (
      <p className="mt-5 rounded-sm border border-amber/30 bg-amber/5 px-4 py-3 text-sm text-amber">
        Backup offer submitted. The seller won&apos;t see it unless the accepted deal falls through — you&apos;ll be
        notified either way. Track it from your dashboard.
      </p>
    )
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={loading !== null}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-amber px-6 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading === 'buy' ? <Loader2 className="h-4 w-4 animate-spin" /> : `Buy now — ${centsToDisplay(askingPrice)}`}
      </button>

      {!showCustom ? (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-sm border border-line text-sm font-semibold text-ink transition hover:border-amber/40"
        >
          Make an offer instead
        </button>
      ) : (
        <form onSubmit={handleCustomSubmit} className="mt-4">
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted">Your offer</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="number"
              required
              min={1}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter an amount"
              className="readout h-12 min-w-0 flex-1 rounded-sm border border-line bg-raised px-4 text-sm text-ink outline-none focus:border-amber"
            />
            <button
              type="submit"
              disabled={loading !== null}
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-sm border border-teal/40 px-6 font-semibold text-teal transition hover:bg-teal hover:text-white disabled:opacity-60"
            >
              {loading === 'offer' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit offer'}
            </button>
          </div>
        </form>
      )}
      {error && <p className="mt-2 font-mono text-xs text-amber">{error}</p>}
    </div>
  )
}
