'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelListingButton({ listingId }: { listingId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm('Cancel this listing? This can\'t be undone.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/listings/${listingId}/cancel`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Could not cancel listing.')
      }
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="font-mono text-xs text-muted underline decoration-line underline-offset-4 hover:text-ink disabled:opacity-60"
    >
      {loading ? 'Cancelling…' : 'Cancel listing'}
    </button>
  )
}
