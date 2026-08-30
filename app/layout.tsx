import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://nurseedge.co'),
  title: {
    default: 'NurseEdge — TEAS Prep That Gets You In',
    template: '%s — NurseEdge',
  },
  description: 'AI-powered TEAS exam prep. Practice questions, mock exams, and instant explanations. 87% of NurseEdge students pass on their first attempt.',
  keywords: 'TEAS test prep, TEAS exam practice questions, nursing school entrance exam, ATI TEAS prep, TEAS study guide, HESI prep, NCLEX prep',
  authors: [{ name: 'NurseEdge' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'NurseEdge — TEAS Prep That Gets You In',
    description: 'AI-powered TEAS exam prep. 87% of students pass on their first attempt.',
    siteName: 'NurseEdge',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
