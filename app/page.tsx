import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Features from '@/components/Features'
import Pricing from '@/components/Pricing'
import Testimonials from '@/components/Testimonials'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

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
        {
          '@type': 'Offer',
          name: 'Unlimited',
          price: '19.00',
          priceCurrency: 'USD',
          description: 'Unlimited resumes and cover letters per month',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            billingDuration: 'P1M',
          },
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
