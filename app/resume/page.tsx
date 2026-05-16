'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Rocket, Mail, CheckCircle, ArrowRight } from 'lucide-react'

export default function ResumeLookupPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    await fetch('/api/resend-resume-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Rocket className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-lg">ResumeRocket</span>
      </Link>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        {!submitted ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Find Your Resume</h1>
            <p className="text-slate-400 text-sm mb-8">
              Enter the email you used when you built your resume. We&apos;ll send you a link to view and download it.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send My Resume Link'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-slate-400 text-sm mb-8">
              If we have a resume saved for <span className="text-white font-medium">{email}</span>, we just sent you a link to access it.
            </p>
            <p className="text-slate-500 text-xs mb-6">Didn&apos;t get it? Check your spam folder or make sure you used the same email from your original order.</p>
            <Link
              href="/order"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Build a New Resume $5
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>

      <p className="text-slate-600 text-xs mt-8">
        Need help?{' '}
        <a href="mailto:support@resumerocket.co" className="text-slate-500 hover:text-slate-400 transition-colors">
          support@resumerocket.co
        </a>
      </p>
    </div>
  )
}
