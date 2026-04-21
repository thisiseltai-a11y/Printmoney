import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = 'https://resumerocket.co'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ResumeRocket — AI Resume Builder That Lands Interviews',
    template: '%s — ResumeRocket',
  },
  description:
    'Get an ATS-optimized resume and cover letter in under 60 seconds. AI-powered, tailored to every job you apply for. One-time payment from $12.',
  keywords:
    'AI resume builder, ATS optimized resume, cover letter generator, resume writing service, AI resume writer, resume builder online, job application resume',
  authors: [{ name: 'ResumeRocket' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: 'ResumeRocket — AI Resume Builder That Lands Interviews',
    description:
      'ATS-optimized resume + cover letter in 60 seconds. AI-powered, tailored to every job. From $12.',
    url: BASE_URL,
    siteName: 'ResumeRocket',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeRocket — AI Resume Builder That Lands Interviews',
    description: 'ATS-optimized resume + cover letter in 60 seconds. From $12.',
  },
  alternates: {
    canonical: BASE_URL,
  },
}

const GA_ID = 'G-J6PBWSGJ52'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  )
}
