import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Check, ChevronRight, Zap, Lock, TrendingUp } from 'lucide-react'

function GameCardPreview({
  home, away, time, locked, pick, conf,
}: {
  home: string; away: string; time: string
  locked: boolean; pick?: string; conf?: number
}) {
  return (
    <div className="bg-card border border-dim rounded-2xl overflow-hidden">
      <div className="px-4 pt-3.5 pb-3 flex items-center gap-2">
        <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border text-white/40 bg-white/5 border-white/10">
          World Cup
        </span>
        <span className="text-[11px] font-medium text-white/40 font-mono">{time}</span>
      </div>
      <div className="px-4 pb-3.5 flex items-center gap-2.5">
        <div className="flex-1">
          <div className="text-[15px] font-black tracking-tight text-white">{home}</div>
        </div>
        <span className="text-[11px] font-bold text-white/20">VS</span>
        <div className="flex-1 text-right">
          <div className="text-[15px] font-black tracking-tight text-white">{away}</div>
        </div>
      </div>
      {locked ? (
        <div className="mx-4 mb-3.5 rounded-xl px-4 py-3 flex items-center justify-between"
          style={{ background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #252525' }}>
              <Lock className="w-3.5 h-3.5 text-white/30" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-white/30">Members Only</div>
              <div className="text-[9px] text-white/20 mt-0.5">Pick + full analysis</div>
            </div>
          </div>
          <span className="text-[10px] font-black text-neon px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(124,252,0,0.10)', border: '1px solid rgba(124,252,0,0.20)' }}>
            Unlock
          </span>
        </div>
      ) : (
        <div className="mx-4 mb-3.5 rounded-xl p-3"
          style={{ background: 'rgba(124,252,0,0.08)', border: '1px solid rgba(124,252,0,0.18)' }}>
          <div className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: 'rgba(124,252,0,0.6)' }}>
            Our Pick
          </div>
          <div className="text-[15px] font-black text-white">{pick}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded border bg-emerald-500/12 text-emerald-400 border-emerald-500/20">
              Tier 1
            </span>
            <div className="flex-1">
              <div className="flex justify-between mb-0.5">
                <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Confidence</span>
                <span className="text-[10px] font-black text-neon font-mono">{conf}%</span>
              </div>
              <div className="h-[3px] bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-neon rounded-full" style={{ width: `${conf}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-dark bg-grid pt-20 pb-28 px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/20 text-neon text-xs font-bold tracking-widest uppercase mb-6">
                <Zap className="w-3 h-3" />
                Research · Analyze · Win
              </div>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-5">
                Every game.<br />
                <span className="text-neon">Every pick.</span><br />
                Fully researched.
              </h1>
              <p className="text-lg text-white/55 leading-relaxed mb-8 max-w-lg">
                GambitParlay pulls live data from ESPN and runs it through AI analysis — giving you pick recommendations, confidence scores, injury context, and team form for every game, every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/subscribe"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-neon text-black font-bold text-base hover:bg-neon/90 transition-all hover:shadow-neon"
                >
                  Get Started Free
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center px-6 py-4 rounded-xl border border-dim text-white/60 font-semibold text-base hover:border-neon/30 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </div>
              <p className="text-xs text-white/25">No credit card required · Free tier available</p>
            </div>

            {/* Right — game card preview */}
            <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
              {/* Unlocked card */}
              <GameCardPreview
                home="🇫🇷 France"
                away="🇵🇹 Portugal"
                time="3:00 PM ET"
                locked={false}
                pick="France — Draw No Bet"
                conf={81}
              />
              {/* Locked card */}
              <GameCardPreview
                home="🇧🇷 Brazil"
                away="🇦🇷 Argentina"
                time="6:00 PM ET"
                locked={true}
              />
              <div className="text-center text-[11px] text-white/25">
                Members see the full pick · Free users see the schedule
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 px-4 border-t border-dim">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-bold text-neon tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="text-4xl font-black tracking-tight mb-14">Research done for you.</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  icon: <TrendingUp className="w-5 h-5 text-neon" />,
                  title: 'Live ESPN Data',
                  desc: "Every day we pull today's schedule directly from ESPN — teams, records, and game times across World Cup, MLB, NFL, NBA, and NHL.",
                },
                {
                  icon: <Zap className="w-5 h-5 text-neon" />,
                  title: 'AI Analysis',
                  desc: 'Claude AI analyzes team form, head-to-head history, injuries, home/away splits, and more — then generates a pick with a confidence score.',
                },
                {
                  icon: <Lock className="w-5 h-5 text-neon" />,
                  title: 'Members Get Everything',
                  desc: 'Free users see the schedule. Members unlock the full pick, analysis, confidence rating, and key factors for every game.',
                },
              ].map((s, i) => (
                <div key={i}>
                  <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center mx-auto mb-4">
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT YOU GET ── */}
        <section className="py-24 px-4 bg-card border-t border-b border-dim">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-neon tracking-widest uppercase mb-3">Members Get</p>
              <h2 className="text-4xl font-black tracking-tight">Everything you need to decide.</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Pick Recommendation', desc: 'Moneyline, spread, or total — whichever the AI has most edge on.' },
                { title: 'Confidence Score', desc: 'A percentage showing how strong the edge is for that specific game.' },
                { title: 'Full AI Analysis', desc: '2–3 sentence breakdown: form, injuries, matchup history, home/away splits.' },
                { title: 'Key Factors', desc: 'Positive and negative factors laid out clearly — know what\'s working for and against the pick.' },
                { title: 'Warning Flags', desc: 'One game per day we flag as high-risk. Know what to avoid before you look at the slate.' },
                { title: 'Bet Tracker', desc: 'Log your bets, track P&L, and see your win rate over time.' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-5 rounded-2xl bg-elevated border border-dim">
                  <div className="w-5 h-5 rounded-full bg-neon/15 border border-neon/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-neon" />
                  </div>
                  <div>
                    <div className="font-bold text-sm mb-1">{f.title}</div>
                    <div className="text-xs text-white/45 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="py-24 px-4 border-b border-dim" id="pricing">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-neon tracking-widest uppercase mb-3">Pricing</p>
              <h2 className="text-4xl font-black tracking-tight mb-3">Simple pricing.</h2>
              <p className="text-white/50">Start free. Upgrade when you&apos;re ready.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  name: 'Free',
                  price: '$0',
                  per: 'forever',
                  features: ["Today's game schedule", 'See teams + game times', 'Bet tracker (5 bets)'],
                  cta: 'Get Started',
                  href: '/subscribe',
                  highlight: false,
                },
                {
                  name: 'Premium',
                  price: '$9.99',
                  per: '/month',
                  features: ['All picks — all sports', 'AI analysis + factors', 'Confidence scores', 'Warning flags', 'Unlimited bet tracker'],
                  cta: 'Start Premium',
                  href: '/subscribe?plan=premium',
                  highlight: true,
                },
                {
                  name: 'VIP',
                  price: '$24.99',
                  per: '/month',
                  features: ['Everything in Premium', 'Props & player props', 'Priority updates', 'Direct Telegram channel', 'Priority support'],
                  cta: 'Go VIP',
                  href: '/subscribe?plan=vip',
                  highlight: false,
                },
              ].map(p => (
                <div key={p.name} className={`rounded-2xl p-6 border ${p.highlight ? 'bg-neon/5 border-neon/40' : 'bg-elevated border-dim'}`}>
                  {p.highlight && (
                    <div className="text-[10px] font-black text-neon tracking-widest uppercase mb-2">Most Popular</div>
                  )}
                  <h3 className="text-xl font-black mb-1">{p.name}</h3>
                  <div className="mb-6">
                    <span className="text-3xl font-black font-mono">{p.price}</span>
                    <span className="text-white/40 text-sm ml-1">{p.per}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={p.href}
                    className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                      p.highlight
                        ? 'bg-neon text-black hover:bg-neon/90'
                        : 'border border-dim text-white/70 hover:border-neon/30 hover:text-white'
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-neon/10 border border-neon/20 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-6 h-6 text-neon" />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Start making better decisions.
            </h2>
            <p className="text-white/50 mb-8 text-lg leading-relaxed">
              Free to join. No credit card. See today&apos;s games immediately.
            </p>
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-neon text-black font-bold text-lg hover:bg-neon/90 transition-all hover:shadow-neon"
            >
              Create Free Account
              <ChevronRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-white/20 mt-4">For entertainment purposes only · Must be 21+ · Please gamble responsibly</p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
