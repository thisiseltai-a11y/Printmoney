import Link from 'next/link'
import { Rocket } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-6">
        <Rocket className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-6xl font-extrabold text-white mb-3">404</h1>
      <p className="text-xl text-slate-400 mb-2">This page doesn&apos;t exist.</p>
      <p className="text-slate-500 mb-10 max-w-sm">
        Looks like this URL went off course. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-sm transition-all"
        >
          Back to Home
        </Link>
        <Link
          href="/order"
          className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl text-sm transition-all"
        >
          Build My Resume
        </Link>
      </div>
    </div>
  )
}
