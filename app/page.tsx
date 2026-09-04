import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import TickerStrip from '@/components/TickerStrip'
import HowItWorks from '@/components/HowItWorks'
import ReportPreview from '@/components/ReportPreview'
import FinalCTA from '@/components/FinalCTA'
import { getTickerStats } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const stats = await getTickerStats()

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <TickerStrip initial={stats} />
      <HowItWorks />
      <ReportPreview />
      <FinalCTA />
      <Footer />
    </div>
  )
}
