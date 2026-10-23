'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import type { Message } from '@/lib/db'

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function MessageThread({
  listingId,
  buyerId,
  currentUserId,
  initialMessages,
}: {
  listingId: number
  buyerId: string
  currentUserId: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastIdRef = useRef(initialMessages.at(-1)?.id ?? 0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  // Lightweight poll, same pattern as NotificationsBell — only asks for
  // messages newer than the last one already shown.
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/messages?listingId=${listingId}&buyerId=${buyerId}&afterId=${lastIdRef.current}`
        )
        if (!res.ok) return
        const data = await res.json()
        if (data.messages?.length) {
          setMessages((prev) => [...prev, ...data.messages])
          lastIdRef.current = data.messages.at(-1).id
        }
      } catch {
        // transient network hiccup — next poll will catch up
      }
    }, 8000)
    return () => clearInterval(id)
  }, [listingId, buyerId])

  async function send() {
    const text = draft.trim()
    if (!text) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, buyerId, body: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not send message.')
      setMessages((prev) => [...prev, data.message])
      lastIdRef.current = data.message.id
      setDraft('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">No messages yet — say hello.</p>
        )}
        {messages.map((m) => {
          const isMine = m.sender_id === currentUserId
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className="flex max-w-[75%] flex-col gap-1">
                <div className={`rounded-card px-4 py-2.5 text-sm ${isMine ? 'bg-teal/10 text-ink' : 'bg-raised text-ink'}`}>
                  {m.body}
                </div>
                <span className={`px-1 font-mono text-[10px] text-muted ${isMine ? 'text-right' : ''}`}>
                  {formatTime(m.created_at)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-line p-4">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Type a message…"
            className="readout h-11 flex-1 rounded-sm border border-line bg-raised px-4 text-sm text-ink outline-none focus:border-amber"
          />
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-amber text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="mt-2 font-mono text-xs text-amber">{error}</p>}
      </div>
    </div>
  )
}
