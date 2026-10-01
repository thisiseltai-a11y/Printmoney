'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginFields() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push(searchParams.get('next') || '/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-card border border-line bg-panel p-8">
      <h1 className="mb-6 font-grotesk text-xl font-semibold text-ink">Log in</h1>
      <div className="space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoFocus
          className="field-input"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="field-input"
        />
      </div>
      {error && <p className="mt-3 font-mono text-xs text-amber">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-5 h-12 w-full rounded-sm bg-amber font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Logging in…' : 'Log in'}
      </button>
      <p className="mt-4 text-center text-sm text-muted">
        No account?{' '}
        <Link href="/signup" className="text-teal hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFields />
    </Suspense>
  )
}
