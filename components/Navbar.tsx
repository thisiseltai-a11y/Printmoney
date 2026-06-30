'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, TrendingUp } from 'lucide-react'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/picks', label: 'Picks' },
  { href: '/tracker', label: 'Tracker' },
  { href: '/pricing', label: 'Pricing' },
]

export default function Navbar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-dim bg-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-neon flex items-center justify-center flex-shrink-0 group-hover:glow-neon transition-all">
            <TrendingUp className="w-4 h-4 text-black" strokeWidth={3} />
          </div>
          <span className="font-black text-lg tracking-tight">
            Hey<span className="text-neon">Parlay</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                path === l.href
                  ? 'text-neon bg-neon/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">
            Log in
          </Link>
          <Link
            href="/subscribe"
            className="px-4 py-2 rounded-lg bg-neon text-black text-sm font-bold hover:bg-neon/90 transition-all hover:shadow-neon"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-dim bg-card">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  path === l.href ? 'text-neon bg-neon/10' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2 pb-1 flex flex-col gap-2">
              <Link
                href="/subscribe"
                onClick={() => setOpen(false)}
                className="block text-center px-4 py-3 rounded-lg bg-neon text-black font-bold text-sm"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
