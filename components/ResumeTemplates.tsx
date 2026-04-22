'use client'
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface JobEntry   { type: 'job';     header: string; bullets: string[] }
interface BulletList { type: 'bullets'; items: string[] }
interface Para       { type: 'para';    text: string }
type Block = JobEntry | BulletList | Para
interface Section { title: string; blocks: Block[] }
interface Parsed  { name: string; contactLine: string; sections: Section[] }
type ContactIcon = 'email' | 'phone' | 'location' | 'linkedin' | 'globe'
export type Template = 'sharp' | 'executive' | 'minimal'

// ─── Parser ──────────────────────────────────────────────────────────────────

export function parseResume(text: string): Parsed {
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

    const isSectionHead =
      line === line.toUpperCase() &&
      line.length >= 3 &&
      /^[A-Z0-9\s&\/\-–]+$/.test(line) &&
      !line.includes('|')

    if (isSectionHead) {
      flushJob()
      const last = sections[sections.length - 1]
      if (last && last.title === line) { cur = last } else {
        cur = { title: line, blocks: [] }
        sections.push(cur)
      }
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

function parseContact(line: string): { icon: ContactIcon; text: string }[] {
  return line.split(/[|·•]/).map(p => p.trim()).filter(Boolean).map(p => {
    if (p.includes('@'))                                   return { icon: 'email'    as ContactIcon, text: p }
    if (/\d{3}[-.\s]\d{3}[-.\s]\d{4}/.test(p) || /\(\d{3}\)/.test(p))
                                                           return { icon: 'phone'    as ContactIcon, text: p }
    if (/linkedin\.com/i.test(p))                         return { icon: 'linkedin' as ContactIcon, text: p }
    if (/^https?:\/\//.test(p) || /\.\w{2,}\//.test(p))  return { icon: 'globe'    as ContactIcon, text: p }
    return { icon: 'location' as ContactIcon, text: p }
  })
}

const CONTACT_ICONS: Record<ContactIcon, React.ReactNode> = {
  email:    <Mail     className="w-3 h-3 flex-shrink-0" />,
  phone:    <Phone    className="w-3 h-3 flex-shrink-0" />,
  location: <MapPin   className="w-3 h-3 flex-shrink-0" />,
  linkedin: <Linkedin className="w-3 h-3 flex-shrink-0" />,
  globe:    <Globe    className="w-3 h-3 flex-shrink-0" />,
}

function extractSkills(sections: Section[]): { skills: string[]; rest: Section[] } {
  const skills: string[] = []
  const rest: Section[] = []
  for (const sec of sections) {
    if (/SKILLS|COMPETENC/i.test(sec.title)) {
      for (const block of sec.blocks) {
        if (block.type === 'bullets') skills.push(...block.items)
        else if (block.type === 'para') {
          const raw = block.text.includes(':') ? block.text.slice(block.text.indexOf(':') + 1) : block.text
          skills.push(...raw.split(',').map(s => s.trim()).filter(Boolean))
        }
      }
    } else {
      rest.push(sec)
    }
  }
  return { skills, rest }
}

// ─── Shared block renderers ──────────────────────────────────────────────────

function JobBlockSharp({ entry, accentClass }: { entry: JobEntry; accentClass: string }) {
  const parts = entry.header.split('|').map(p => p.trim())
  const title = parts[0]
  const datePart = parts.find(p => /\d{4}|present|current/i.test(p))
  const company = parts.filter(p => p !== title && p !== datePart).join(' · ')
  return (
    <div className="mt-3 first:mt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="text-[13px] font-bold text-slate-900 leading-snug">{title}</span>
        {datePart && <span className="text-[11px] text-slate-400 whitespace-nowrap">{datePart}</span>}
      </div>
      {company && <p className={`text-[11px] font-semibold mt-0.5 ${accentClass}`}>{company}</p>}
      {entry.bullets.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {entry.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-slate-600 leading-relaxed">
              <span className="mt-[5px] w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SectionBlocks({ section, accentClass }: { section: Section; accentClass: string }) {
  return (
    <div className="space-y-0.5">
      {section.blocks.map((block, i) => {
        if (block.type === 'job') return <JobBlockSharp key={i} entry={block} accentClass={accentClass} />
        if (block.type === 'bullets') return (
          <ul key={i} className="space-y-1 mt-1">
            {block.items.map((b, j) => (
              <li key={j} className="flex gap-2 text-[12px] text-slate-600 leading-relaxed">
                <span className="mt-[5px] w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )
        return <p key={i} className="text-[12px] text-slate-600 leading-relaxed">{block.text}</p>
      })}
    </div>
  )
}

// ─── Template 1: Sharp ───────────────────────────────────────────────────────
// Single column, indigo accent bars, clean typographic hierarchy

function SharpTemplate({ parsed }: { parsed: Parsed }) {
  const { name, contactLine, sections } = parsed
  const contacts = parseContact(contactLine)
  const { skills, rest } = extractSkills(sections)

  return (
    <div className="font-sans text-slate-800 print:[print-color-adjust:exact]">
      {/* Header */}
      <div className="mb-5 pb-4 border-b-2 border-slate-900">
        <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900 leading-none mb-2">{name}</h1>
        {contacts.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {contacts.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                {CONTACT_ICONS[c.icon]}
                {c.text}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Skills pills */}
      {skills.length > 0 && (
        <div className="mb-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-600 mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s, i) => (
              <span key={i} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-full border border-slate-200">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {rest.map((sec, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-0.5 h-4 bg-indigo-500 flex-shrink-0" />
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-600">{sec.title}</p>
            </div>
            <SectionBlocks section={sec} accentClass="text-indigo-600" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Template 2: Executive ───────────────────────────────────────────────────
// Dark sidebar left, white content right — premium look

function ExecutiveTemplate({ parsed }: { parsed: Parsed }) {
  const { name, contactLine, sections } = parsed
  const contacts = parseContact(contactLine)
  const { skills, rest } = extractSkills(sections)
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div className="font-sans flex min-h-[900px] print:[print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 bg-slate-900 text-white p-6 print:bg-slate-900 print:text-white">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
          {initials}
        </div>
        {/* Name */}
        <h1 className="text-[15px] font-bold text-white leading-tight text-center mb-4">{name}</h1>

        {/* Contact */}
        {contacts.length > 0 && (
          <div className="space-y-2 mb-6">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">{CONTACT_ICONS[c.icon]}</span>
                <span className="text-[10px] text-slate-300 leading-tight break-all">{c.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Skills</p>
            <div className="space-y-1">
              {skills.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span className="text-[10px] text-slate-300">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 bg-white p-7 min-w-0">
        <div className="space-y-5">
          {rest.map((sec, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 mb-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-800">{sec.title}</p>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <SectionBlocks section={sec} accentClass="text-slate-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Template 3: Minimal ─────────────────────────────────────────────────────
// No color, ultra-clean, elegant typographic approach

function MinimalTemplate({ parsed }: { parsed: Parsed }) {
  const { name, contactLine, sections } = parsed
  const contacts = parseContact(contactLine)

  return (
    <div className="font-sans text-slate-800">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[30px] font-light tracking-wide text-slate-900 leading-none mb-3">{name}</h1>
        {contacts.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-slate-500">
            {contacts.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {CONTACT_ICONS[c.icon]}
                {c.text}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 h-px bg-slate-300" />
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map((sec, i) => {
          const isSkills = /SKILLS|COMPETENC/i.test(sec.title)
          const skills: string[] = []
          if (isSkills) {
            for (const block of sec.blocks) {
              if (block.type === 'bullets') skills.push(...block.items)
              else if (block.type === 'para') {
                const raw = block.text.includes(':') ? block.text.slice(block.text.indexOf(':') + 1) : block.text
                skills.push(...raw.split(',').map(s => s.trim()).filter(Boolean))
              }
            }
          }

          return (
            <div key={i}>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-1.5">{sec.title}</p>
              <div className="mb-2 h-px bg-slate-100" />
              {isSkills && skills.length > 0 ? (
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  {skills.join(' · ')}
                </p>
              ) : (
                <SectionBlocks section={sec} accentClass="text-slate-500" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ResumeRenderer({ text, template = 'sharp' }: { text: string; template?: Template }) {
  const parsed = parseResume(text)
  if (template === 'executive') return <ExecutiveTemplate parsed={parsed} />
  if (template === 'minimal')   return <MinimalTemplate   parsed={parsed} />
  return <SharpTemplate parsed={parsed} />
}

const TEMPLATE_OPTIONS: { id: Template; label: string; desc: string }[] = [
  { id: 'sharp',     label: 'Sharp',     desc: 'Modern & bold' },
  { id: 'executive', label: 'Executive', desc: 'Dark sidebar' },
  { id: 'minimal',   label: 'Minimal',   desc: 'Clean & elegant' },
]

export function TemplatePicker({ current, onChange }: { current: Template; onChange: (t: Template) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap print:hidden">
      <span className="text-xs font-medium text-slate-500 mr-1">Template:</span>
      {TEMPLATE_OPTIONS.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            current === t.id
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
          }`}
        >
          {t.label}
          <span className={`ml-1.5 font-normal ${current === t.id ? 'text-slate-300' : 'text-slate-400'}`}>
            {t.desc}
          </span>
        </button>
      ))}
    </div>
  )
}
