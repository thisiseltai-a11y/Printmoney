import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/picks', '/tracker']

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))

  if (!isProtected) return NextResponse.next()

  // Coming back from Stripe — grant access and stamp the cookie
  if (searchParams.get('subscribed') === '1') {
    const res = NextResponse.next()
    res.cookies.set('hp_auth', '1', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return res
  }

  const session = req.cookies.get('hp_auth')
  if (!session?.value) {
    return NextResponse.redirect(new URL('/subscribe', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/picks/:path*', '/tracker/:path*'],
}
