'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import ArcGauge from '@/components/ArcGauge'
import ValueBand from '@/components/ValueBand'
import LockedReportCard from '@/components/LockedReportCard'
import HistoryReportCard from '@/components/HistoryReportCard'
import ComparablesCard from '@/components/ComparablesCard'
import type { DecodedVehicle } from '@/lib/nhtsa'
import type { ValuationResult } from '@/lib/valuation'
import type { HistoryReport } from '@/lib/vehicleHistory'

export default function ReportView({ vin }: { vin: string }) {
  const searchParams = useSearchParams()

  const [decoding, setDecoding] = useState(true)
  const [decodeError, setDecodeError] = useState('')
  const [decoded, setDecoded] = useState<DecodedVehicle | null>(null)

  const [mileage, setMileage] = useState('')
  const [valuationLoading, setValuationLoading] = useState(false)
  const [valuationError, setValuationError] = useState('')
  const [valuation, setValuation] = useState<ValuationResult | null>(null)

  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const [retrieving, setRetrieving] = useState(false)
  const [retrieveError, setRetrieveError] = useState('')
  const [unlockedReport, setUnlockedReport] = useState<HistoryReport | null>(null)

  useEffect(() => {
    setDecoding(true)
    fetch('/api/decode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vin }),
    })
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || 'Decode failed.')
        setDecoded(data.decoded)
      })
      .catch((e) => setDecodeError(e.message))
      .finally(() => setDecoding(false))
  }, [vin])

  // Coming back from a successful Stripe checkout — verify the session and
  // generate/fetch the report immediately rather than waiting on the webhook.
  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) return
    setRetrieving(true)
    fetch('/api/checkout/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || 'Could not verify payment.')
        setUnlockedReport(data.report)
      })
      .catch((e) => setRetrieveError(e.message))
      .finally(() => setRetrieving(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function getValuation() {
    if (!decoded) return
    const mi = Number(mileage)
    if (!Number.isFinite(mi) || mi < 0) {
      setValuationError('Enter a valid mileage.')
      return
    }
    setValuationLoading(true)
    setValuationError('')
    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin,
          mileage: mi,
          year: decoded.year,
          make: decoded.make,
          model: decoded.model,
          trim: decoded.trim,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Valuation failed.')
      setValuation(data)
    } catch (e: any) {
      setValuationError(e.message)
    } finally {
      setValuationLoading(false)
    }
  }

  async function startUnlock(email: string) {
    setUnlocking(true)
    setUnlockError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not start checkout.')
      window.location.href = data.url
    } catch (e: any) {
      setUnlockError(e.message)
      setUnlocking(false)
    }
  }

  async function retrieveReport(email: string) {
    setRetrieving(true)
    setRetrieveError('')
    try {
      const res = await fetch(`/api/report?vin=${vin}&email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (!res.ok || !data.report) throw new Error(data.error || 'No report found for that VIN + email.')
      setUnlockedReport(data.report)
    } catch (e: any) {
      setRetrieveError(e.message)
    } finally {
      setRetrieving(false)
    }
  }

  if (decoding) {
    return (
      <div className="flex items-center gap-3 rounded-card border border-line bg-panel p-8 text-muted">
        <Loader2 className="h-5 w-5 animate-spin text-amber" />
        <span className="readout text-sm">Decoding {vin}…</span>
      </div>
    )
  }

  if (decodeError || !decoded) {
    return (
      <div className="flex items-start gap-3 rounded-card border border-amber/40 bg-panel p-8">
        <AlertCircle className="h-5 w-5 shrink-0 text-amber" />
        <div>
          <p className="text-ink">{decodeError || 'Could not decode this VIN.'}</p>
          <p className="mt-1 text-sm text-muted">Double-check the VIN and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-line bg-panel p-6">
        <div className="mb-5 flex items-center justify-between">
          <span className="readout text-xs text-muted">{vin}</span>
          <span className="font-grotesk text-lg font-semibold text-ink">
            {decoded.year} {decoded.make} {decoded.model}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Trim" value={decoded.trim || '—'} />
          <Field label="Body Type" value={decoded.bodyType || '—'} />
          <Field label="Engine" value={decoded.engine || '—'} />
          <Field label="Drive Type" value={decoded.driveType || '—'} />
        </div>
      </div>

      <div className="rounded-card border border-line bg-panel p-6">
        <h3 className="mb-4 font-grotesk text-lg font-semibold text-ink">Estimated Market Value</h3>
        {!valuation ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={mileage}
              onChange={(e) => setMileage(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Current mileage"
              className="readout h-12 flex-1 rounded-sm border border-line bg-raised px-4 text-sm text-ink outline-none focus:border-amber"
            />
            <button
              onClick={getValuation}
              disabled={valuationLoading}
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-sm bg-amber px-6 font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
            >
              {valuationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Value Estimate'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ArcGauge pct={Math.min(100, (Number(mileage) / 150000) * 100)} label="Mileage" value={`${(Number(mileage) / 1000).toFixed(1)}k`} color="#3ED9C0" />
            <div className="flex-1">
              <div className="mb-2 font-mono text-3xl font-semibold text-amber">
                ${valuation.estimate.toLocaleString()}
              </div>
              <ValueBand low={valuation.low} estimate={valuation.estimate} high={valuation.high} />
              {valuation.source === 'demo' && (
                <p className="mt-2 font-mono text-xs text-muted">
                  Demo estimate — connect a live valuation provider key for real market data.
                </p>
              )}
            </div>
          </div>
        )}
        {valuationError && <p className="mt-3 font-mono text-xs text-amber">{valuationError}</p>}
      </div>

      {valuation && <ComparablesCard comparables={valuation.comparables} />}

      {retrieving && !unlockedReport && (
        <div className="flex items-center gap-3 rounded-card border border-line bg-panel p-6 text-muted">
          <Loader2 className="h-5 w-5 animate-spin text-teal" />
          <span className="readout text-sm">Verifying payment…</span>
        </div>
      )}

      {unlockedReport && <HistoryReportCard report={unlockedReport} />}

      {!unlockedReport && !retrieving && valuation && (
        <LockedReportCard
          onUnlock={startUnlock}
          onRetrieve={retrieveReport}
          unlocking={unlocking}
          retrieving={retrieving}
          error={unlockError || retrieveError}
        />
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 text-sm text-ink">{value}</div>
    </div>
  )
}
