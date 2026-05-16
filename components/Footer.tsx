import Link from 'next/link'
import { Rocket } from 'lucide-react'

const links = {
  Product: [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Reviews', href: '/#testimonials' },
  ],
  'Get Started': [
    { label: 'Build My Resume $5', href: '/order' },
    { label: 'Resume + 5 Applications', href: '/order?plan=bundle' },
    { label: 'View My Saved Resume', href: '/resume' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">ResumeRocket</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              AI-powered resumes and cover letters that get past ATS and land you interviews. Fast.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">© {new Date().getFullYear()} ResumeRocket. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="mailto:support@resumerocket.co" className="text-sm text-slate-600 hover:text-slate-400 transition-colors">
              support@resumerocket.co
            </a>
            <p className="text-sm text-slate-600">Made with ♥ for job seekers everywhere</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
