'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, Download, CheckCircle, ArrowLeft, Rocket, FileText, Mail, Loader2 } from 'lucide-react'
import type { GeneratedContent } from '@/lib/types'

// ---------- Resume renderer ----------

function ResumeRenderer({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let nameWritten = false

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.trim()

    if (!line) {
      elements.push(<div key={i} className="h-2" />)
      continue
    }

    // First non-empty line = candidate name
    if (!nameWritten) {
      nameWritten = true
      elements.push(
        <h1 key={i} className="text-3xl font-bold text-slate-900 tracking-tight print:text-2xl">
          {line}
        </h1>
      )
      continue
    }

    // Section headers: ALL CAPS, letters/spaces/& only, 3+ chars
    if (
      line === line.toUpperCase() &&
      line.length >= 3 &&
      /^[A-Z0-9\s&\/\-–]+$/.test(line)
    ) {
      elements.push(
        <div key={i} className="mt-6 mb-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600 border-b-2 border-indigo-100 pb-1">
            {line}
          </h2>
        </div>
      )
      continue
    }

    // Job/edu entry lines: "Title | Company | Dates" or "Degree | School | Year"
    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim())
      elements.push(
        <div key={i} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-3">
          <span className="text-sm font-semibold text-slate-900">{parts[0]}</span>
          {parts.slice(1).map((p, j) => (
            <span key={j} className="text-xs text-slate-500">
              {j === 0 ? '·' : '·'} {p}
            </span>
          ))}
        </div>
      )
      continue
    }

    // Bullet points
    if (/^[•\-–·*]/.test(line)) {
      elements.push(
        <div key={i} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed ml-1 mt-1">
          <span className="text-indigo-400 mt-0.5 flex-shrink-0 text-xs">▸</span>
          <span>{line.replace(/^[•\-–·*]\s*/, '')}</span>
        </div>
      )
      continue
    }

    // Contact info line (contains @ or linkedin or common separators)
    if (!nameWritten || i <= 3) {
      elements.push(
        <p key={i} className="text-sm text-slate-500 mt-1">{line}</p>
      )
      continue
    }

    // Default: paragraph text
    elements.push(
      <p key={i} className="text-sm text-slate-700 leading-relaxed mt-1">{line}</p>
    )
  }

  return <div className="space-y-0">{elements}</div>
}

function CoverLetterRenderer({ text }: { text: string }) {
  const paragraphs = text.split('\n').reduce<string[][]>((acc, line) => {
    if (!line.trim()) {
      acc.push([])
    } else {
      if (!acc.length) acc.push([])
      acc[acc.length - 1].push(line.trim())
    }
    return acc
  }, [[]])

  return (
    <div className="space-y-4">
      {paragraphs.map((group, i) => {
        const content = group.join(' ')
        if (!content) return null
        return (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">
            {content}
          </p>
        )
      })}
    </div>
  )
}

// ---------- Main page ----------

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

  const handlePrint = () => window.print()

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-6">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Writing your resume...</h2>
          <p className="text-slate-500">Payment confirmed. AI is crafting your documents now.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link href="/order" className="text-indigo-600 hover:underline">← Go back and try again</Link>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No resume found.</p>
          <Link href="/order" className="text-indigo-600 hover:underline">← Go back and generate one</Link>
        </div>
      </div>
    )
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
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {copied ? <><CheckCircle className="w-4 h-4 text-emerald-500" />Copied!</> : <><Copy className="w-4 h-4" />Copy</>}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
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
            <p className="text-sm text-emerald-700">ATS-optimized and tailored to your target role. Copy the text or save as PDF.</p>
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

        {/* Resume/Cover Letter card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm print:shadow-none print:border-none print:rounded-none">
          <div className="p-8 sm:p-12 print:p-8">
            {activeTab === 'resume'
              ? <ResumeRenderer text={content.resume} />
              : <CoverLetterRenderer text={content.coverLetter} />
            }
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
            <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl transition-all shadow-md shadow-indigo-500/20">
              <Download className="w-4 h-4" />Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
