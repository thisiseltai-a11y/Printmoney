'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed.')
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-card border border-line bg-panel p-8">
        <div className="mb-6 flex items-center gap-2 text-ink">
          <Lock className="h-5 w-5 text-amber" />
          <span className="font-grotesk text-lg font-semibold">Admin access</span>
        </div>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="readout h-12 w-full rounded-sm border border-line bg-raised px-4 text-sm text-ink outline-none focus:border-amber"
        />
        {error && <p className="mt-2 font-mono text-xs text-amber">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 h-12 w-full rounded-sm bg-amber font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
