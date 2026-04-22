'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Copy, Download, CheckCircle, Rocket,
  FileText, Mail, MapPin, Phone, Globe, Linkedin,
} from 'lucide-react'
import type { ResumeRecord } from '@/lib/supabase'

// ─── Parser ─────────────────────────────────────────────────────────────────

interface JobEntry   { type: 'job';     header: string; bullets: string[] }
interface BulletList { type: 'bullets'; items: string[] }
interface Para       { type: 'para';    text: string }
type Block = JobEntry | BulletList | Para
interface Section { title: string; blocks: Block[] }
interface Parsed  { name: string; contactLine: string; sections: Section[] }

function parseResume(text: string): Parsed {
  const lines = text.split('\n')
  let name = '', contactLine = '', headerDone = false
  const sections: Section[] = []
  let cur: Section | null = null
  let job: JobEntry | null = null
  const flushJob = () => { if (job && cur) { cur.blocks.push(job); job = null } }

  for (const raw of lines) {
    const line = raw.trim()
    if (!headerDone) {
      if (!line) { if (name) headerDone = true; continue }
      if (!name) { name = line; continue }
      contactLine = contactLine ? contactLine + ' ' + line : line
      continue
    }
    if (!line) { flushJob(); continue }
    const isSectionHead = line === line.toUpperCase() && line.length >= 3 && /^[A-Z0-9\s&\/\-–]+$/.test(line) && !line.includes('|')
    if (isSectionHead) {
      flushJob()
      const last = sections[sections.length - 1]
      if (last && last.title === line) { cur = last } else { cur = { title: line, blocks: [] }; sections.push(cur) }
      continue
    }
    if (!cur) continue
    if (/^[•\-–·*▸]/.test(line)) {
      const bullet = line.replace(/^[•\-–·*▸]\s*/, '')
      if (job) { job.bullets.push(bullet) } else {
        const last = cur.blocks[cur.blocks.length - 1]
        if (last?.type === 'bullets') last.items.push(bullet)
        else cur.blocks.push({ type: 'bullets', items: [bullet] })
      }
      continue
    }
    if (line.includes('|')) { flushJob(); job = { type: 'job', header: line, bullets: [] }; continue }
    flushJob()
    cur.blocks.push({ type: 'para', text: line })
  }
  flushJob()
  return { name, contactLine, sections }
}

type ContactIcon = 'email' | 'phone' | 'location' | 'linkedin' | 'globe'
function parseContact(line: string): { icon: ContactIcon; text: string }[] {
  return line.split(/[|·•]/).map(p => p.trim()).filter(Boolean).map(p => {
    if (p.includes('@')) return { icon: 'email' as ContactIcon, text: p }
    if (/\d{3}[-.\s]\d{3}[-.\s]\d{4}/.test(p) || /\(\d{3}\)/.test(p)) return { icon: 'phone' as ContactIcon, text: p }
    if (/linkedin\.com/i.test(p)) return { icon: 'linkedin' as ContactIcon, text: p }
    if (/^https?:\/\//.test(p) || /\.\w{2,}\//.test(p)) return { icon: 'globe' as ContactIcon, text: p }
    return { icon: 'location' as ContactIcon, text: p }
  })
}

const ICONS: Record<ContactIcon, React.ReactNode> = {
  email: <Mail className="w-3 h-3" />, phone: <Phone className="w-3 h-3" />,
  location: <MapPin className="w-3 h-3" />, linkedin: <Linkedin className="w-3 h-3" />, globe: <Globe className="w-3 h-3" />,
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
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-[5px]" /><span>{b}</span>
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
      if (block.type === 'bullets') skills.push(...block.items)
      else if (block.type === 'para') {
        const colonIdx = block.text.indexOf(':')
        const raw = colonIdx > -1 ? block.text.slice(colonIdx + 1) : block.text
        skills.push(...raw.split(',').map(s => s.trim()).filter(Boolean))
      }
    }
    if (skills.length) return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        {skills.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[13px] text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />{s}
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-1">
      {section.blocks.map((block, i) => {
        if (block.type === 'job') return <JobBlock key={i} entry={block} />
        if (block.type === 'bullets') return (
          <ul key={i} className="space-y-1.5">
            {block.items.map((b, j) => (
              <li key={j} className="flex gap-2.5 text-[13px] text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-[5px]" /><span>{b}</span>
              </li>
            ))}
          </ul>
        )
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
      <div className="flex items-center gap-4 pb-5 border-b-2 border-teal-500 mb-6">
        <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">{initials}</div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{name}</h1>
          {contacts.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
              {contacts.map((c, i) => (
                <span key={i} className="flex items-center gap-1 text-slate-500">
                  {ICONS[c.icon]}<span className="text-[11px]">{c.text}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-5">
        {sections.map((sec, i) => {
          const label = /COMPETENC/i.test(sec.title) ? 'SKILLS' : sec.title
          return (
            <div key={i} className="grid gap-5" style={{ gridTemplateColumns: '100px 1fr' }}>
              <div className="text-right pt-0.5">
                {label.split(/\s+/).map((word, j) => (
                  <span key={j} className="block text-[9px] font-bold uppercase tracking-widest text-teal-600 leading-tight">{word}</span>
                ))}
              </div>
              <div className="border-l border-slate-100 pl-5"><SectionContent section={sec} /></div>
            </div>
          )
        })}
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

function LinkedInRenderer({ text }: { text: string }) {
  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded bg-[#0077b5] flex items-center justify-center">
          <Linkedin className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">LinkedIn About Section</p>
          <p className="text-xs text-slate-500">Copy this into your LinkedIn profile → Edit → About</p>
        </div>
      </div>
      {text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).map((p, i) => (
        <p key={i} className="text-[13px] text-slate-700 leading-relaxed">{p.replace(/\n/g, ' ')}</p>
      ))}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

type Tab = 'resume' | 'cover' | 'linkedin'

export default function ResumeView({ record }: { record: ResumeRecord }) {
  const [activeTab, setActiveTab] = useState<Tab>('resume')
  const [copied, setCopied] = useState(false)

  const activeText = activeTab === 'resume' ? record.resume : activeTab === 'cover' ? record.cover_letter : record.linkedin_summary
  const tabLabel = activeTab === 'resume' ? 'Resume' : activeTab === 'cover' ? 'Cover Letter' : 'LinkedIn Summary'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeText || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-900">ResumeRocket</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              {copied ? <><CheckCircle className="w-4 h-4 text-emerald-500" />Copied!</> : <><Copy className="w-4 h-4" />Copy</>}
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />Save as PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-0">
        <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl mb-6 print:hidden">
          <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-800">Your resume is saved here permanently.</p>
            <p className="text-sm text-indigo-700">Bookmark this page or come back anytime — this link never expires.</p>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6 print:hidden">
          <button onClick={() => setActiveTab('resume')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'resume' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <FileText className="w-4 h-4" />Resume
          </button>
          <button onClick={() => setActiveTab('cover')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'cover' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Mail className="w-4 h-4" />Cover Letter
          </button>
          <button onClick={() => setActiveTab('linkedin')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'linkedin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Linkedin className="w-4 h-4" />LinkedIn
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-12 print:shadow-none print:border-none print:p-6">
          {activeTab === 'resume' && <ResumeRenderer text={record.resume} />}
          {activeTab === 'cover' && <CoverLetterRenderer text={record.cover_letter} />}
          {activeTab === 'linkedin' && <LinkedInRenderer text={record.linkedin_summary || 'LinkedIn summary not available.'} />}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <Link href="/order" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            ← Generate another resume
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={handleCopy} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Copy className="w-4 h-4" />Copy {tabLabel}
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl transition-all shadow-md shadow-indigo-500/20">
              <Download className="w-4 h-4" />Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
