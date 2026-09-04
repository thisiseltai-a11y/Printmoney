import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReportView from './ReportView'
import { normalizeVin } from '@/lib/vin'

export default function ReportPage({ params }: { params: { vin: string } }) {
  const vin = normalizeVin(params.vin)

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <Suspense fallback={<div className="text-muted">Loading…</div>}>
          <ReportView vin={vin} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
