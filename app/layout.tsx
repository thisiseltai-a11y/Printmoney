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
  title: 'WorthCars — List your car, get real offers',
  description:
    'List your car with a minimum you\'ll actually consider, so every offer is worth your time. Buyers negotiate from their dashboard and get notified the moment you respond.',
  keywords: 'sell my car, car marketplace, car offers, make an offer on a car, FSBO, sell car online',
  openGraph: {
    title: 'WorthCars — List your car, get real offers',
    description: 'Set your minimum, skip the lowballs, negotiate straight from your dashboard.',
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
