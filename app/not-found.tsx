import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CarFront } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber/10">
          <CarFront className="h-7 w-7 text-amber" />
        </div>
        <h1 className="font-grotesk text-2xl font-semibold text-ink">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          This listing or page doesn&apos;t exist — it may have been sold, cancelled, or the link&apos;s just wrong.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-sm bg-amber px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Browse listings
        </Link>
      </main>
      <Footer />
    </div>
  )
}
