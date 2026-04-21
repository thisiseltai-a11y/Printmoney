'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Copy, Download, CheckCircle, ArrowLeft, Rocket,
  FileText, Mail, Loader2, MapPin, Phone, Globe, Linkedin,
} from 'lucide-react'
import type { GeneratedContent } from '@/lib/types'

// ─── Parser ────────────────────────────────────────────────────────────────

interface JobEntry  { type: 'job';     header: string; bullets: string[] }
interface BulletList{ type: 'bullets'; items: string[] }
interface Para      { type: 'para';    text: string }
type Block = JobEntry | BulletList | Para

interface Section { title: string; blocks: Block[] }
interface Parsed  { name: string; contactLine: string; sections: Section[] }

function parseResume(text: string): Parsed {
  const lines = text.split('\n')
  let name = '', contactLine = '', headerDone = false
  const sections: Section[] = []
  let cur: Section | null = null
  let job: JobEntry | null = null

  const flushJob = () => {
    if (job && cur) { cur.blocks.push(job); job = null }
  }

  for (const raw of lines) {
    const line = raw.trim()

    if (!headerDone) {
      if (!line) { if (name) headerDone = true; continue }
      if (!name) { name = line; continue }
      contactLine = contactLine ? contactLine + ' ' + line : line
      continue
    }

    if (!line) { flushJob(); continue }

    const isSectionHead =
      line === line.toUpperCase() &&
      line.length >= 3 &&
      /^[A-Z0-9\s&\/\-–]+$/.test(line) &&
      !line.includes('|')

    if (isSectionHead) {
      flushJob()
      cur = { title: line, blocks: [] }
      sections.push(cur)
      continue
    }

    if (!cur) continue

    if (/^[•\-–·*▸]/.test(line)) {
      const bullet = line.replace(/^[•\-–·*▸]\s*/, '')
      if (job) {
        job.bullets.push(bullet)
      } else {
        const last = cur.blocks[cur.blocks.length - 1]
        if (last?.type === 'bullets') last.items.push(bullet)
        else cur.blocks.push({ type: 'bullets', items: [bullet] })
      }
      continue
    }

    if (line.includes('|')) {
      flushJob()
      job = { type: 'job', header: line, bullets: [] }
      continue
    }

    flushJob()
    cur.blocks.push({ type: 'para', text: line })
  }

  flushJob()
  return { name, contactLine, sections }
}

// ─── Contact parsing ────────────────────────────────────────────────────────

type ContactIcon = 'email' | 'phone' | 'location' | 'linkedin' | 'globe'

function parseContact(line: string): { icon: ContactIcon; text: string }[] {
  const parts = line.split(/[|·•]/).map(p => p.trim()).filter(Boolean)
  return parts.map(p => {
    if (p.includes('@'))                              return { icon: 'email',    text: p }
    if (/\d{3}[-.\s]\d{3}[-.\s]\d{4}/.test(p) ||
        /\(\d{3}\)/.test(p))                         return { icon: 'phone',    text: p }
    if (/linkedin\.com/i.test(p))                    return { icon: 'linkedin', text: p }
    if (/^https?:\/\//.test(p) || /\.\w{2,}\//.test(p)) return { icon: 'globe', text: p }
    return { icon: 'location', text: p }
  })
}

// ─── Small UI pieces ────────────────────────────────────────────────────────

const ICONS: Record<ContactIcon, React.ReactNode> = {
  email:    <Mail      className="w-3 h-3" />,
  phone:    <Phone     className="w-3 h-3" />,
  location: <MapPin    className="w-3 h-3" />,
  linkedin: <Linkedin  className="w-3 h-3" />,
  globe:    <Globe     className="w-3 h-3" />,
}

function JobBlock({ entry }: { entry: JobEntry }) {
  const parts = entry.header.split('|').map(p => p.trim())
  const title = parts[0]
  const datePart = parts.find(p => /\d{4}|present|current/i.test(p))
  const company = parts.filter(p => p !== title && p !== datePart).join(' · ')

  return (
    <div className="mt-4 first:mt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="text-sm font-bold text-slate-900">{title}</span>
        {datePart && <span className="text-xs text-slate-400 whitespace-nowrap">{datePart}</span>}
      </div>
      {company && <p className="text-xs font-medium text-teal-700 mt-0.5">{company}</p>}
      {entry.bullets.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {entry.bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] text-slate-700 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-[5px]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SectionContent({ section }: { section: Section }) {
  const isSkills = /SKILLS|COMPETENC/i.test(section.title)

  if (isSkills) {
    const skills: string[] = []
    for (const block of section.blocks) {
      if (block.type === 'bullets') {
        skills.push(...block.items)
      } else if (block.type === 'para') {
        const colonIdx = block.text.indexOf(':')
        const raw = colonIdx > -1 ? block.text.slice(colonIdx + 1) : block.text
        skills.push(...raw.split(',').map(s => s.trim()).filter(Boolean))
      }
    }
    if (skills.length) {
      return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {skills.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[13px] text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
              {s}
            </div>
          ))}
        </div>
      )
    }
  }

  return (
    <div className="space-y-1">
      {section.blocks.map((block, i) => {
        if (block.type === 'job') return <JobBlock key={i} entry={block} />
        if (block.type === 'bullets') {
          return (
            <ul key={i} className="space-y-1.5">
              {block.items.map((b, j) => (
                <li key={j} className="flex gap-2.5 text-[13px] text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-[5px]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )
        }
        return <p key={i} className="text-[13px] text-slate-700 leading-relaxed">{block.text}</p>
      })}
    </div>
  )
}

function ResumeRenderer({ text }: { text: string }) {
  const { name, contactLine, sections } = parseResume(text)
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const contacts = parseContact(contactLine)

  return (
    <div className="font-sans text-slate-800">
      {/* Header */}
      <div className="flex items-center gap-4 pb-5 border-b-2 border-teal-500 mb-6 print:pb-3 print:mb-4">
        <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 print:w-10 print:h-10 print:text-base">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight print:text-xl">{name}</h1>
          {contacts.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
              {contacts.map((c, i) => (
                <span key={i} className="flex items-center gap-1 text-slate-500">
                  {ICONS[c.icon]}
                  <span className="text-[11px]">{c.text}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two-column body */}
      <div className="space-y-5">
        {sections.map((sec, i) => {
          const label = /COMPETENC/i.test(sec.title) ? 'SKILLS' : sec.title
          return (
          <div key={i} className="grid gap-5" style={{ gridTemplateColumns: '100px 1fr' }}>
            {/* Left: section label */}
            <div className="text-right pt-0.5">
              {label.split(/\s+/).map((word, j) => (
                <span key={j} className="block text-[9px] font-bold uppercase tracking-widest text-teal-600 leading-tight">
                  {word}
                </span>
              ))}
            </div>
            {/* Right: content */}
            <div className="border-l border-slate-100 pl-5">
              <SectionContent section={sec} />
            </div>
          </div>
        )})
      </div>
    </div>
  )
}

function CoverLetterRenderer({ text }: { text: string }) {
  return (
    <div className="space-y-4 font-sans">
      {text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).map((p, i) => (
        <p key={i} className="text-[13px] text-slate-700 leading-relaxed">{p.replace(/\n/g, ' ')}</p>
      ))}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ResultPage() {
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [activeTab, setActiveTab] = useState<'resume' | 'cover'>('resume')
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const sessionId = params.get('session_id')

      if (!sessionId) {
        const stored = sessionStorage.getItem('resume_result')
        if (stored) setContent(JSON.parse(stored))
        return
      }

      setGenerating(true)
      try {
        const verifyRes = await fetch(`/api/verify-payment?session_id=${sessionId}`)
        if (!verifyRes.ok) {
          const body = await verifyRes.json().catch(() => ({}))
          throw new Error(body.error || `Payment verification failed (${verifyRes.status})`)
        }

        const formData = localStorage.getItem('pending_form_data')
        if (!formData) throw new Error('Form data not found. Please go back and fill the form again.')

        const genRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: formData,
        })

        const result = await genRes.json()
        if (!genRes.ok || result.error) throw new Error(result.error || `Generation failed (${genRes.status})`)
        if (!result.resume) throw new Error('Resume missing from AI response. Please try again.')

        setContent(result)
        sessionStorage.setItem('resume_result', JSON.stringify(result))
        localStorage.removeItem('pending_form_data')
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setGenerating(false)
      }
    }
    run()
  }, [])

  const handleCopy = async () => {
    const text = activeTab === 'resume' ? content?.resume : content?.coverLetter
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (generating) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-6">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Writing your resume...</h2>
        <p className="text-slate-500">Payment confirmed. AI is crafting your documents now.</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-4">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <Link href="/order" className="text-teal-600 hover:underline">← Go back and try again</Link>
      </div>
    </div>
  )

  if (!content) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-slate-600 mb-4">No resume found.</p>
        <Link href="/order" className="text-teal-600 hover:underline">← Go back and generate one</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-900">ResumeRocket</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              {copied
                ? <><CheckCircle className="w-4 h-4 text-emerald-500" />Copied!</>
                : <><Copy className="w-4 h-4" />Copy</>}
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />Save as PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-0">
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6 print:hidden">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Your resume is ready!</p>
            <p className="text-sm text-emerald-700">ATS-optimized and tailored to your target role.</p>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6 print:hidden">
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'resume' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-4 h-4" />Resume
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'cover' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Mail className="w-4 h-4" />Cover Letter
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm print:shadow-none print:border-none print:rounded-none">
          <div className="p-8 sm:p-12 print:p-8">
            {activeTab === 'resume'
              ? <ResumeRenderer text={content.resume} />
              : <CoverLetterRenderer text={content.coverLetter} />}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <Link href="/order" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />Generate another resume
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={handleCopy} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Copy className="w-4 h-4" />Copy {activeTab === 'resume' ? 'Resume' : 'Cover Letter'}
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-md shadow-teal-500/20">
              <Download className="w-4 h-4" />Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
