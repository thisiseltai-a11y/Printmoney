import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Own The Marque',
  description: 'Personal buyer\'s agent for exotic and classic cars. We source the exact car you want, verify provenance, and negotiate on your behalf. One finder\'s fee, paid only when we deliver.',
  keywords: 'exotic car buyer agent, classic car finder, private car buyer, collector car acquisition, ownthemarque',
  openGraph: {
    title: 'Own The Marque — We Find the Car You Want',
    description: 'Personal buyer\'s agent for exotic and classic cars.',
    type: 'website',
    url: 'https://ownthemarque.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
