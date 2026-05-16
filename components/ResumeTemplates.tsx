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

export const ACCENT_COLORS = [
  { name: 'Navy',     hex: '#1e3a5f' },
  { name: 'Indigo',   hex: '#4338ca' },
  { name: 'Forest',   hex: '#166534' },
  { name: 'Burgundy', hex: '#881337' },
  { name: 'Black',    hex: '#0f172a' },
] as const

export const DEFAULT_ACCENT = '#1e3a5f'

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

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

function parseJobHeader(header: string) {
  const parts = header.split('|').map(p => p.trim())
  const title = parts[0]
  const datePart = parts.find(p => /\d{4}|present|current/i.test(p)) ?? ''
  const company = parts.filter(p => p !== title && p !== datePart).join(' · ')
  return { title, company, datePart }
}

interface SkillGroup { label: string; items: string[] }

function extractSkillItems(text: string): string[] {
  return text.split(/[,|]/).map(s => s.trim()).filter(Boolean)
}

function extractSkills(sections: Section[]): { skills: string[]; skillGroups: SkillGroup[]; rest: Section[] } {
  const skills: string[] = []
  const skillGroups: SkillGroup[] = []
  const rest: Section[] = []

  for (const sec of sections) {
    if (/SKILLS|COMPETENC/i.test(sec.title)) {
      for (const block of sec.blocks) {
        if (block.type === 'bullets') {
          for (const item of block.items) {
            const colonIdx = item.indexOf(':')
            if (colonIdx > -1 && colonIdx < 20) {
              const label = item.slice(0, colonIdx).trim()
              const items = extractSkillItems(item.slice(colonIdx + 1))
              skillGroups.push({ label, items })
              skills.push(...items)
            } else {
              skills.push(item)
            }
          }
        } else if (block.type === 'job') {
          const parts = block.header.split('|').map(p => p.trim()).filter(Boolean)
          for (const part of parts) {
            const raw = part.includes(':') ? part.slice(part.indexOf(':') + 1) : part
            skills.push(...extractSkillItems(raw))
          }
          if (block.bullets.length) skills.push(...block.bullets)
        } else if (block.type === 'para') {
          const colonIdx = block.text.indexOf(':')
          if (colonIdx > -1 && colonIdx < 20) {
            const label = block.text.slice(0, colonIdx).trim()
            const items = extractSkillItems(block.text.slice(colonIdx + 1))
            skillGroups.push({ label, items })
            skills.push(...items)
          } else {
            skills.push(...extractSkillItems(block.text))
          }
        }
      }
    } else {
      rest.push(sec)
    }
  }
  return { skills, skillGroups, rest }
}

// ─── Template 1: Sharp ───────────────────────────────────────────────────────

function SharpJobEntry({ entry }: { entry: JobEntry }) {
  const { title, company, datePart } = parseJobHeader(entry.header)
  return (
    <div className="mt-4 first:mt-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-bold text-slate-900">{title}</span>
        {datePart && <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">{datePart}</span>}
      </div>
      {company && <p className="text-[12px] text-slate-500 mt-0.5 italic">{company}</p>}
      {entry.bullets.length > 0 && (
        <ul className="mt-2 space-y-1">
          {entry.bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5 text-[12px] text-slate-600 leading-relaxed">
              <span className="mt-[6px] w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SharpSectionBlocks({ section }: { section: Section }) {
  return (
    <div>
      {section.blocks.map((block, i) => {
        if (block.type === 'job') return <SharpJobEntry key={i} entry={block} />
        if (block.type === 'bullets') return (
          <ul key={i} className="mt-1 space-y-1">
            {block.items.map((b, j) => (
              <li key={j} className="flex gap-2.5 text-[12px] text-slate-600 leading-relaxed">
                <span className="mt-[6px] w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )
        return <p key={i} className="text-[12px] text-slate-600 leading-relaxed mt-1">{block.text}</p>
      })}
    </div>
  )
}

function SharpTemplate({ parsed, accentColor }: { parsed: Parsed; accentColor: string }) {
  const { name, contactLine, sections } = parsed
  const contacts = parseContact(contactLine)
  const { skills, skillGroups, rest } = extractSkills(sections)

  return (
    <div className="font-sans">
      <div className="mb-5">
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900 leading-none">{name}</h1>
        {contacts.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2.5">
            {contacts.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="text-slate-400">{CONTACT_ICONS[c.icon]}</span>
                {c.text}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 h-[2px]" style={{ backgroundColor: accentColor }} />
      </div>

      {skills.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-[3px] h-3.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">Skills</p>
          </div>
          {skillGroups.length > 0 ? (
            <div className="space-y-1.5">
              {skillGroups.map((g, i) => (
                <div key={i} className="flex gap-2 items-baseline">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 w-16 flex-shrink-0 pt-0.5">{g.label}</span>
                  <div className="flex flex-wrap gap-1">
                    {g.items.map((s, j) => (
                      <span key={j} className="px-2 py-0.5 text-[11px] text-slate-700 bg-slate-100 rounded border border-slate-200">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span key={i} className="px-2.5 py-0.5 text-[11px] text-slate-700 bg-slate-100 rounded border border-slate-200">{s}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-5">
        {rest.map((sec, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-[3px] h-3.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">{sec.title}</p>
            </div>
            <SharpSectionBlocks section={sec} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Template 2: Executive ───────────────────────────────────────────────────

function ExecJobEntry({ entry }: { entry: JobEntry }) {
  const { title, company, datePart } = parseJobHeader(entry.header)
  return (
    <div className="mt-3.5 first:mt-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-bold text-slate-900">{title}</span>
        {datePart && <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">{datePart}</span>}
      </div>
      {company && <p className="text-[11px] text-slate-500 italic mt-0.5">{company}</p>}
      {entry.bullets.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {entry.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-slate-600 leading-relaxed">
              <span className="mt-[6px] w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ExecutiveTemplate({ parsed, accentColor }: { parsed: Parsed; accentColor: string }) {
  const { name, contactLine, sections } = parsed
  const contacts = parseContact(contactLine)
  const { skills, skillGroups, rest } = extractSkills(sections)
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div className="font-sans flex flex-col sm:flex-row [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
      <div className="w-full sm:w-[200px] sm:flex-shrink-0 p-6 flex flex-col gap-6" style={{ backgroundColor: accentColor }}>
        <div>
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-3"
            style={{ backgroundColor: hexToRgba('#ffffff', 0.2) }}
          >
            {initials}
          </div>
          <h1 className="text-[15px] font-bold text-white leading-snug">{name}</h1>
        </div>

        {contacts.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: hexToRgba('#ffffff', 0.6) }}>Contact</p>
            {contacts.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <span style={{ color: hexToRgba('#ffffff', 0.6) }} className="mt-px">{CONTACT_ICONS[c.icon]}</span>
                <span className="text-[10px] leading-tight break-all" style={{ color: hexToRgba('#ffffff', 0.85) }}>{c.text}</span>
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div>
            {skillGroups.length > 0 ? (
              <div className="space-y-3">
                {skillGroups.map((g, i) => (
                  <div key={i}>
                    <p className="text-[8px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: hexToRgba('#ffffff', 0.6) }}>{g.label}</p>
                    <div className="space-y-1">
                      {g.items.map((s, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: hexToRgba('#ffffff', 0.6) }} />
                          <span className="text-[10px] leading-tight" style={{ color: hexToRgba('#ffffff', 0.85) }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: hexToRgba('#ffffff', 0.6) }}>Skills</p>
                <div className="space-y-1.5">
                  {skills.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: hexToRgba('#ffffff', 0.6) }} />
                      <span className="text-[10px] leading-tight" style={{ color: hexToRgba('#ffffff', 0.85) }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 bg-white p-6 min-w-0">
        <div className="space-y-5">
          {rest.map((sec, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 mb-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700">{sec.title}</p>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div>
                {sec.blocks.map((block, j) => {
                  if (block.type === 'job') return <ExecJobEntry key={j} entry={block} />
                  if (block.type === 'bullets') return (
                    <ul key={j} className="mt-1 space-y-1">
                      {block.items.map((b, k) => (
                        <li key={k} className="flex gap-2 text-[12px] text-slate-600 leading-relaxed">
                          <span className="mt-[6px] w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )
                  return <p key={j} className="text-[12px] text-slate-600 leading-relaxed mt-1">{block.text}</p>
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Template 3: Minimal ─────────────────────────────────────────────────────

function MinimalJobEntry({ entry }: { entry: JobEntry }) {
  const { title, company, datePart } = parseJobHeader(entry.header)
  return (
    <div className="mt-4 first:mt-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[13px] font-semibold text-slate-800">{title}</span>
        {datePart && <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0 font-light">{datePart}</span>}
      </div>
      {company && <p className="text-[11px] text-slate-400 mt-0.5 font-light tracking-wide">{company}</p>}
      {entry.bullets.length > 0 && (
        <ul className="mt-2 space-y-1">
          {entry.bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-[12px] text-slate-600 leading-relaxed font-light">
              <span className="mt-[7px] w-0.5 h-0.5 rounded-full bg-slate-300 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MinimalTemplate({ parsed, accentColor }: { parsed: Parsed; accentColor: string }) {
  const { name, contactLine, sections } = parsed
  const contacts = parseContact(contactLine)

  return (
    <div className="font-sans">
      <div className="mb-7">
        <h1 className="text-[32px] font-light tracking-wide text-slate-900 leading-none mb-3">{name}</h1>
        {contacts.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {contacts.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[11px] text-slate-400 font-light">
                {CONTACT_ICONS[c.icon]}
                {c.text}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 h-px" style={{ backgroundColor: hexToRgba(accentColor, 0.25) }} />
      </div>

      <div className="space-y-6">
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
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] mb-2" style={{ color: accentColor }}>{sec.title}</p>
              <div className="h-px mb-3" style={{ backgroundColor: hexToRgba(accentColor, 0.15) }} />
              {isSkills && skills.length > 0 ? (
                <p className="text-[12px] text-slate-600 leading-relaxed font-light">
                  {skills.join('  ·  ')}
                </p>
              ) : (
                <div>
                  {sec.blocks.map((block, j) => {
                    if (block.type === 'job') return <MinimalJobEntry key={j} entry={block} />
                    if (block.type === 'bullets') return (
                      <ul key={j} className="mt-1 space-y-1">
                        {block.items.map((b, k) => (
                          <li key={k} className="flex gap-3 text-[12px] text-slate-600 leading-relaxed font-light">
                            <span className="mt-[7px] w-0.5 h-0.5 rounded-full bg-slate-300 flex-shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )
                    return <p key={j} className="text-[12px] text-slate-600 leading-relaxed font-light mt-1">{block.text}</p>
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main exports ─────────────────────────────────────────────────────────────

export function ResumeRenderer({
  text,
  template = 'sharp',
  accentColor = DEFAULT_ACCENT,
}: {
  text: string
  template?: Template
  accentColor?: string
}) {
  const parsed = parseResume(text)
  if (template === 'executive') return <ExecutiveTemplate parsed={parsed} accentColor={accentColor} />
  if (template === 'minimal')   return <MinimalTemplate   parsed={parsed} accentColor={accentColor} />
  return <SharpTemplate parsed={parsed} accentColor={accentColor} />
}

const TEMPLATES: { id: Template; label: string; desc: string }[] = [
  { id: 'sharp',     label: 'Sharp',     desc: 'Modern · ATS-safe' },
  { id: 'executive', label: 'Executive', desc: 'Dark sidebar · visual' },
  { id: 'minimal',   label: 'Minimal',   desc: 'Clean · elegant' },
]

export function TemplatePicker({ current, onChange }: { current: Template; onChange: (t: Template) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap print:hidden">
      <span className="text-xs font-medium text-slate-400 mr-1">Template:</span>
      {TEMPLATES.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            current === t.id
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
          }`}
        >
          {t.label}
          <span className="ml-1.5 font-normal text-[10px] text-slate-400">{t.desc}</span>
        </button>
      ))}
    </div>
  )
}
