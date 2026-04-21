import { ClipboardList, Cpu, Download } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Tell Us About Yourself',
    description:
      'Fill out our guided form with your work experience, education, and skills. Paste the job description for the role you want — this is the secret weapon for ATS.',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    numColor: 'text-indigo-100',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'AI Does the Heavy Lifting',
    description:
      'Our AI analyzes the job description, extracts the exact keywords ATS systems scan for, and crafts a polished resume and cover letter tailored to that specific role.',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
    numColor: 'text-violet-100',
  },
  {
    number: '03',
    icon: Download,
    title: 'Download & Apply',
    description:
      'Get your resume and cover letter instantly. Copy to clipboard, print to PDF, or paste directly into any application. Start applying in minutes, not days.',
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50',
    numColor: 'text-pink-100',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Simple Process</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            From blank page to job-ready{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              in three steps
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            No writing experience needed. No hours wasted staring at a blank document.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center px-4">
              <div className={`absolute -top-2 left-0 text-8xl font-black ${step.numColor} select-none leading-none`}>
                {step.number}
              </div>
              <div className="relative pt-8">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.iconBg} mb-6`}
                >
                  <step.icon className={`w-7 h-7 ${step.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
