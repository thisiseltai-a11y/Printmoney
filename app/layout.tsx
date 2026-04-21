import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ResumeRocket — AI-Powered Resumes That Land Interviews',
  description:
    'Get an ATS-optimized resume and cover letter in under 60 seconds. AI-powered, professionally written, tailored to every job you apply for.',
  keywords:
    'AI resume builder, ATS optimized resume, cover letter generator, resume writing service, AI resume writer',
  openGraph: {
    title: 'ResumeRocket — AI-Powered Resumes That Land Interviews',
    description:
      'Get an ATS-optimized resume and cover letter in under 60 seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
