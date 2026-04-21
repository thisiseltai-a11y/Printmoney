import { Target, FileText, Zap, RefreshCw, Shield, Award } from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'ATS Keyword Optimization',
    description:
      'We parse the job description and weave the exact keywords recruiters program into their ATS — dramatically increasing your match score.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: FileText,
    title: 'Cover Letter Included',
    description:
      'Every order includes a fully personalized cover letter that opens with a hook, connects your experience to the role, and ends with a clear CTA.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description:
      'No waiting 3–5 business days for a human writer. Your polished, professional resume is ready in under 60 seconds.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: RefreshCw,
    title: 'Unlimited Revisions',
    description:
      'Not quite right? Tweak your inputs, change the target role, and regenerate instantly. Iterate until it\'s perfect.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description:
      'Your personal information is never sold, shared, or used to train AI models. We take your data seriously.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Award,
    title: 'Recruiter-Approved Format',
    description:
      'Clean, professional layouts that hiring managers actually want to read. No gimmicks, no graphics — just impactful content.',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Everything You Need</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Built to get you hired
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Every feature is designed around one goal: getting you more callbacks.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bg} mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
