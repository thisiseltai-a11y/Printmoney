import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Star, ArrowRight, Shield, Zap, FileText } from 'lucide-react'
import { getProfession, PROFESSIONS } from '@/lib/professions'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export async function generateStaticParams() {
  return PROFESSIONS.map(p => ({ profession: p.slug }))
}

export async function generateMetadata({ params }: { params: { profession: string } }): Promise<Metadata> {
  const p = getProfession(params.profession)
  if (!p) return {}
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: `https://resumerocket.co/resume-builder/${p.slug}` },
    openGraph: {
      title: p.metaTitle,
      description: p.metaDescription,
      url: `https://resumerocket.co/resume-builder/${p.slug}`,
    },
  }
}

export default function ProfessionPage({ params }: { params: { profession: string } }) {
  const p = getProfession(params.profession)
  if (!p) notFound()

  const orderUrl = `/order?job=${encodeURIComponent(p.title)}`

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-slate-950 pt-20 pb-24 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-6">
              <span>{p.emoji}</span>
              <span>Built for {p.title}s</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight tracking-tight">
              {p.headline}
            </h1>
            <p className="text-lg text-slate-400 mb-4 max-w-xl mx-auto leading-relaxed">
              {p.subheadline}
            </p>
            <p className="text-slate-500 text-sm mb-10 max-w-lg mx-auto">
              {p.description}
            </p>

            <Link
              href={orderUrl}
              className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-8 py-4 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-opacity"
            >
              Build My Resume — $12
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </Link>
            <p className="text-slate-500 text-xs mt-4">One-time payment · No subscription · No login required</p>
          </div>
        </section>

        {/* What you get */}
        <section className="bg-slate-900 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-10">What You Get for $12</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: <FileText className="w-6 h-6" />, title: 'ATS-Optimized Resume', desc: `Tailored to ${p.title} roles with the exact keywords recruiters and ATS systems scan for.` },
                { icon: <FileText className="w-6 h-6" />, title: 'Cover Letter', desc: 'A compelling, personalized cover letter that opens with a hook — not "I am writing to apply."' },
                { icon: <FileText className="w-6 h-6" />, title: 'LinkedIn Summary', desc: 'A 3-paragraph About section that gets you found on LinkedIn and makes recruiters reach out.' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Profession-specific bullets */}
        <section className="bg-slate-950 py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-8">Built Specifically for {p.title}s</h2>
            <div className="space-y-4">
              {p.bullets.map((bullet, i) => (
                <div key={i} className="flex items-start gap-3 text-left bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="bg-slate-900 py-16 px-4">
          <div className="max-w-xl mx-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-200 text-base leading-relaxed mb-6 italic">
                &ldquo;{p.testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {p.testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{p.testimonial.name}</p>
                  <p className="text-xs text-slate-500">{p.testimonial.detail}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-slate-950 py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-10">How It Works</h2>
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              {[
                { step: '1', title: 'Fill Your Details', desc: 'Enter your experience, skills, and the job you\'re targeting. Takes about 3 minutes.' },
                { step: '2', title: 'AI Builds Your Resume', desc: `Our AI writes a ${p.title}-specific resume, cover letter, and LinkedIn summary in under 60 seconds.` },
                { step: '3', title: 'Download & Apply', desc: 'Download as PDF, copy your cover letter, and paste your LinkedIn summary. Done.' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold mx-auto mb-4`}>
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 py-20 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <Zap className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Ready to land more {p.title} interviews?
            </h2>
            <p className="text-slate-400 mb-8">
              Join thousands of job seekers who got more callbacks with ResumeRocket.
              One-time $12 — your resume in 60 seconds.
            </p>
            <Link
              href={orderUrl}
              className="inline-flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-8 py-4 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-opacity"
            >
              Build My Resume — $12
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </Link>
            <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-sm">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Love your resume or we refund every penny — no questions asked</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
