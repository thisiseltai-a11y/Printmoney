'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Rocket } from 'lucide-react'
import { AGENTS } from '@/lib/agents'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTERS: Record<string, string[]> = {
  'product-manager':   ['What should I build next?', 'How do I reduce drop-off in my form?', 'Should I add a free tier?'],
  'marketing-manager': ['Write me a blog post outline for ATS tips', 'What are my best SEO keywords?', 'How do I market on Reddit without getting banned?'],
  'sales-manager':     ['How do I increase my conversion rate?', 'Should I offer a free trial?', 'Review my pricing page copy'],
  'financial-advisor': ['Model my revenue at 100 customers/month', 'When can I afford to run ads?', 'What\'s my break-even point?'],
  'customer-success':  ['How do I get more reviews?', 'Draft a follow-up email sequence', 'How do I reduce churn on the $19 plan?'],
  'growth-hacker':     ['What\'s my fastest path to $1K MRR?', 'How do I go viral on TikTok?', 'Design a referral program for me'],
}

export default function AgentChatPage({ params }: { params: { slug: string } }) {
  const agent = AGENTS.find(a => a.slug === params.slug)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Agent not found.</p>
          <Link href="/agents" className="text-teal-400 hover:underline">← Back to team</Link>
        </div>
      </div>
    )
  }

  const starters = STARTERS[agent.slug] ?? []

  const send = async (text: string) => {
    if (!text.trim() || streaming) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setStreaming(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages([...next, assistantMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentSlug: agent.slug,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Chat request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages([...next, { role: 'assistant', content: full }])
      }
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/agents" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className={`w-10 h-10 rounded-xl ${agent.bg} flex items-center justify-center flex-shrink-0`}>
            <span className={`text-xs font-bold ${agent.color}`}>{agent.initials}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm leading-tight">{agent.name} · {agent.title}</p>
            <p className="text-xs text-slate-500 truncate">{agent.focus}</p>
          </div>
          <Link href="/" className="ml-auto flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Rocket className="w-2.5 h-2.5 text-white" />
            </div>
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className={`w-16 h-16 rounded-2xl ${agent.bg} flex items-center justify-center mx-auto mb-4`}>
                <span className={`text-xl font-bold ${agent.color}`}>{agent.initials}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{agent.name}, {agent.title}</h2>
              <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
                Fully briefed on ResumeRocket — pricing, market, competition, growth strategy. Ask me anything.
              </p>
              {starters.length > 0 && (
                <div className="flex flex-col gap-2 items-center">
                  {starters.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-xl text-sm text-slate-300 hover:text-white transition-all text-left max-w-sm w-full"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className={`w-8 h-8 rounded-lg ${agent.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`text-[10px] font-bold ${agent.color}`}>{agent.initials}</span>
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-sm'
                  : 'bg-slate-800 text-slate-100 rounded-tl-sm'
              }`}>
                {msg.content}
                {streaming && i === messages.length - 1 && msg.role === 'assistant' && !msg.content && (
                  <span className="inline-flex gap-1 items-center h-4">
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 focus-within:border-slate-500 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Ask ${agent.name} anything...`}
              rows={1}
              disabled={streaming}
              className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 resize-none outline-none max-h-32 disabled:opacity-50"
              style={{ scrollbarWidth: 'none' }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              className="w-8 h-8 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-2">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
