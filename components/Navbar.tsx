import Link from 'next/link'
import { Gauge, LayoutDashboard } from 'lucide-react'
import { getSessionUser } from '@/lib/supabase/server'
import NotificationsBell from './NotificationsBell'
import SignOutButton from './SignOutButton'

export default async function Navbar() {
  const user = await getSessionUser()

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-ink">
          <Gauge className="h-5 w-5 text-amber" strokeWidth={2.25} />
          <span className="font-grotesk text-lg font-semibold tracking-tight">
            Worth<span className="text-amber">Cars</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm text-muted sm:gap-5">
          <Link href="/#browse" className="hidden transition hover:text-ink sm:inline">
            Browse
          </Link>
          {user ? (
            <>
              <Link
                href="/sell/new"
                className="rounded-sm border border-amber/40 px-3 py-2 text-xs font-medium text-amber transition hover:bg-amber hover:text-white sm:px-4 sm:text-sm"
              >
                List a car
              </Link>
              <Link href="/dashboard" aria-label="Dashboard" className="flex items-center transition hover:text-ink">
                <LayoutDashboard className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <NotificationsBell />
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="transition hover:text-ink">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-sm border border-amber/40 px-4 py-2 font-medium text-amber transition hover:bg-amber hover:text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
