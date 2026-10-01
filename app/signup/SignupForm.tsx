'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.session) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setCheckEmail(true)
      setLoading(false)
    }
  }

  if (checkEmail) {
    return (
      <div className="w-full max-w-sm rounded-card border border-line bg-panel p-8 text-center">
        <h1 className="font-grotesk text-xl font-semibold text-ink">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          We sent a confirmation link to {email}. Click it to finish signing up.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-card border border-line bg-panel p-8">
      <h1 className="mb-6 font-grotesk text-xl font-semibold text-ink">Sign up</h1>
      <div className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          autoFocus
          className="field-input"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="field-input"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (6+ characters)"
          className="field-input"
        />
      </div>
      {error && <p className="mt-3 font-mono text-xs text-amber">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-5 h-12 w-full rounded-sm bg-amber font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Signing up…' : 'Sign up'}
      </button>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-teal hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
