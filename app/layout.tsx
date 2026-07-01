import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GambitParlay — Research. Analyze. Win.',
  description: 'Stop guessing. Start winning. AI-powered sports picks with tier system, bet tracker, and copy-ready posts for Threads & Telegram.',
  keywords: 'parlay, sports picks, AI sports betting, NFL picks, MLB picks, soccer picks, bet tracker',
  openGraph: {
    title: 'GambitParlay — AI-Powered Picks',
    description: 'Stop guessing. Start winning.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-dark text-white antialiased">
        {children}
      </body>
    </html>
  )
}
