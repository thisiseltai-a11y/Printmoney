import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const BASE_URL = 'https://resumerocket.co'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ResumeRocket — AI Resume Builder That Lands Interviews',
    template: '%s — ResumeRocket',
  },
  description:
    'Get an ATS-optimized resume and cover letter in under 60 seconds. AI-powered, tailored to every job you apply for. One-time payment from $8.',
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
      'ATS-optimized resume + cover letter in 60 seconds. AI-powered, tailored to every job. From $8.',
    url: BASE_URL,
    siteName: 'ResumeRocket',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeRocket — AI Resume Builder That Lands Interviews',
    description: 'ATS-optimized resume + cover letter in 60 seconds. From $8.',
  },
  alternates: {
    canonical: BASE_URL,
  },
}

const GA_ID = 'G-J6PBWSGJ52'
const FB_PIXEL_ID = '2245306715961540'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to third-party domains to reduce connection latency */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />

        {/* Google Analytics — kept in head for Google tag checker detection */}
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');` }} />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      </head>
      <body className={inter.className}>
        {children}

        {/* Facebook Pixel */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1" width="1" style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
    </html>
  )
}
