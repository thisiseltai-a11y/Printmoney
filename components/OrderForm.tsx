'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Rocket, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import type { ResumeFormData, WorkExperience, Education } from '@/lib/types'

const STEP_LABELS = ['Personal Info', 'Target Job', 'Experience', 'Education', 'Skills']

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

export default function OrderForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<ResumeFormData>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof ResumeFormData>(key: K, value: ResumeFormData[K]) =>
    setData((d) => ({ ...d, [key]: value }))

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

  const canNext = () => {
    if (step === 0) return data.name && data.email
    if (step === 1) return data.targetJob && data.jobDescription.length > 50
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      sessionStorage.setItem('pending_form_data', JSON.stringify(data))
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'single' }),
      })
      if (!res.ok) throw new Error('Failed to start checkout')
      const { url } = await res.json()
      window.location.href = url
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
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
                <FieldLabel required>
                  Job Description{' '}
                  <span className="font-normal text-indigo-600">— paste the full posting here</span>
                </FieldLabel>
                <Textarea
                  value={data.jobDescription}
                  onChange={(v) => set('jobDescription', v)}
                  placeholder="Paste the complete job description here. The more detail you provide, the better the AI can tailor your resume with the exact keywords the ATS is scanning for..."
                  rows={8}
                />
                <p className="text-xs text-slate-400 mt-1">
                  {data.jobDescription.length < 50 && data.jobDescription.length > 0
                    ? 'Please paste the full job description for best results.'
                    : data.jobDescription.length >= 50
                    ? `✓ ${data.jobDescription.length} characters — looking good!`
                    : 'This is the most important field. Paste the full job posting.'}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Work Experience */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Work Experience</h2>
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
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < STEP_LABELS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-7 py-3 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
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
                  Generating...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Generate My Resume
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
