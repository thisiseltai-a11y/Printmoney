import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED = ['/sell/new', '/dashboard']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const redirect = new URL('/login', req.url)
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const redirect = new URL('/login', req.url)
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  return res
}

export const config = {
  matcher: ['/sell/new', '/dashboard/:path*'],
}
