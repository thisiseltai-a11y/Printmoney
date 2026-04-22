import Link from 'next/link'
import { Rocket } from 'lucide-react'
import OrderForm from '@/components/OrderForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build Your Resume',
  description:
    'Paste your job description and let AI write an ATS-optimized resume and cover letter tailored to the role — in under 60 seconds.',
  robots: { index: false, follow: false },
}

export default function OrderPage() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">ResumeRocket</span>
          </Link>
          <p className="text-sm text-slate-500 hidden sm:block">
            🔒 Your information is secure and never shared
          </p>
        </div>
      </header>
      <div className="pt-16">
        <OrderForm />
      </div>
    </>
  )
}
