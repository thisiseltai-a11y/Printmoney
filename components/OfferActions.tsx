'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { OfferStatus } from '@/lib/db'

const BADGES: Record<OfferStatus, { label: string; className: string }> = {
  pending_seller: { label: 'Awaiting seller', className: 'text-amber' },
  pending_buyer: { label: 'Awaiting buyer', className: 'text-amber' },
  accepted: { label: 'Accepted', className: 'text-teal' },
  declined: { label: 'Declined', className: 'text-muted' },
  withdrawn: { label: 'Withdrawn', className: 'text-muted' },
  auto_declined: { label: 'Auto-declined', className: 'text-muted' },
}

export default function OfferActions({
  offerId,
  status,
  role,
}: {
  offerId: number
  status: OfferStatus
  role: 'buyer' | 'seller'
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCounter, setShowCounter] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')

  async function act(action: 'accept' | 'counter' | 'decline' | 'withdraw', counterAmountValue?: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/offers/${offerId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, counterAmount: counterAmountValue ? Number(counterAmountValue) : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not update offer.')
      setShowCounter(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isMyTurn = (role === 'seller' && status === 'pending_seller') || (role === 'buyer' && status === 'pending_buyer')
  const isWaiting = (role === 'seller' && status === 'pending_buyer') || (role === 'buyer' && status === 'pending_seller')

  return (
    <div>
      {isMyTurn && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => act('accept')}
            disabled={loading}
            className="rounded-sm bg-teal px-3 py-1.5 text-xs font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
          >
            Accept
          </button>
          <button
            onClick={() => setShowCounter((v) => !v)}
            disabled={loading}
            className="rounded-sm border border-amber/40 px-3 py-1.5 text-xs text-amber transition hover:bg-amber hover:text-bg disabled:opacity-60"
          >
            Counter
          </button>
          <button
            onClick={() => act('decline')}
            disabled={loading}
            className="rounded-sm border border-line px-3 py-1.5 text-xs text-muted transition hover:text-ink disabled:opacity-60"
          >
            Decline
          </button>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
        </div>
      )}

      {isMyTurn && showCounter && (
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            min={1}
            value={counterAmount}
            onChange={(e) => setCounterAmount(e.target.value)}
            placeholder="Counter amount ($)"
            className="readout h-9 flex-1 rounded-sm border border-line bg-raised px-3 text-xs text-ink outline-none focus:border-amber"
          />
          <button
            onClick={() => act('counter', counterAmount)}
            disabled={loading || !counterAmount}
            className="rounded-sm bg-amber px-3 py-1.5 text-xs font-semibold text-bg disabled:opacity-60"
          >
            Send
          </button>
        </div>
      )}

      {isWaiting && role === 'buyer' && (
        <button
          onClick={() => act('withdraw')}
          disabled={loading}
          className="rounded-sm border border-line px-3 py-1.5 text-xs text-muted transition hover:text-ink disabled:opacity-60"
        >
          {loading ? 'Withdrawing…' : 'Withdraw offer'}
        </button>
      )}

      {!isMyTurn && !isWaiting && (
        <span className={`font-mono text-xs ${BADGES[status].className}`}>{BADGES[status].label}</span>
      )}
      {isWaiting && <p className="mt-1 font-mono text-xs text-muted">{BADGES[status].label}</p>}

      {error && <p className="mt-1 font-mono text-xs text-amber">{error}</p>}
    </div>
  )
}
