import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('hp_auth', '', { path: '/', maxAge: 0 })
  return res
}
