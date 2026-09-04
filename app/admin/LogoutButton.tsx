'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  return (
    <button
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        router.push('/admin/login')
        router.refresh()
      }}
      className="font-mono text-xs text-muted underline decoration-line underline-offset-4 hover:text-ink"
    >
      Log out
    </button>
  )
}
