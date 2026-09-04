import { NextRequest, NextResponse } from 'next/server'

// Simple password gate for /admin — there are no user accounts anywhere else
// in this app, so this is deliberately lightweight: a single shared password
// (ADMIN_PASSWORD) checked against an httpOnly cookie set by /api/admin/login.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  const cookie = req.cookies.get('admin_pw')?.value
  if (!process.env.ADMIN_PASSWORD || cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
