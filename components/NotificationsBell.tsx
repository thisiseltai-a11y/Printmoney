'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useNotifications } from './NotificationsProvider'

export default function NotificationsBell() {
  const { notifications, unread, markRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleOpen() {
    const next = !open
    setOpen(next)
    if (next) await markRead()
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen} className="relative rounded-sm p-2 text-muted transition hover:text-ink" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-card border border-line bg-panel shadow-xl shadow-black/10">
          <div className="border-b border-line px-4 py-3 font-grotesk text-sm font-semibold text-ink">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">Nothing yet.</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || '/dashboard'}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line px-4 py-3 last:border-b-0 hover:bg-raised"
                >
                  <p className="text-sm text-ink">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-muted">{n.body}</p>}
                  <p className="mt-1 font-mono text-[10px] text-muted">{new Date(n.created_at).toLocaleString()}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
