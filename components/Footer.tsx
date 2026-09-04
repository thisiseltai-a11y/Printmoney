import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} WorthCars. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/terms" className="transition hover:text-ink">
            Terms
          </Link>
          <Link href="/privacy" className="transition hover:text-ink">
            Privacy
          </Link>
          <Link href="/admin" className="transition hover:text-ink">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
