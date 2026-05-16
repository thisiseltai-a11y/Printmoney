import Link from 'next/link'
import { ArrowRight, CheckCircle, Shield, Star } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-slate-950 flex items-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center w-full">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          97% cheaper than a professional resume writer
        </div>

        {/* Headline — benefit-first with price */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
          Job-Ready Resume
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
            in 60 Seconds — $8
          </span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Paste your target job description. Our AI writes a tailored, ATS-optimized resume
          and cover letter that gets past the bots and lands you interviews.
          <span className="text-slate-300"> One-time payment. Instant download.</span>
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/order"
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-lg transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            Preview My Resume — Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="flex items-center gap-2 px-8 py-4 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl text-lg transition-all duration-200"
          >
            See How It Works
          </Link>
        </div>

        {/* Money-back guarantee */}
        <div className="flex items-start sm:items-center justify-center gap-2 mb-12 text-slate-400 text-sm max-w-xs sm:max-w-none mx-auto text-center">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span>Love your resume or we&apos;ll refund every penny — no questions asked</span>
        </div>

        {/* Social proof testimonial — right next to CTA */}
        <div className="max-w-lg mx-auto mb-14 bg-slate-900/60 border border-slate-700 rounded-2xl p-5 text-left">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            &ldquo;I applied to 12 jobs with my old resume and got 0 callbacks. Rewrote it with ResumeRocket
            and got 4 interviews in the first week. The ATS optimization is no joke.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              MT
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Marcus T.</p>
              <p className="text-slate-500 text-xs">Software Engineer · Now at Stripe</p>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400 mb-16">
          {[
            { icon: <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />, text: 'ATS Optimized' },
            { icon: <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />, text: 'Cover Letter Included' },
            { icon: <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />, text: 'LinkedIn Summary Included' },
            { icon: <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />, text: 'Money-back Guarantee' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              {icon}
              {text}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 max-w-2xl mx-auto gap-8 pt-12 border-t border-slate-800">
          {[
            { value: '12,000+', label: 'Resumes Generated' },
            { value: '94%', label: 'Interview Rate' },
            { value: '< 60s', label: 'Average Turnaround' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
