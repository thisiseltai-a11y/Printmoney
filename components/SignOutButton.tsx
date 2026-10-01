'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
      }}
      className={className ?? 'text-sm text-muted transition hover:text-ink'}
    >
      Log out
    </button>
  )
}
