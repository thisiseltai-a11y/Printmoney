'use client'

import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { useNotifications } from './NotificationsProvider'

export default function DashboardLink() {
  const { unread } = useNotifications()

  return (
    <Link href="/dashboard" aria-label="Dashboard" className="flex items-center transition hover:text-ink">
      <span className="relative inline-flex">
        <LayoutDashboard className="h-4 w-4 sm:hidden" />
        <span className="hidden sm:inline">Dashboard</span>
        {unread > 0 && (
          <span className="absolute -right-2.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </span>
    </Link>
  )
}
