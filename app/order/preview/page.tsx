'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, Rocket, FileText, Mail, Linkedin, Loader2 } from 'lucide-react'
import { ResumeRenderer, DEFAULT_ACCENT } from '@/components/ResumeTemplates'
import type { Template } from '@/components/ResumeTemplates'
import type { GeneratedContent } from '@/lib/types'

type Tab = 'resume' | 'cover' | 'linkedin'

const PAPER_WIDTH = 794
const PAPER_HEIGHT = 1056

export default function PreviewPage() {
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('resume')
  const [template, setTemplate] = useState<Template>('sharp')
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT)
  const [loading, setLoading] = useState(false)
  const [vpWidth, setVpWidth] = useState(375)

  useEffect(() => {
    const stored = sessionStorage.getItem('resume_preview')
    if (stored) setContent(JSON.parse(stored))
    const tmpl = localStorage.getItem('selected_template') as Template
    if (tmpl) setTemplate(tmpl)
    const color = localStorage.getItem('selected_color')
    if (color) setAccentColor(color)
  }, [])

  useEffect(() => {
    setVpWidth(window.innerWidth)
    const handle = () => setVpWidth(window.innerWidth)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  const handleUnlock = async (plan: 'single' | 'bundle') => {
    setLoading(true)
    try {
      const formDataStr = localStorage.getItem('pending_form_data')
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, formData: formDataStr ? JSON.parse(formDataStr) : {} }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  if (!content) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-slate-600 mb-4">No preview found.</p>
        <Link href="/order" className="text-indigo-600 hover:underline">← Go back and fill the form</Link>
      </div>
    </div>
  )

  const firstPara = (text: string) => text.split(/\n{2,}/)[0] ?? ''

  // Horizontal padding: px-4 (16px each side) on mobile, sm:px-6 (24px) on desktop
  const hPad = vpWidth < 640 ? 32 : 48
  // Constrain to max-w-4xl (896px)
  const containerW = Math.min(vpWidth - hPad, 896 - hPad)
  const scale = Math.min(1, containerW / PAPER_WIDTH)
  const scaledHeight = Math.round(PAPER_HEIGHT * scale)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-900 hidden sm:block">ResumeRocket</span>
          </Link>
          <p className="text-sm text-slate-500 hidden sm:block">Your resume is ready to unlock</p>
          <button
            onClick={() => handleUnlock('single')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-opacity disabled:opacity-60 flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Unlock $5
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-36 sm:pb-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-5">
          {(['resume', 'cover', 'linkedin'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab === 'resume' && <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              {tab === 'cover' && <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              {tab === 'linkedin' && <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              {tab === 'resume' ? 'Resume' : tab === 'cover' ? 'Cover Letter' : 'LinkedIn'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="relative">
          {activeTab === 'resume' ? (
            /* Paper document view — full-width at 794px scaled to fit viewport */
            <div
              className="overflow-hidden rounded-2xl shadow-2xl"
              style={{ height: `${scaledHeight}px`, width: `${containerW}px` }}
            >
              <div
                style={{
                  width: `${PAPER_WIDTH}px`,
                  minHeight: `${PAPER_HEIGHT}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  backgroundColor: 'white',
                }}
              >
                <ResumeRenderer text={content.resume} template={template} accentColor={accentColor} />
              </div>
            </div>
          ) : (
            /* Cover letter / LinkedIn card view */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 sm:p-10">
                {activeTab === 'cover' && (
                  <div className="space-y-4">
                    <p className="text-[13px] text-slate-700 leading-relaxed">{firstPara(content.coverLetter)}</p>
                    <div className="space-y-4 select-none pointer-events-none" style={{ filter: 'blur(4px)' }}>
                      {content.coverLetter.split(/\n{2,}/).slice(1).map((p, i) => (
                        <p key={i} className="text-[13px] text-slate-700 leading-relaxed">{p}</p>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'linkedin' && (
                  <div className="space-y-4">
                    <p className="text-[13px] text-slate-700 leading-relaxed">{firstPara(content.linkedinSummary || '')}</p>
                    <div className="space-y-4 select-none pointer-events-none" style={{ filter: 'blur(4px)' }}>
                      {(content.linkedinSummary || '').split(/\n{2,}/).slice(1).map((p, i) => (
                        <p key={i} className="text-[13px] text-slate-700 leading-relaxed">{p}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gradient fade on resume tab */}
          {activeTab === 'resume' && (
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-50 to-transparent rounded-b-2xl pointer-events-none" />
          )}
        </div>
      </div>

      {/* Sticky bottom CTA — mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 px-4 py-4 sm:hidden">
        <button
          onClick={() => handleUnlock('single')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 text-white font-bold text-base bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/30 hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
          Unlock Everything $5
        </button>
        <p className="text-center text-xs text-slate-400 mt-2">One-time payment · Money-back guarantee</p>
      </div>

      {/* Desktop CTA below card */}
      <div className="hidden sm:block max-w-4xl mx-auto px-6 pb-12">
        <div className="flex flex-col items-center gap-3 pt-6">
          <button
            onClick={() => handleUnlock('single')}
            disabled={loading}
            className="flex items-center gap-2 px-10 py-4 text-white font-bold text-base bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/30 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            Unlock Everything $5
          </button>
          <button
            onClick={() => handleUnlock('bundle')}
            disabled={loading}
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors underline"
          >
            Applying to multiple jobs? Get 5 resumes for $29
          </button>
          <p className="text-xs text-slate-400">One-time payment · Money-back guarantee · No subscription</p>
        </div>
      </div>
    </div>
  )
}
