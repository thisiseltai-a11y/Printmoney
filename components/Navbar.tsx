import Link from 'next/link'
import { Gauge } from 'lucide-react'
import { getSessionUser } from '@/lib/supabase/server'
import NotificationsBell from './NotificationsBell'
import SignOutButton from './SignOutButton'

export default async function Navbar() {
  const user = await getSessionUser()

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-ink">
          <Gauge className="h-5 w-5 text-amber" strokeWidth={2.25} />
          <span className="font-grotesk text-lg font-semibold tracking-tight">
            Worth<span className="text-amber">Cars</span>
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/" className="hidden transition hover:text-ink sm:inline">
            Browse
          </Link>
          {user ? (
            <>
              <Link
                href="/sell/new"
                className="rounded-sm border border-amber/40 px-4 py-2 font-medium text-amber transition hover:bg-amber hover:text-white"
              >
                List a car
              </Link>
              <Link href="/dashboard" className="hidden transition hover:text-ink sm:inline">
                Dashboard
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
