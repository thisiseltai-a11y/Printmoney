'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Wand2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { normalizeVin } from '@/lib/vin'

export default function NewListingForm() {
  const router = useRouter()

  const [vin, setVin] = useState('')
  const [decoding, setDecoding] = useState(false)
  const [decodeMsg, setDecodeMsg] = useState('')

  const [year, setYear] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [trim, setTrim] = useState('')
  const [mileage, setMileage] = useState('')
  const [description, setDescription] = useState('')
  const [askingPrice, setAskingPrice] = useState('')
  const [minimumOffer, setMinimumOffer] = useState('')

  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleAutoFill() {
    const clean = normalizeVin(vin)
    if (clean.length !== 17) {
      setDecodeMsg('VIN must be 17 characters.')
      return
    }
    setDecoding(true)
    setDecodeMsg('')
    try {
      const res = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: clean }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not look up this VIN.')
      setYear(data.decoded.year || '')
      setMake(data.decoded.make || '')
      setModel(data.decoded.model || '')
      setTrim(data.decoded.trim || '')
      setDecodeMsg('Filled in from the VIN — double-check before posting.')
    } catch (err: any) {
      setDecodeMsg(err.message)
    } finally {
      setDecoding(false)
    }
  }

  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in.')

      const uploaded: string[] = []
      for (const file of files.slice(0, 12 - photos.length)) {
        const path = `${user.id}/${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('listing-photos').upload(path, file)
        if (error) throw error
        const { data } = supabase.storage.from('listing-photos').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
      setPhotos((prev) => [...prev, ...uploaded])
    } catch (err: any) {
      setError(err.message || 'Photo upload failed.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: vin ? normalizeVin(vin) : undefined,
          year,
          make,
          model,
          trim,
          mileage,
          description,
          askingPrice,
          minimumOffer,
          photos,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not create listing.')
      router.push(`/listings/${data.listing.id}`)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection step="01" title="Vehicle details">
        <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted">
          VIN (optional — auto-fills the fields below)
        </label>
        <div className="flex gap-3">
          <input
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            maxLength={17}
            placeholder="1HGCM82633A004352"
            className="readout h-12 flex-1 rounded-sm border border-line bg-raised px-4 text-sm text-ink outline-none focus:border-amber"
          />
          <button
            type="button"
            onClick={handleAutoFill}
            disabled={decoding}
            className="flex h-12 shrink-0 items-center gap-2 rounded-sm border border-teal/40 px-4 text-sm text-teal transition hover:bg-teal hover:text-bg disabled:opacity-60"
          >
            {decoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Auto-fill
          </button>
        </div>
        {decodeMsg && <p className="mt-2 font-mono text-xs text-muted">{decodeMsg}</p>}

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Year">
            <input value={year} onChange={(e) => setYear(e.target.value)} className="field-input" />
          </Field>
          <Field label="Make" className="col-span-2 sm:col-span-1">
            <input value={make} onChange={(e) => setMake(e.target.value)} required className="field-input" />
          </Field>
          <Field label="Model" className="col-span-2 sm:col-span-1">
            <input value={model} onChange={(e) => setModel(e.target.value)} required className="field-input" />
          </Field>
          <Field label="Trim">
            <input value={trim} onChange={(e) => setTrim(e.target.value)} className="field-input" />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Mileage">
            <input
              value={mileage}
              onChange={(e) => setMileage(e.target.value.replace(/[^0-9]/g, ''))}
              className="field-input"
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Condition, history, recent service, why you're selling…"
              className="field-input resize-y"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection step="02" title="Photos">
        <div className="flex flex-wrap gap-3">
          {photos.map((p) => (
            <div key={p} className="relative h-20 w-24 overflow-hidden rounded-sm border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(p)}
                className="absolute right-1 top-1 rounded-full bg-bg/80 p-0.5 text-ink"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-24 cursor-pointer items-center justify-center rounded-sm border border-dashed border-line text-xs text-muted transition hover:border-amber/40 hover:text-ink">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add photo'}
            <input type="file" accept="image/*" multiple hidden onChange={handlePhotoUpload} disabled={uploading} />
          </label>
        </div>
      </FormSection>

      <FormSection step="03" title="Pricing">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Asking price ($)">
            <input
              type="number"
              required
              min={1}
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              className="field-input"
            />
          </Field>
          <Field label="Minimum offer you'll consider ($)">
            <input
              type="number"
              required
              min={1}
              value={minimumOffer}
              onChange={(e) => setMinimumOffer(e.target.value)}
              className="field-input"
            />
          </Field>
        </div>
        <p className="mt-3 font-mono text-xs text-muted">
          Buyers see this minimum on the listing — offers below it are rejected automatically.
        </p>
      </FormSection>

      {error && <p className="font-mono text-xs text-amber">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-amber font-semibold text-bg transition hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post listing'}
      </button>
    </form>
  )
}

function FormSection({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-panel p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-grotesk text-base font-semibold text-ink">{title}</h2>
        <span className="font-mono text-xs text-muted">{step}</span>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted">{label}</label>
      {children}
    </div>
  )
}
