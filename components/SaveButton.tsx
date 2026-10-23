'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

export default function SaveButton({
  listingId,
  initialSaved,
  loggedIn,
  preview = false,
}: {
  listingId: number
  initialSaved: boolean
  loggedIn: boolean
  preview?: boolean
}) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (preview) {
      setSaved((prev) => !prev)
      return
    }
    if (!loggedIn) {
      router.push(`/login?next=/listings/${listingId}`)
      return
    }
    setLoading(true)
    const next = !saved
    setSaved(next) // optimistic
    try {
      const res = await fetch(`/api/listings/${listingId}/save`, { method: next ? 'POST' : 'DELETE' })
      if (!res.ok) throw new Error()
    } catch {
      setSaved(!next) // revert on failure
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={saved}
      className="flex shrink-0 items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-amber/40 hover:text-ink disabled:opacity-60"
    >
      <Heart className={`h-4 w-4 ${saved ? 'fill-amber text-amber' : ''}`} />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
