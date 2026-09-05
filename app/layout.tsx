import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
})

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jbmono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'WorthCars — Instant VIN Lookup & Vehicle Value',
  description:
    'Enter any VIN and get instant free vehicle details plus an estimated market value. Unlock the full history report — accidents, title, ownership — for one flat fee.',
  keywords:
    'VIN lookup, vehicle history report, car value estimate, VIN decoder, used car value, accident history, title check',
  openGraph: {
    title: 'WorthCars — Instant VIN Lookup & Vehicle Value',
    description:
      'Free instant VIN lookup + market value estimate. Unlock the full history report when you need it.',
    type: 'website',
    url: 'https://worthcars.com',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://worthcars.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${jbMono.variable}`}>
      <body className="bg-bg text-ink font-grotesk antialiased">{children}</body>
    </html>
  )
}
