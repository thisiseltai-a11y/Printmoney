import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-dim bg-card mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-neon flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-black" strokeWidth={3} />
              </div>
              <span className="font-black tracking-tight">Hey<span className="text-neon">Parlay</span></span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed">
              AI-Powered Picks.<br />Research Backed. No Cap.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Product</p>
            <div className="space-y-2">
              {[['Dashboard', '/dashboard'], ['Picks', '/picks'], ['Tracker', '/tracker'], ['Pricing', '/pricing']].map(([l, h]) => (
                <Link key={h} href={h} className="block text-sm text-white/50 hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Legal</p>
            <div className="space-y-2">
              <p className="text-sm text-white/50">Terms of Service</p>
              <p className="text-sm text-white/50">Privacy Policy</p>
              <p className="text-sm text-white/50">Responsible Gaming</p>
            </div>
          </div>
        </div>
        <div className="border-t border-dim pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">© 2025 HeyParlay. For entertainment purposes only. Must be 21+.</p>
          <p className="text-xs text-white/25">Please gamble responsibly. If you need help: 1-800-522-4700</p>
        </div>
      </div>
    </footer>
  )
}
