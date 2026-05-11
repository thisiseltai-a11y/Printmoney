'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, Rocket, FileText, Mail, Linkedin, Loader2 } from 'lucide-react'
import { ResumeRenderer, DEFAULT_ACCENT } from '@/components/ResumeTemplates'
import type { Template } from '@/components/ResumeTemplates'
import type { GeneratedContent } from '@/lib/types'

type Tab = 'resume' | 'cover' | 'linkedin'

export default function PreviewPage() {
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('resume')
  const [template, setTemplate] = useState<Template>('sharp')
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('resume_preview')
    if (stored) setContent(JSON.parse(stored))
    const tmpl = localStorage.getItem('selected_template') as Template
    if (tmpl) setTemplate(tmpl)
    const color = localStorage.getItem('selected_color')
    if (color) setAccentColor(color)
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-900">ResumeRocket</span>
          </Link>
          <button
            onClick={() => handleUnlock('single')}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Unlock — $12
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Banner */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6 flex items-start sm:items-center gap-4">
          <div className="text-3xl flex-shrink-0">👀</div>
          <div>
            <p className="font-bold text-indigo-900 text-sm mb-0.5">Your resume is ready — unlock it to use it</p>
            <p className="text-indigo-700 text-sm">Pay once to download, copy, and keep your resume, cover letter, and LinkedIn summary.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
          {(['resume', 'cover', 'linkedin'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab === 'resume' && <FileText className="w-4 h-4" />}
              {tab === 'cover' && <Mail className="w-4 h-4" />}
              {tab === 'linkedin' && <Linkedin className="w-4 h-4" />}
              {tab === 'resume' ? 'Resume' : tab === 'cover' ? 'Cover Letter' : 'LinkedIn'}
            </button>
          ))}
        </div>

        {/* Content card with blur */}
        <div className="relative">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 sm:p-12">
              {activeTab === 'resume' && (
                <ResumeRenderer text={content.resume} template={template} accentColor={accentColor} />
              )}
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

          {/* Gradient blur overlay — only on resume tab */}
          {activeTab === 'resume' && (
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-white via-white/95 to-transparent rounded-b-2xl pointer-events-none" />
          )}

          {/* Lock CTA */}
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3 px-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Lock className="w-4 h-4" />
              <span>Unlock to copy, download, and use your resume</span>
            </div>
            <button
              onClick={() => handleUnlock('single')}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 text-white font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/30 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Unlock Resume + Cover Letter + LinkedIn — $12
            </button>
            <button
              onClick={() => handleUnlock('bundle')}
              disabled={loading}
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors underline"
            >
              Applying to multiple jobs? Get 5 resumes for $29
            </button>
            <p className="text-xs text-slate-400">One-time payment. Money-back guarantee. No subscription.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
