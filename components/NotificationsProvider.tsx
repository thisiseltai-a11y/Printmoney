'use client'

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'

export interface Notification {
  id: number
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

interface NotificationsContextValue {
  notifications: Notification[]
  unread: number
  markRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unread: 0,
  markRead: async () => {},
})

export function useNotifications() {
  return useContext(NotificationsContext)
}

// Shared by the bell dropdown and the Dashboard nav link's badge, so both
// reflect the same unread count off a single poll instead of each fetching
// independently.
export default function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  const load = useCallback(async () => {
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(data.notifications ?? [])
    setUnread(data.unread ?? 0)
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [load])

  const markRead = useCallback(async () => {
    if (unread === 0) return
    await fetch('/api/notifications/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    setUnread(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [unread])

  return (
    <NotificationsContext.Provider value={{ notifications, unread, markRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}
