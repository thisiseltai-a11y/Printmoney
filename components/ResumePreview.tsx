import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

export default function ResumePreview() {
  return (
    <section className="bg-slate-950 py-20 px-4 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-4">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Real AI output — generated in 60 seconds
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          This is what you&apos;re getting
        </h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          A clean, professional resume tailored to your exact job — not a generic template.
        </p>
      </div>

      {/* Resume card with blur fade */}
      <div className="max-w-2xl mx-auto relative">
        <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden border border-slate-200">
          <div className="p-8 sm:p-10 font-sans">

            {/* Name + contact */}
            <div className="border-b-2 border-slate-800 pb-4 mb-5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Alex Johnson</h1>
              <p className="text-sm text-slate-500 mt-1">alex@email.com · (555) 012-3456 · New York, NY · linkedin.com/in/alexjohnson</p>
            </div>

            {/* Summary */}
            <div className="mb-5">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-l-4 border-slate-800 pl-3 mb-2">Professional Summary</h2>
              <p className="text-sm text-slate-700 leading-relaxed">Results-driven Product Manager with 6+ years of experience leading cross-functional teams to deliver high-impact SaaS products. Proven track record of driving 40%+ revenue growth through data-informed roadmaps and agile execution at Series B and enterprise companies.</p>
            </div>

            {/* Experience */}
            <div className="mb-5">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-l-4 border-slate-800 pl-3 mb-3">Work Experience</h2>
              <div className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="text-sm font-semibold text-slate-900">Senior Product Manager</span>
                    <span className="text-sm text-slate-500"> · Stripe</span>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-2">Jan 2022 – Present</span>
                </div>
                <ul className="space-y-1 ml-3">
                  {['Launched payments dashboard used by 50,000+ merchants, reducing support tickets by 32%',
                    'Led 0→1 product development for Stripe\'s invoicing API, generating $4.2M ARR in year one',
                    'Managed roadmap across 3 engineering squads (18 engineers) using Agile/Scrum methodology',
                    'Increased feature adoption by 28% through A/B testing and targeted onboarding flows'].map((b, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-slate-400 flex-shrink-0">▸</span>{b}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="text-sm font-semibold text-slate-900">Product Manager</span>
                    <span className="text-sm text-slate-500"> · Notion</span>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-2">Mar 2020 – Dec 2021</span>
                </div>
                <ul className="space-y-1 ml-3">
                  {['Owned Notion\'s collaboration features roadmap, driving 45% increase in team workspace adoption',
                    'Partnered with design and engineering to ship 12 features across 4 quarters on time and on budget'].map((b, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-slate-400 flex-shrink-0">▸</span>{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-l-4 border-slate-800 pl-3 mb-3">Skills</h2>
              <div className="space-y-1.5">
                {[
                  { label: 'Product', skills: ['Roadmapping', 'Agile/Scrum', 'A/B Testing', 'User Research', 'OKRs', 'PRDs'] },
                  { label: 'Tools', skills: ['Jira', 'Figma', 'Amplitude', 'Mixpanel', 'SQL', 'Looker'] },
                  { label: 'Soft Skills', skills: ['Cross-functional Leadership', 'Stakeholder Management', 'Data-Driven Decision Making'] },
                ].map((group) => (
                  <p key={group.label} className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{group.label}:</span>{' '}
                    {group.skills.join(', ')}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Blur fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent rounded-b-2xl" />

        {/* CTA over the fade */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 px-4">
          <p className="text-white font-semibold text-sm">Your resume. Your experience. Your job. $12.</p>
          <Link
            href="/order"
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-opacity"
          >
            Build Mine Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
