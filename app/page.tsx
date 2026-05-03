import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'

const ExitIntentPopup = dynamic(() => import('@/components/ExitIntentPopup'))
const ResumePreview = dynamic(() => import('@/components/ResumePreview'))
const HowItWorks = dynamic(() => import('@/components/HowItWorks'))
const Features = dynamic(() => import('@/components/Features'))
const Pricing = dynamic(() => import('@/components/Pricing'))
const Testimonials = dynamic(() => import('@/components/Testimonials'))
const FAQ = dynamic(() => import('@/components/FAQ'))
const Footer = dynamic(() => import('@/components/Footer'))

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://resumerocket.co/#organization',
      name: 'ResumeRocket',
      url: 'https://resumerocket.co',
      logo: 'https://resumerocket.co/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@resumerocket.co',
        contactType: 'customer support',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://resumerocket.co/#website',
      url: 'https://resumerocket.co',
      name: 'ResumeRocket',
      publisher: { '@id': 'https://resumerocket.co/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'ResumeRocket',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://resumerocket.co',
      description:
        'AI-powered resume and cover letter builder. ATS-optimized, tailored to every job, delivered in under 60 seconds.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Single Resume',
          price: '12.00',
          priceCurrency: 'USD',
          description: '1 ATS-optimized resume + cover letter',
        },
        {
          '@type': 'Offer',
          name: 'Bundle',
          price: '29.00',
          priceCurrency: 'USD',
          description: '5 resume + cover letter sets with LinkedIn summary',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '12000',
      },
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <Navbar />
        <Hero />
        <ExitIntentPopup />
        <ResumePreview />
        <HowItWorks />
        <Features />
        <Pricing />
        <Testimonials />
        <FAQ />
        <Footer />
      </main>
    </>
  )
}
