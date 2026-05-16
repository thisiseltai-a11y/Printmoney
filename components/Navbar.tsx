'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Rocket, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">ResumeRocket</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              How It Works
            </Link>
            <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
              Pricing
            </Link>
            <Link
              href="/order"
              className="text-sm px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
            >
              Build My Resume $5
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1">
          <Link href="#how-it-works" className="block text-sm text-slate-600 py-2.5" onClick={() => setOpen(false)}>
            How It Works
          </Link>
          <Link href="#features" className="block text-sm text-slate-600 py-2.5" onClick={() => setOpen(false)}>
            Features
          </Link>
          <Link href="#pricing" className="block text-sm text-slate-600 py-2.5" onClick={() => setOpen(false)}>
            Pricing
          </Link>
          <Link
            href="/order"
            className="block text-sm px-4 py-3 rounded-lg bg-indigo-600 text-white text-center font-medium mt-2"
          >
            Build My Resume $5
          </Link>
        </div>
      )}
    </nav>
  )
}
