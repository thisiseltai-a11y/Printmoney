'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  Copy, Download, CheckCircle, ArrowLeft, Rocket,
  FileText, Mail, Loader2, Linkedin,
  RefreshCw, Send,
} from 'lucide-react'
import type { GeneratedContent } from '@/lib/types'
import { ResumeRenderer, TemplatePicker } from '@/components/ResumeTemplates'
import type { Template } from '@/components/ResumeTemplates'

// Resume rendering is handled by components/ResumeTemplates.tsx

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

// ─── Page ───────────────────────────────────────────────────────────────────

type Tab = 'resume' | 'cover' | 'linkedin'

export default function ResultPage() {
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('resume')
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [bundleUrl, setBundleUrl] = useState('')
  const [bundleUsesRemaining, setBundleUsesRemaining] = useState(0)
  const [template, setTemplate] = useState<Template>('sharp')
  const emailSentRef = useRef(false)

  const saveAndEmail = async (result: GeneratedContent, formDataStr: string) => {
    if (emailSentRef.current) return
    try {
      const formData = JSON.parse(formDataStr)

      // Save to Supabase and get magic link
      let resumeUrl: string | undefined
      try {
        const saveRes = await fetch('/api/save-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            resume: result.resume,
            coverLetter: result.coverLetter,
            linkedinSummary: result.linkedinSummary,
          }),
        })
        if (saveRes.ok) {
          const { url } = await saveRes.json()
          resumeUrl = url
        }
      } catch { /* non-blocking */ }

      // Send email with magic link
      const res = await fetch('/api/send-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          resume: result.resume,
          coverLetter: result.coverLetter,
          linkedinSummary: result.linkedinSummary,
          resumeUrl,
        }),
      })
      if (res.ok) {
        emailSentRef.current = true
        setEmailSent(true)
      }
    } catch { /* email is bonus, don't surface errors */ }
  }

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const sessionId = params.get('session_id')
      const plan = params.get('plan')
      const isBundleSession = sessionId?.startsWith('bundle:')

      if (!sessionId) {
        const stored = sessionStorage.getItem('resume_result')
        if (stored) setContent(JSON.parse(stored))
        return
      }

      setGenerating(true)
      try {
        if (!isBundleSession) {
          // Verify Stripe payment for normal purchases
          const verifyRes = await fetch(`/api/verify-payment?session_id=${sessionId}`)
          if (!verifyRes.ok) {
            const body = await verifyRes.json().catch(() => ({}))
            const rawMsg = body.error || ''
            const isSessionGone = rawMsg.toLowerCase().includes('no such checkout') || rawMsg.toLowerCase().includes('no such session')
            throw new Error(
              isSessionGone
                ? 'Your payment session has expired. Please start a new order — your card was not charged.'
                : rawMsg || `Payment verification failed (${verifyRes.status})`
            )
          }
        }

        // Get form data: localStorage (same session) or server (cross-device fallback)
        let formDataStr = localStorage.getItem('pending_form_data')
        if (!formDataStr && !isBundleSession) {
          const fdRes = await fetch(`/api/get-form-data?session_id=${sessionId}`)
          if (fdRes.ok) {
            const { formData } = await fdRes.json()
            if (formData) formDataStr = JSON.stringify(formData)
          }
        } else if (!isBundleSession) {
          // Clean up server record even when localStorage was available
          fetch(`/api/get-form-data?session_id=${sessionId}`).catch(() => {})
        }
        if (!formDataStr) throw new Error('Form data not found. Please go back and fill the form again.')

        // Save form data to sessionStorage so regenerate works after localStorage is cleared
        sessionStorage.setItem('resume_form_data', formDataStr)

        // After a real bundle purchase, create bundle credits for the remaining 4 resumes
        if (plan === 'bundle' && !isBundleSession) {
          try {
            const btRes = await fetch('/api/create-bundle-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: formDataStr,
            })
            if (btRes.ok) {
              const { bundleUrl: url } = await btRes.json()
              if (url) setBundleUrl(url)
              setBundleUsesRemaining(4)
            }
          } catch { /* non-blocking */ }
        }

        const genRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: formDataStr,
        })

        const result = await genRes.json()
        if (!genRes.ok || result.error) throw new Error(result.error || `Generation failed (${genRes.status})`)
        if (!result.resume) throw new Error('Resume missing from AI response. Please try again.')

        setContent(result)
        sessionStorage.setItem('resume_result', JSON.stringify(result))

        // Save to Supabase + send email with magic link
        await saveAndEmail(result, formDataStr)
        localStorage.removeItem('pending_form_data')
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setGenerating(false)
      }
    }
    run()
  }, [])

  const handleRegenerate = async () => {
    const formDataStr = localStorage.getItem('pending_form_data') ||
      sessionStorage.getItem('resume_form_data')
    if (!formDataStr) {
      setError('Form data is no longer available. Please go back and fill the form again.')
      return
    }
    setRegenerating(true)
    setError('')
    try {
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: formDataStr,
      })
      const result = await genRes.json()
      if (!genRes.ok || result.error) throw new Error(result.error || 'Generation failed')
      setContent(result)
      sessionStorage.setItem('resume_result', JSON.stringify(result))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Regeneration failed. Please try again.')
    } finally {
      setRegenerating(false)
    }
  }

  const handleCopy = async () => {
    const text = activeTab === 'resume'
      ? content?.resume
      : activeTab === 'cover'
      ? content?.coverLetter
      : content?.linkedinSummary
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleResendEmail = async () => {
    if (!content) return
    setSendingEmail(true)
    try {
      const stored = sessionStorage.getItem('resume_result')
      const formStr = localStorage.getItem('pending_form_data')
      const email = prompt('Enter your email address:')
      if (!email) return
      const name = stored ? JSON.parse(stored).name ?? '' : ''
      await fetch('/api/send-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, resume: content.resume, coverLetter: content.coverLetter, linkedinSummary: content.linkedinSummary }),
      })
      setEmailSent(true)
    } finally {
      setSendingEmail(false)
    }
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

  const tabLabel = activeTab === 'resume' ? 'Resume' : activeTab === 'cover' ? 'Cover Letter' : 'LinkedIn Summary'

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
              {copied ? <><CheckCircle className="w-4 h-4 text-emerald-500" />Copied!</> : <><Copy className="w-4 h-4" />Copy</>}
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />Save as PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-0">
        {/* Success banner */}
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6 print:hidden">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-800">Your documents are ready!</p>
            <p className="text-sm text-emerald-700">
              {emailSent
                ? 'A copy has been sent to your email.'
                : 'Copy the text or save as PDF — we\'ll email you a copy too.'}
            </p>
          </div>
          {!emailSent && (
            <button
              onClick={handleResendEmail}
              disabled={sendingEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              {sendingEmail ? 'Sending...' : 'Email me a copy'}
            </button>
          )}
        </div>

        {/* Bundle credits banner */}
        {bundleUrl && (
          <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl mb-6 print:hidden">
            <div className="text-xl">🎟️</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-indigo-800">You have {bundleUsesRemaining} more resumes in your bundle!</p>
              <p className="text-sm text-indigo-700 mb-2">Bookmark your personal bundle link — use it any time, no payment needed.</p>
              <a
                href={bundleUrl}
                className="text-sm font-medium text-indigo-600 underline break-all"
              >
                {bundleUrl}
              </a>
              <p className="text-xs text-indigo-500 mt-1">We also sent this to your email.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6 print:hidden">
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'resume' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-4 h-4" />Resume
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'cover' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Mail className="w-4 h-4" />Cover Letter
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'linkedin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Linkedin className="w-4 h-4" />LinkedIn
          </button>
        </div>

        {/* Template picker — only shown on resume tab */}
        {activeTab === 'resume' && (
          <div className="mb-4">
            <TemplatePicker current={template} onChange={setTemplate} />
          </div>
        )}

        {/* Content card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm print:shadow-none print:border-none print:rounded-none">
          <div className="p-8 sm:p-12 print:p-8">
            {activeTab === 'resume' && <ResumeRenderer text={content.resume} template={template} />}
            {activeTab === 'cover' && <CoverLetterRenderer text={content.coverLetter} />}
            {activeTab === 'linkedin' && <LinkedInRenderer text={content.linkedinSummary || 'LinkedIn summary not available. Try regenerating.'} />}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <Link href="/order" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />New resume
            </Link>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleCopy} className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Copy className="w-4 h-4" />Copy {tabLabel}
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
