import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, CheckCircle, Star, Zap, BookOpen, Brain, BarChart3, Clock } from 'lucide-react'

const SUBJECTS = [
  { name: 'Reading', icon: '📖', topics: ['Main idea', 'Inference', 'Vocabulary in context', 'Author purpose'] },
  { name: 'Math', icon: '📐', topics: ['Algebra', 'Fractions & decimals', 'Percentages', 'Statistics'] },
  { name: 'Science', icon: '🔬', topics: ['Human anatomy', 'Biology', 'Chemistry', 'Scientific reasoning'] },
  { name: 'English', icon: '✍️', topics: ['Grammar', 'Punctuation', 'Sentence structure', 'Word meaning'] },
]

const TESTIMONIALS = [
  { name: 'Jasmine R.', detail: 'Passed TEAS on first attempt', score: '89.3%', quote: 'I failed my first TEAS without prep. Used NurseEdge for 3 weeks and scored an 89. The AI explanations for wrong answers are what made the difference.' },
  { name: 'Marcus T.', detail: 'Accepted to University of Florida Nursing', score: '91.2%', quote: 'The mock exams felt exactly like the real thing. I walked in feeling prepared instead of terrified. Worth every penny.' },
  { name: 'Destiny M.', detail: 'Passed on second attempt after switching', score: '84.7%', quote: 'I tried other apps and they were just flashcards. NurseEdge actually explains WHY the answer is right or wrong. That is what you need.' },
]

export default function Home() {
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="relative min-h-screen bg-slate-950 flex items-center overflow-hidden pt-16">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              AI-Powered TEAS Prep
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              Pass the TEAS.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                Get into nursing school.
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed">
              Practice questions, full mock exams, and AI explanations that tell you exactly why you got it wrong — and how to never miss it again.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold mb-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              87% of NurseEdge students pass the TEAS on their first attempt
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/signup"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity"
              >
                Start Free — 7 Days Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-slate-500 text-sm">Then $8/month. Cancel anytime.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
              {['All 4 TEAS subjects covered', 'Unlimited practice questions', 'Full-length mock exams', 'AI explanations for every answer'].map(t => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-slate-900 border-y border-slate-800 py-12 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '87%', label: 'First-attempt pass rate' },
              { value: '10,000+', label: 'Practice questions' },
              { value: '4', label: 'Full mock exams' },
              { value: '30 days', label: 'Average prep time' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{value}</div>
                <div className="text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Subjects */}
        <section className="bg-slate-950 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Every subject. Every topic.</h2>
              <p className="text-slate-400 max-w-xl mx-auto">The TEAS covers 4 subjects. NurseEdge covers all of them with hundreds of practice questions per section.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SUBJECTS.map(s => (
                <div key={s.name} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="font-bold text-white text-lg mb-4">{s.name}</h3>
                  <ul className="space-y-2">
                    {s.topics.map(t => (
                      <li key={t} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-slate-900 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Built different from every other prep tool</h2>
              <p className="text-slate-400 max-w-xl mx-auto">Flashcards are not enough. NurseEdge teaches you to think through questions the way the test does.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Brain className="w-6 h-6" />, title: 'AI Explanations', desc: 'Every wrong answer comes with a full explanation of why it was wrong and what the right thinking process is.' },
                { icon: <BarChart3 className="w-6 h-6" />, title: 'Weakness Tracker', desc: 'NurseEdge tracks every question you answer and shows you exactly which topics need the most work.' },
                { icon: <Clock className="w-6 h-6" />, title: 'Timed Mock Exams', desc: 'Full-length practice exams that simulate the real TEAS experience — same format, same timing, same pressure.' },
                { icon: <BookOpen className="w-6 h-6" />, title: '10,000+ Questions', desc: 'A massive question bank that covers every topic and difficulty level. You will never run out of practice.' },
                { icon: <Zap className="w-6 h-6" />, title: 'AI Tutor', desc: 'Stuck on a concept? Ask the AI tutor anything and get a clear, simple explanation instantly.' },
                { icon: <CheckCircle className="w-6 h-6" />, title: 'Progress Dashboard', desc: 'See your score trends, time spent, and readiness level at a glance. Know when you are ready to book the test.' },
              ].map(f => (
                <div key={f.title} className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-slate-950 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Students who made it in</h2>
              <p className="text-slate-400">Real results from real nursing students.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {TESTIMONIALS.map(t => (
                <div key={t.name} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4">
                    TEAS Score: {t.score}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-slate-900 py-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Simple pricing</h2>
            <p className="text-slate-400 mb-10">Everything you need to pass the TEAS. No hidden fees.</p>
            <div className="bg-gradient-to-b from-blue-600 to-teal-700 rounded-3xl p-8 border border-blue-500/30 shadow-2xl shadow-blue-500/20">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-2">Full Access</p>
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-6xl font-extrabold text-white">$8</span>
                <span className="text-blue-200 text-lg mb-2">/month</span>
              </div>
              <p className="text-blue-200 text-sm mb-8">7-day free trial. Cancel anytime.</p>
              <ul className="space-y-3 mb-8 text-left">
                {[
                  'All 4 TEAS subjects',
                  '10,000+ practice questions',
                  '4 full-length mock exams',
                  'AI explanations for every answer',
                  'AI tutor — ask anything',
                  'Progress tracking & weak spot reports',
                  'New questions added weekly',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-blue-100">
                    <CheckCircle className="w-4 h-4 text-teal-300 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full py-4 rounded-2xl bg-white text-blue-700 font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start Free Trial
              </Link>
              <p className="text-blue-300 text-xs mt-4">No credit card required for trial</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-950 py-24 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
              Your nursing career starts with passing the TEAS.
            </h2>
            <p className="text-slate-400 text-lg mb-10">
              Join thousands of students who used NurseEdge to get into nursing school.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity"
            >
              Start Free — 7 Days Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-slate-500 text-sm mt-4">Then $8/month. Cancel anytime.</p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
