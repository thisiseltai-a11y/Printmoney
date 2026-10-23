'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
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
      aria-label="Log out"
      className={className ?? 'flex items-center text-sm text-muted transition hover:text-ink'}
    >
      <LogOut className="h-4 w-4 sm:hidden" />
      <span className="hidden sm:inline">Log out</span>
    </button>
  )
}
