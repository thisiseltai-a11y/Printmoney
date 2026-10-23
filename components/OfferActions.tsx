'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { OfferStatus } from '@/lib/db'

const BADGES: Record<OfferStatus, { label: string; className: string }> = {
  pending_seller: { label: 'Awaiting seller', className: 'bg-amber/10 text-amber' },
  pending_buyer: { label: 'Awaiting buyer', className: 'bg-amber/10 text-amber' },
  accepted: { label: 'Accepted', className: 'bg-teal/10 text-teal' },
  declined: { label: 'Declined', className: 'bg-raised text-muted' },
  withdrawn: { label: 'Withdrawn', className: 'bg-raised text-muted' },
  auto_declined: { label: 'Auto-declined', className: 'bg-raised text-muted' },
  expired: { label: 'Expired', className: 'bg-raised text-muted' },
  backup: { label: 'Backup offer', className: 'bg-raised text-muted' },
  fell_through: { label: 'Deal fell through', className: 'bg-raised text-muted' },
}

function Badge({ status }: { status: OfferStatus }) {
  const b = BADGES[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-xs ${b.className}`}>
      {b.label}
    </span>
  )
}

export default function OfferActions({
  offerId,
  status,
  role,
  expiresIn,
}: {
  offerId: number
  status: OfferStatus
  role: 'buyer' | 'seller'
  expiresIn?: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCounter, setShowCounter] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')

  async function act(
    action: 'accept' | 'counter' | 'decline' | 'withdraw' | 'fall_through',
    counterAmountValue?: string
  ) {
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
  const isAccepted = status === 'accepted'
  const isBackup = status === 'backup'

  return (
    <div>
      {isMyTurn && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => act('accept')}
            disabled={loading}
            className="rounded-sm bg-teal px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            Accept
          </button>
          <button
            onClick={() => setShowCounter((v) => !v)}
            disabled={loading}
            className="rounded-sm border border-amber/40 px-3 py-1.5 text-xs text-amber transition hover:bg-amber hover:text-white disabled:opacity-60"
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
          {expiresIn && <span className="font-mono text-xs text-amber">{expiresIn} — respond or it auto-closes</span>}
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
            className="rounded-sm bg-amber px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            Send
          </button>
        </div>
      )}

      {isWaiting && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge status={status} />
          {expiresIn && <span className="font-mono text-xs text-muted">{expiresIn}</span>}
          {role === 'buyer' && (
            <button
              onClick={() => act('withdraw')}
              disabled={loading}
              className="rounded-sm border border-line px-3 py-1.5 text-xs text-muted transition hover:text-ink disabled:opacity-60"
            >
              {loading ? 'Withdrawing…' : 'Withdraw offer'}
            </button>
          )}
        </div>
      )}

      {isAccepted && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge status={status} />
          <button
            onClick={() => act('fall_through')}
            disabled={loading}
            className="rounded-sm border border-line px-3 py-1.5 text-xs text-muted transition hover:text-ink disabled:opacity-60"
          >
            {loading ? 'Updating…' : 'Deal fell through?'}
          </button>
        </div>
      )}

      {isBackup && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge status={status} />
          {role === 'buyer' && (
            <button
              onClick={() => act('withdraw')}
              disabled={loading}
              className="rounded-sm border border-line px-3 py-1.5 text-xs text-muted transition hover:text-ink disabled:opacity-60"
            >
              {loading ? 'Withdrawing…' : 'Withdraw backup offer'}
            </button>
          )}
        </div>
      )}

      {isBackup && role === 'buyer' && (
        <p className="mt-1 font-mono text-[11px] text-muted">
          Only visible to you — the seller will see it if the accepted deal falls through.
        </p>
      )}

      {!isMyTurn && !isWaiting && !isAccepted && !isBackup && <Badge status={status} />}

      {error && <p className="mt-1 font-mono text-xs text-amber">{error}</p>}
    </div>
  )
}
