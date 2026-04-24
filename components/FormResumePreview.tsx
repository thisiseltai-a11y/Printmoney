'use client'
import type { ResumeFormData } from '@/lib/types'

const PlaceholderLine = ({ width = 'w-full', light = false }: { width?: string; light?: boolean }) => (
  <div className={`h-2.5 rounded-full ${light ? 'bg-slate-100' : 'bg-slate-200'} ${width} animate-pulse`} />
)

export default function FormResumePreview({ data }: { data: ResumeFormData }) {
  const hasName = data.name.trim().length > 0
  const hasContact = data.email.trim().length > 0
  const hasJob = data.targetJob.trim().length > 0
  const hasExp = data.experience.some(e => e.title.trim() || e.company.trim())
  const hasSkills = data.technicalSkills.trim().length > 0

  return (
    <div className="hidden lg:block w-full sticky top-8">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-3">Live Preview</p>

      <div className="relative bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Resume content */}
        <div className="p-6 text-left" style={{ fontSize: '11px' }}>

          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-3 mb-3">
            {hasName ? (
              <div className="text-base font-bold text-slate-900 leading-tight">{data.name}</div>
            ) : (
              <PlaceholderLine width="w-40" />
            )}
            <div className="mt-1.5">
              {hasContact ? (
                <div className="text-slate-500" style={{ fontSize: '9px' }}>
                  {[data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(' · ')}
                </div>
              ) : (
                <PlaceholderLine width="w-64" light />
              )}
            </div>
          </div>

          {/* Summary — always AI generated, show placeholder */}
          <div className="mb-3">
            <div className="text-[9px] font-bold text-slate-800 uppercase tracking-widest border-l-4 border-slate-800 pl-2 mb-1.5">
              Professional Summary
            </div>
            <div className="space-y-1.5">
              <PlaceholderLine light />
              <PlaceholderLine width="w-5/6" light />
              <PlaceholderLine width="w-4/6" light />
            </div>
            <div className="mt-1 text-[8px] text-indigo-400 italic">AI will write this for you</div>
          </div>

          {/* Experience */}
          <div className="mb-3">
            <div className="text-[9px] font-bold text-slate-800 uppercase tracking-widest border-l-4 border-slate-800 pl-2 mb-2">
              Work Experience
            </div>
            {hasExp ? (
              data.experience.filter(e => e.title || e.company).map((exp, i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-slate-900">{exp.title || '—'}</span>
                      {exp.company && <span className="text-slate-500"> · {exp.company}</span>}
                    </div>
                    <span className="text-slate-400" style={{ fontSize: '8px' }}>
                      {exp.startDate}{exp.startDate ? ' –' : ''} {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="space-y-1 mt-1 ml-2">
                    <PlaceholderLine width="w-full" light />
                    <PlaceholderLine width="w-5/6" light />
                    <PlaceholderLine width="w-4/6" light />
                  </div>
                  <div className="mt-0.5 text-[7px] text-indigo-400 italic">AI will write your bullet points</div>
                </div>
              ))
            ) : (
              <div className="space-y-1">
                <PlaceholderLine width="w-48" />
                <PlaceholderLine light />
                <PlaceholderLine width="w-5/6" light />
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="mb-2">
            <div className="text-[9px] font-bold text-slate-800 uppercase tracking-widest border-l-4 border-slate-800 pl-2 mb-1.5">
              Skills
            </div>
            {hasSkills ? (
              <div className="space-y-1">
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">Technical: </span>
                  {data.technicalSkills.slice(0, 60)}{data.technicalSkills.length > 60 ? '...' : ''}
                </div>
                <PlaceholderLine width="w-5/6" light />
                <PlaceholderLine width="w-4/6" light />
              </div>
            ) : (
              <div className="space-y-1">
                <PlaceholderLine light />
                <PlaceholderLine width="w-4/6" light />
              </div>
            )}
          </div>

          {/* Target job badge */}
          {hasJob && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="text-[8px] text-indigo-500 font-medium">
                Targeting: <span className="font-semibold">{data.targetJob}{data.targetCompany ? ` at ${data.targetCompany}` : ''}</span>
              </div>
            </div>
          )}
        </div>

        {/* Blur fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />

        {/* Bottom label */}
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <p className="text-[10px] font-semibold text-slate-500">Complete resume generated after payment</p>
          <div className="flex justify-center gap-1 mt-1">
            {['Resume', 'Cover Letter', 'LinkedIn'].map(item => (
              <span key={item} className="text-[8px] px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded-full border border-indigo-100">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
