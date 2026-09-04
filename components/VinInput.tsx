'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeVin } from '@/lib/vin'
import { ArrowRight } from 'lucide-react'

export default function VinInput({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter()
  const [vin, setVin] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const clean = normalizeVin(vin)
    if (clean.length !== 17) {
      setError('VIN must be exactly 17 characters')
      return
    }
    setError('')
    router.push(`/report/${clean}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={vin}
          onChange={(e) => {
            setVin(e.target.value.toUpperCase())
            if (error) setError('')
          }}
          maxLength={17}
          autoFocus={autoFocus}
          placeholder="1HGCM82633A004352"
          className="readout h-14 flex-1 rounded-sm border border-line bg-panel px-4 text-lg text-ink outline-none transition focus:border-amber focus:ring-1 focus:ring-amber/40"
          aria-label="Vehicle Identification Number"
        />
        <button
          type="submit"
          className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-sm bg-amber px-7 font-semibold text-bg transition hover:opacity-90 active:scale-[0.98]"
        >
          Check Now — Free
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex justify-between px-1 font-mono text-xs">
        <span className={error ? 'text-amber' : 'text-muted'}>{error || 'No signup required · free decode + value estimate'}</span>
        <span className="text-muted">{vin.length}/17</span>
      </div>
    </form>
  )
}
