import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Marcus T.',
    role: 'Software Engineer',
    company: 'Now at Stripe',
    avatar: 'MT',
    color: 'bg-indigo-600',
    text: 'I applied to 12 jobs with my old resume and got 0 callbacks. Rewrote it with ResumeRocket and got 4 interviews in the first week. The ATS optimization is no joke.',
  },
  {
    name: 'Sarah K.',
    role: 'Marketing Manager',
    company: 'Now at HubSpot',
    avatar: 'SK',
    color: 'bg-violet-600',
    text: "The cover letters it generates are better than anything I could write myself. Landed my dream job at a Fortune 500 company. Worth every single penny.",
  },
  {
    name: 'David M.',
    role: 'Product Manager',
    company: 'Now at Airbnb',
    avatar: 'DM',
    color: 'bg-pink-600',
    text: "Went from being ghosted to 3 interviews in 3 days. I just pasted the job description and it somehow knew exactly what to emphasize. Wild.",
  },
  {
    name: 'Priya L.',
    role: 'Data Scientist',
    company: 'Now at Meta',
    avatar: 'PL',
    color: 'bg-emerald-600',
    text: "As someone who transitions between roles often, I needed a tool I could use repeatedly. The unlimited plan pays for itself after literally one job offer.",
  },
  {
    name: 'James R.',
    role: 'Sales Director',
    company: 'Now at Salesforce',
    avatar: 'JR',
    color: 'bg-amber-600',
    text: "I was skeptical about AI writing my resume but the output read like it was written by someone who actually knew my career. Impressive technology.",
  },
  {
    name: 'Anika P.',
    role: 'UX Designer',
    company: 'Now at Figma',
    avatar: 'AP',
    color: 'bg-blue-600',
    text: "The service paid for itself 100x over. I got a 40% salary increase at my new job. This tool is genuinely one of the best career investments I've made.",
  },
]

function Stars() {
  return (
    <div className="flex gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Real Results</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            People who stopped getting ghosted
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Join thousands of professionals who upgraded their resume and landed the interviews they deserved.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-300"
            >
              <Stars />
              <p className="text-slate-700 leading-relaxed mb-6 text-sm">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
