'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import { ResumeRenderer, ACCENT_COLORS, DEFAULT_ACCENT } from '@/components/ResumeTemplates'
import type { Template } from '@/components/ResumeTemplates'

const SAMPLE = `Alex Johnson
alex@email.com · (555) 012-3456 · New York, NY · linkedin.com/in/alexjohnson

PROFESSIONAL SUMMARY
Results-driven Product Manager with 6+ years of experience leading cross-functional teams to deliver high-impact SaaS products. Proven track record of driving 40%+ revenue growth through data-informed roadmaps and agile execution at Series B and enterprise companies.

WORK EXPERIENCE
Senior Product Manager | Stripe | Jan 2022 – Present
• Launched payments dashboard used by 50,000+ merchants, reducing support tickets by 32%
• Led 0→1 product development for Stripe's invoicing API, generating $4.2M ARR in year one
• Managed roadmap across 3 engineering squads (18 engineers) using Agile/Scrum
• Increased feature adoption 28% through A/B testing and targeted onboarding flows

Product Manager | Notion | Mar 2020 – Dec 2021
• Owned collaboration features roadmap, driving 45% increase in team workspace adoption
• Partnered with design and engineering to ship 12 features on time and on budget

SKILLS
Product: Roadmapping, Agile/Scrum, A/B Testing, User Research, OKRs, PRDs
Tools: Jira, Figma, Amplitude, Mixpanel, SQL, Looker
Soft Skills: Cross-functional Leadership, Stakeholder Management, Data-Driven Decision Making`

const TEMPLATES: { id: Template; label: string }[] = [
  { id: 'sharp',     label: 'Sharp' },
  { id: 'executive', label: 'Executive' },
  { id: 'minimal',   label: 'Minimal' },
]

export default function ResumePreview() {
  const [template, setTemplate] = useState<Template>('sharp')
  const [color, setColor] = useState(DEFAULT_ACCENT)

  return (
    <section className="bg-slate-950 py-20 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-4">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Real AI output — generated in 60 seconds
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          This is what you&apos;re getting
        </h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          A clean, professional resume tailored to your exact job — not a generic template.
        </p>
      </div>

      {/* Template + color controls */}
      <div className="max-w-2xl mx-auto mb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                template === t.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-500">Color:</span>
          {ACCENT_COLORS.map(c => (
            <button
              key={c.hex}
              onClick={() => setColor(c.hex)}
              title={c.name}
              className={`w-6 h-6 rounded-full ring-offset-slate-950 transition-all ${
                color === c.hex ? 'ring-2 ring-white ring-offset-2 scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Resume card with blur fade */}
      <div className="max-w-2xl mx-auto relative">
        <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden border border-slate-200">
          <div className="p-8 sm:p-10">
            <ResumeRenderer text={SAMPLE} template={template} accentColor={color} />
          </div>
        </div>

        {/* Blur fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent rounded-b-2xl" />

        {/* CTA over the fade */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 px-4">
          <p className="text-white font-semibold text-sm">See your resume before you pay. Free preview, then $12 to unlock.</p>
          <Link
            href="/order"
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-opacity"
          >
            Preview Mine Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
