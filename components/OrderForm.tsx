'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Trash2, Rocket, ChevronRight, ChevronLeft, Loader2, CheckCircle, Upload, FileText, X } from 'lucide-react'
import type { ResumeFormData, WorkExperience, Education } from '@/lib/types'
import type { Template } from '@/components/ResumeTemplates'
import { ACCENT_COLORS, DEFAULT_ACCENT } from '@/components/ResumeTemplates'
import FormResumePreview from '@/components/FormResumePreview'

const STEP_LABELS = ['Personal Info', 'Target Job', 'Experience', 'Education', 'Skills', 'Choose Style']

const emptyExp = (): WorkExperience => ({
  id: crypto.randomUUID(),
  company: '',
  title: '',
  startDate: '',
  endDate: '',
  current: false,
  responsibilities: '',
})

const emptyEdu = (): Education => ({
  id: crypto.randomUUID(),
  school: '',
  degree: '',
  field: '',
  graduationYear: '',
  gpa: '',
})

const initialData: ResumeFormData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  portfolio: '',
  targetJob: '',
  targetCompany: '',
  jobDescription: '',
  experience: [emptyExp()],
  education: [emptyEdu()],
  technicalSkills: '',
  softSkills: '',
  certifications: '',
  languages: '',
  existingResume: '',
}

function ExistingResumeUpload({ value, onChange, onAutoFill }: { value: string; onChange: (v: string) => void; onAutoFill?: (fields: Partial<ResumeFormData>) => void }) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPaste, setShowPaste] = useState(false)
  const [extracting, setExtracting] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    setSuccess(false)
    const inputEl = e.target
    try {
      let text = ''
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const arrayBuffer = await file.arrayBuffer()
        text = new TextDecoder().decode(arrayBuffer)
      } else {
        const arrayBuffer = await file.arrayBuffer()
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
        const pages: string[] = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pages.push(content.items.map((item: any) => item.str ?? '').join(' '))
        }
        text = pages.join('\n')
      }
      if (!text.trim()) {
        setError('Could not read text from this file. Try pasting your resume instead.')
        setUploading(false)
        return
      }
      onChange(text)
      setFileName(file.name)
      setUploading(false)
      if (onAutoFill) {
        setExtracting(true)
        try {
          const res = await fetch('/api/extract-resume-fields', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          })
          const data = await res.json()
          if (res.ok && data.fields) {
            const fields = data.fields
            if (fields.experience) fields.experience = fields.experience.map((e: { id?: string } & Record<string, unknown>) => ({ ...e, id: crypto.randomUUID() }))
            if (fields.education) fields.education = fields.education.map((e: { id?: string } & Record<string, unknown>) => ({ ...e, id: crypto.randomUUID() }))
            onAutoFill(fields)
            setSuccess(true)
          } else {
            setError('Auto-fill failed. Your resume was saved — fill in your details manually.')
          }
        } catch {
          setError('Auto-fill failed. Your resume was saved — fill in your details manually.')
        } finally {
          setExtracting(false)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Try pasting your resume instead.')
      setUploading(false)
    } finally {
      inputEl.value = ''
    }
  }

  const clear = () => { onChange(''); setFileName(''); setError(''); setSuccess(false) }

  return (
    <div className="mt-2 pt-5 border-t border-slate-100">
      <div className="flex items-center justify-between mb-1">
        <FieldLabel>Already have a resume? <span className="font-normal text-slate-400">optional</span></FieldLabel>
        {!fileName && (
          <button type="button" onClick={() => setShowPaste(p => !p)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            {showPaste ? 'Upload instead' : 'Paste instead'}
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-3">Upload your old resume and we&apos;ll auto-fill your info and use it to make your new one more accurate.</p>
      {fileName ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-sm text-emerald-800 font-medium flex-1 truncate">{fileName}</span>
            <button type="button" onClick={clear} className="text-emerald-600 hover:text-emerald-800"><X className="w-4 h-4" /></button>
          </div>
          {extracting && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-100">
              <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin flex-shrink-0" />
              <span className="text-xs text-indigo-700 font-medium">Filling in your info automatically...</span>
            </div>
          )}
          {success && !extracting && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-emerald-700 font-medium">Info filled in! Scroll up to check your details.</span>
            </div>
          )}
        </div>
      ) : showPaste ? (
        <Textarea value={value} onChange={onChange} placeholder="Paste your existing resume text here..." rows={6} />
      ) : (
        <label className={`flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${uploading ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
          {uploading ? <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /> : <Upload className="w-6 h-6 text-slate-400" />}
          <span className="text-sm font-medium text-slate-600">{uploading ? 'Reading your resume...' : 'Tap to upload PDF or TXT'}</span>
          <span className="text-xs text-slate-400">PDF or TXT files supported</span>
          <input type="file" accept=".pdf,.txt" onChange={handleFile} className="hidden" disabled={uploading} />
        </label>
      )}
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
    </div>
  )
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
    />
  )
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm resize-none"
    />
  )
}

function OrderFormInner() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'single'
  const bundleToken = searchParams.get('bundle_token')
  const prefilledJob = searchParams.get('job') || ''
  const isBundle = plan === 'bundle' || !!bundleToken

  const [step, setStep] = useState(0)
  const [data, setData] = useState<ResumeFormData>({ ...initialData, targetJob: prefilledJob })
  const [template, setTemplate] = useState<Template>('sharp')
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stepError, setStepError] = useState('')

  const set = <K extends keyof ResumeFormData>(key: K, value: ResumeFormData[K]) => {
    setStepError('')
    setData((d) => ({ ...d, [key]: value }))
  }

  const updateExp = (id: string, field: keyof WorkExperience, value: string | boolean) =>
    setData((d) => ({
      ...d,
      experience: d.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }))

  const updateEdu = (id: string, field: keyof Education, value: string) =>
    setData((d) => ({
      ...d,
      education: d.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }))

  const addExp = () => setData((d) => ({ ...d, experience: [...d.experience, emptyExp()] }))
  const removeExp = (id: string) =>
    setData((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== id) }))

  const addEdu = () => setData((d) => ({ ...d, education: [...d.education, emptyEdu()] }))
  const removeEdu = (id: string) =>
    setData((d) => ({ ...d, education: d.education.filter((e) => e.id !== id) }))

  const validate = (): string => {
    if (step === 0) {
      if (!data.name.trim()) return 'Full name is required.'
      if (!data.email.trim()) return 'Email address is required.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return 'Please enter a valid email address.'
    }
    if (step === 1) {
      if (!data.targetJob.trim()) return 'Please enter the job title you\'re applying for.'
    }
    if (step === 2) {
      if (!data.experience.some((e) => e.title.trim())) return 'Please add at least one job title in your work experience.'
    }
    if (step === 4) {
      if (!data.technicalSkills.trim()) return 'Please list at least a few technical skills so we can tailor your resume.'
    }
    return ''
  }

  const handleNext = () => {
    const err = validate()
    if (err) { setStepError(err); return }
    setStepError('')
    setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setStepError(err); return }
    setStepError('')
    setLoading(true)
    setError('')
    try {
      localStorage.setItem('pending_form_data', JSON.stringify(data))
      localStorage.setItem('selected_template', template)
      localStorage.setItem('selected_color', accentColor)

      if (bundleToken) {
        // Redeeming a bundle credit — skip Stripe
        const res = await fetch('/api/use-bundle-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: bundleToken, formData: data }),
        })
        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error || 'Invalid bundle token')
        }
        const { sessionId } = await res.json()
        window.location.href = `/order/result?session_id=${sessionId}`
      } else {
        // Generate resume first, then show preview before payment
        const genRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await genRes.json()
        if (!genRes.ok || result.error) throw new Error(result.error || 'Generation failed. Please try again.')
        sessionStorage.setItem('resume_preview', JSON.stringify(result))
        window.location.href = '/order/preview'
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12 pb-28 sm:pb-12 lg:flex lg:gap-10 lg:items-start">
      <div className="flex-1 min-w-0">
        {/* Free preview banner */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 text-sm">
          <span className="text-emerald-600 font-bold flex-shrink-0">FREE</span>
          <p className="text-emerald-800">Fill in your details and we&apos;ll generate a free preview of your resume. Pay only if you love it.</p>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">
              Step {step + 1} of {STEP_LABELS.length}
            </span>
            <span className="text-sm font-semibold text-indigo-600">{STEP_LABELS[step]}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>Full Name</FieldLabel>
                  <Input value={data.name} onChange={(v) => set('name', v)} placeholder="Jane Doe" />
                </div>
                <div>
                  <FieldLabel required>Email</FieldLabel>
                  <Input value={data.email} onChange={(v) => set('email', v)} placeholder="jane@email.com" type="email" />
                </div>
                <div>
                  <FieldLabel>Phone</FieldLabel>
                  <Input value={data.phone} onChange={(v) => set('phone', v)} placeholder="+1 (555) 000-0000" type="tel" />
                </div>
                <div>
                  <FieldLabel>Location</FieldLabel>
                  <Input value={data.location} onChange={(v) => set('location', v)} placeholder="San Francisco, CA" />
                </div>
                <div>
                  <FieldLabel>LinkedIn URL</FieldLabel>
                  <Input value={data.linkedin} onChange={(v) => set('linkedin', v)} placeholder="linkedin.com/in/janedoe" />
                </div>
                <div>
                  <FieldLabel>Portfolio / Website</FieldLabel>
                  <Input value={data.portfolio} onChange={(v) => set('portfolio', v)} placeholder="janedoe.com" />
                </div>
              </div>
              <ExistingResumeUpload
                value={data.existingResume}
                onChange={(v) => set('existingResume', v)}
                onAutoFill={(fields) => setData(d => ({ ...d, ...fields }))}
              />
            </div>
          )}

          {/* Step 1: Target Job */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Target Job</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>Job Title You&#39;re Applying For</FieldLabel>
                  <Input value={data.targetJob} onChange={(v) => set('targetJob', v)} placeholder="Senior Product Manager" />
                </div>
                <div>
                  <FieldLabel>Company Name (optional)</FieldLabel>
                  <Input value={data.targetCompany} onChange={(v) => set('targetCompany', v)} placeholder="Acme Corp" />
                </div>
              </div>
              <div>
                <FieldLabel>
                  Job Description{' '}
                  <span className="font-normal text-slate-400">— optional but recommended</span>
                </FieldLabel>
                <Textarea
                  value={data.jobDescription}
                  onChange={(v) => set('jobDescription', v)}
                  placeholder="Paste the job posting here for a more tailored resume. Open the listing, copy all the text, and paste it. On mobile: hold down in the job posting → Select All → Copy, then come back and paste here."
                  rows={8}
                />
                <p className="text-xs text-slate-400 mt-1">
                  {data.jobDescription.length >= 50
                    ? `✓ ${data.jobDescription.length} characters — your resume will be highly tailored`
                    : data.jobDescription.length > 0
                    ? 'Keep going — more detail means better ATS keyword matching'
                    : 'Skipping this? No problem — we\'ll tailor your resume based on your job title.'}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Work Experience */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Work Experience</h2>
              <p className="text-sm text-slate-500 mb-6">For best results, include 2–3 positions. Part-time, freelance, and volunteer work all count.</p>
              <div className="space-y-6">
                {data.experience.map((exp, i) => (
                  <div key={exp.id} className="border border-slate-200 rounded-xl p-5 relative">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        Position {i + 1}
                      </span>
                      {data.experience.length > 1 && (
                        <button
                          onClick={() => removeExp(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Job Title</FieldLabel>
                        <Input value={exp.title} onChange={(v) => updateExp(exp.id, 'title', v)} placeholder="Software Engineer" />
                      </div>
                      <div>
                        <FieldLabel>Company</FieldLabel>
                        <Input value={exp.company} onChange={(v) => updateExp(exp.id, 'company', v)} placeholder="Acme Corp" />
                      </div>
                      <div>
                        <FieldLabel>Start Date</FieldLabel>
                        <Input value={exp.startDate} onChange={(v) => updateExp(exp.id, 'startDate', v)} placeholder="Jan 2022" />
                      </div>
                      <div>
                        <FieldLabel>End Date</FieldLabel>
                        <div className="space-y-2">
                          <Input
                            value={exp.current ? '' : exp.endDate}
                            onChange={(v) => updateExp(exp.id, 'endDate', v)}
                            placeholder="Dec 2024"
                          />
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateExp(exp.id, 'current', e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-600">Currently working here</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <FieldLabel>Key Responsibilities & Achievements</FieldLabel>
                      <Textarea
                        value={exp.responsibilities}
                        onChange={(v) => updateExp(exp.id, 'responsibilities', v)}
                        placeholder="Describe your role, key projects, and achievements. Include numbers where possible (e.g., 'Increased revenue by 30%', 'Led team of 8 engineers', 'Reduced load time by 40%')..."
                        rows={4}
                      />
                      <p className="text-xs text-slate-400 mt-1.5">Not sure what to write? Don&apos;t worry — we&apos;ll do it for you.</p>
                    </div>
                  </div>
                ))}
                {data.experience.length < 4 && (
                  <button
                    onClick={addExp}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Position
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Education */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Education</h2>
              <div className="space-y-6">
                {data.education.map((edu, i) => (
                  <div key={edu.id} className="border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        Degree {i + 1}
                      </span>
                      {data.education.length > 1 && (
                        <button
                          onClick={() => removeEdu(edu.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FieldLabel>School / University</FieldLabel>
                        <Input value={edu.school} onChange={(v) => updateEdu(edu.id, 'school', v)} placeholder="University of California, Berkeley" />
                      </div>
                      <div>
                        <FieldLabel>Degree</FieldLabel>
                        <Input value={edu.degree} onChange={(v) => updateEdu(edu.id, 'degree', v)} placeholder="Bachelor of Science" />
                      </div>
                      <div>
                        <FieldLabel>Field of Study</FieldLabel>
                        <Input value={edu.field} onChange={(v) => updateEdu(edu.id, 'field', v)} placeholder="Computer Science" />
                      </div>
                      <div>
                        <FieldLabel>Graduation Year</FieldLabel>
                        <Input value={edu.graduationYear} onChange={(v) => updateEdu(edu.id, 'graduationYear', v)} placeholder="2022" />
                      </div>
                      <div>
                        <FieldLabel>GPA (optional)</FieldLabel>
                        <Input value={edu.gpa} onChange={(v) => updateEdu(edu.id, 'gpa', v)} placeholder="3.8" />
                      </div>
                    </div>
                  </div>
                ))}
                {data.education.length < 3 && (
                  <button
                    onClick={addEdu}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Degree
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Skills */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Skills & Extras</h2>
              <div>
                <FieldLabel required>Technical Skills</FieldLabel>
                <Textarea
                  value={data.technicalSkills}
                  onChange={(v) => set('technicalSkills', v)}
                  placeholder="Python, JavaScript, React, SQL, AWS, Docker, Figma, Salesforce, Excel..."
                  rows={3}
                />
              </div>
              <div>
                <FieldLabel>Soft Skills</FieldLabel>
                <Textarea
                  value={data.softSkills}
                  onChange={(v) => set('softSkills', v)}
                  placeholder="Leadership, cross-functional collaboration, public speaking, stakeholder management..."
                  rows={3}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Certifications</FieldLabel>
                  <Input value={data.certifications} onChange={(v) => set('certifications', v)} placeholder="AWS Certified, PMP, CPA..." />
                </div>
                <div>
                  <FieldLabel>Languages</FieldLabel>
                  <Input value={data.languages} onChange={(v) => set('languages', v)} placeholder="English (native), Spanish (fluent)..." />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">{error}</div>
              )}
            </div>
          )}

          {/* Step 5: Choose Style */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Style</h2>
              <p className="text-sm text-slate-500 mb-6">Pick the resume design that fits your industry best. You can switch after too.</p>
              <div className="space-y-4">
                {([
                  {
                    id: 'sharp' as Template,
                    name: 'Sharp',
                    desc: 'Bold navy accents, strong section headers. Best for corporate, finance, and management roles.',
                    preview: ['█████████████████████', '── EXPERIENCE ────────', '▸ Led team of 12 engineers', '▸ Increased revenue 40%', '', '── SKILLS ────────────', 'Python · SQL · Leadership'],
                  },
                  {
                    id: 'executive' as Template,
                    name: 'Executive',
                    desc: 'Dark sidebar with grouped skills. Best for senior, director, and executive roles.',
                    preview: ['█ NAME          ██████', '█ Skills        Role 1', '█ ─────────     ──────', '█ Python        Led 50+', '█ Leadership    Built $2M', '█ Strategy      pipeline'],
                  },
                  {
                    id: 'minimal' as Template,
                    name: 'Minimal',
                    desc: 'Clean and light with hairline rules. Best for tech, creative, and modern workplaces.',
                    preview: ['Name', '─────────────────────', 'Experience', 'Role · Company · 2023', 'Delivered X, achieved Y', '', 'Skills', 'Python · React · SQL'],
                  },
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                      template === t.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Mini preview */}
                      <div className="flex-shrink-0 w-32 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[6px] leading-relaxed text-slate-600 shadow-sm">
                        {t.preview.map((line, i) => (
                          <div key={i} className={line.startsWith('──') || line.startsWith('─') ? 'text-slate-400' : line.startsWith('█') ? 'text-slate-800' : ''}>{line || ' '}</div>
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{t.name}</span>
                          {template === t.id && <CheckCircle className="w-4 h-4 text-indigo-500" />}
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Color picker */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-700 mb-3">Accent Color</p>
                <div className="flex items-center gap-3">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setAccentColor(c.hex)}
                      title={c.name}
                      className={`w-9 h-9 rounded-full ring-offset-2 transition-all ${
                        accentColor === c.hex ? 'ring-2 ring-indigo-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                  <span className="text-xs text-slate-400 ml-1">
                    {ACCENT_COLORS.find(c => c.hex === accentColor)?.name}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {stepError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-start gap-2">
            <span className="mt-0.5">⚠</span>
            <span>{stepError}</span>
          </div>
        )}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 z-20 flex items-center justify-between sm:static sm:bg-transparent sm:border-0 sm:px-0 sm:py-0 sm:mt-4">
          <button
            onClick={() => { setStepError(''); setStep((s) => s - 1) }}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < STEP_LABELS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-7 py-3 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {bundleToken ? 'Generating...' : 'Building your resume...'}
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  {bundleToken ? 'Generate My Resume (Bundle)' : 'Preview My Resume — Free'}
                </>
              )}
            </button>
          )}
        </div>
        {step === STEP_LABELS.length - 1 && (
          <p className="text-center text-xs text-slate-400 mt-3">
            Not happy?{' '}
            <a href="/refund" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-400 underline">
              100% money-back guarantee.
            </a>
          </p>
        )}
      </div>

      {/* Live preview panel — desktop only */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <FormResumePreview data={data} />
      </div>

    </div>
    </div>
  )
}

export default function OrderForm() {
  return (
    <Suspense>
      <OrderFormInner />
    </Suspense>
  )
}
