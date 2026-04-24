import Link from 'next/link'
import { CheckCircle, Zap, Shield } from 'lucide-react'

const plans = [
  {
    name: 'Single',
    price: '$12',
    period: 'one-time',
    description: 'Applying to 1–2 jobs? Get a tailored resume and cover letter fast.',
    cta: 'Get Started — $12',
    href: '/order',
    popular: false,
    features: [
      '1 ATS-optimized resume',
      '1 tailored cover letter',
      'LinkedIn summary',
      'Keyword optimization',
      'Instant download',
    ],
  },
  {
    name: 'Bundle',
    price: '$29',
    period: 'one-time',
    description: 'Actively job hunting? Get 5 fully tailored applications — best value by far.',
    cta: 'Get the Bundle — $29',
    href: '/order?plan=bundle',
    popular: true,
    features: [
      '5 resume + cover letter sets',
      '5 LinkedIn summary rewrites',
      'Keyword optimization',
      'Instant download',
      '30-day revision window',
      'Best value — $5.80 per application',
    ],
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">Transparent Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            No subscriptions required.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
              Pay only for what you need.
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Professional resume writers charge $150–$800. We charge a fraction and deliver in seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? 'bg-gradient-to-b from-indigo-600 to-violet-700 border-2 border-indigo-400 shadow-2xl shadow-indigo-500/25 scale-105'
                  : 'bg-slate-800/50 border border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-xs font-bold">
                    <Zap className="w-3 h-3 fill-slate-900" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-slate-100'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-3">
                  <span className={`text-5xl font-extrabold ${plan.popular ? 'text-white' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg mb-1 ${plan.popular ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm ${plan.popular ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle
                      className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-indigo-200' : 'text-emerald-400'}`}
                    />
                    <span className={`text-sm ${plan.popular ? 'text-indigo-100' : 'text-slate-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  plan.popular
                    ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="flex items-start sm:items-center justify-center gap-3 mt-10 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 max-w-md mx-auto">
          <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-slate-300 text-sm">
            <span className="font-semibold text-white">100% money-back guarantee.</span>{' '}
            Not happy with your resume? We&apos;ll refund every penny. No questions asked.
          </p>
        </div>
      </div>
    </section>
  )
}
