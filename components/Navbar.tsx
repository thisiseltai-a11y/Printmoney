import Link from 'next/link'
import { Gauge } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-ink">
          <Gauge className="h-5 w-5 text-amber" strokeWidth={2.25} />
          <span className="font-grotesk text-lg font-semibold tracking-tight">
            Worth<span className="text-amber">Cars</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
          <Link href="/#how-it-works" className="transition hover:text-ink">
            How it works
          </Link>
          <Link href="/#report-preview" className="transition hover:text-ink">
            Sample report
          </Link>
          <Link href="/#lookup" className="rounded-sm border border-amber/40 px-4 py-2 font-medium text-amber transition hover:bg-amber hover:text-bg">
            Check a VIN
          </Link>
        </nav>
        <Link
          href="/#lookup"
          className="rounded-sm border border-amber/40 px-3 py-1.5 text-sm font-medium text-amber sm:hidden"
        >
          Check VIN
        </Link>
      </div>
    </header>
  )
}
