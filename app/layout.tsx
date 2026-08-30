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
  description: 'Professional listing-prep for exotic and classic car sellers. Photography, expert copy, and multi-platform posting so your car sells privately, faster, and for more. Packages from $249.',
  keywords: 'classic car listing service, exotic car photography, private car sale, classic car listing prep, collector car photography, ownthemarque',
  openGraph: {
    title: 'Own The Marque — Sell Your Classic, Your Way',
    description: 'Professional listing-prep for exotic and classic car sellers. Packages from $249.',
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
