import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { TrendingUp, Shield, Zap, BarChart2, Copy, Bell, ChevronRight, Check } from 'lucide-react'

function ParlaySlip() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="bg-card border border-dim rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neon flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-black" strokeWidth={3} />
            </div>
            <span className="text-xs font-bold text-neon tracking-widest uppercase">Tier 2 Parlay</span>
          </div>
          <span className="text-xs text-white/40 font-mono">Today</span>
        </div>
        <div className="space-y-3 mb-4">
          {[
            { team: 'Chiefs -7.5', sport: '🏈 NFL', conf: 84, odds: '-110' },
            { team: 'Dodgers ML', sport: '⚾ MLB', conf: 76, odds: '-155' },
            { team: 'Real Madrid -0.5', sport: '⚽ Soccer', conf: 63, odds: '+120' },
          ].map((leg, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-elevated border border-dim">
              <div className="w-7 h-7 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-neon" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{leg.team}</p>
                <p className="text-xs text-white/40">{leg.sport}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-neon font-bold">{leg.odds}</p>
                <p className="text-xs text-white/30">{leg.conf}% conf</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-dim pt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-white/40">Combined Odds</span>
            <span className="font-mono font-bold text-neon text-lg">+425</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-white/40">AI Confidence</span>
            <span className="text-xs font-bold text-white">74%</span>
          </div>
          <button className="w-full py-2.5 rounded-xl bg-neon text-black text-xs font-bold flex items-center justify-center gap-2">
            <Copy className="w-3.5 h-3.5" />
            Copy to Threads / Telegram
          </button>
        </div>
      </div>
      {/* Glow */}
      <div className="absolute inset-0 -z-10 rounded-2xl blur-3xl opacity-20 bg-neon scale-90" />
    </div>
  )
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="relative overflow-hidden bg-dark bg-grid pt-20 pb-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/20 text-neon text-xs font-bold tracking-widest uppercase mb-6">
                  <Zap className="w-3 h-3" />
                  Research · Analyze · Win
                </div>
                <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-5">
                  Stop <span className="gradient-text">Guessing.</span><br />
                  Start <span className="gradient-text">Winning.</span>
                </h1>
                <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg">
                  GambitParlay uses Claude AI and real-time research to generate Tier 1, 2, and 3 parlay picks — with copy-ready posts for Threads and Telegram.
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
                    href="/picks"
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-dim text-white/70 font-semibold text-base hover:border-neon/30 hover:text-white transition-colors"
                  >
                    See Today&apos;s Picks
                  </Link>
                </div>
                <div className="flex flex-wrap gap-5 text-sm text-white/40">
                  {[['72%', 'Win Rate (L30)'], ['500+', 'Picks This Season'], ['10k+', 'Active Users']].map(([n, l]) => (
                    <div key={l}>
                      <span className="font-mono font-black text-neon text-xl">{n}</span>
                      <span className="ml-2">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:flex justify-center">
                <ParlaySlip />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-24 px-4 border-t border-dim" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-neon tracking-widest uppercase mb-3">Features</p>
              <h2 className="text-4xl font-black tracking-tight mb-4">Everything You Need to Win</h2>
              <p className="text-white/50 max-w-xl mx-auto">Built for bettors who want edge, not noise. Every feature is designed to save you time and increase your hit rate.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <TrendingUp className="w-5 h-5" />, title: 'Daily AI Picks', desc: 'Claude analyzes lineups, trends, weather, and matchup data to surface high-confidence picks every morning.' },
                { icon: <Shield className="w-5 h-5" />, title: 'Warning Posts', desc: 'Know which games to AVOID before you even look at the slate. Our AI flags traps and sharp reverse-line moves.' },
                { icon: <Zap className="w-5 h-5" />, title: 'Tier System', desc: 'Tier 1 (safest), Tier 2 (balanced), Tier 3 (high reward). Stack any combo into a parlay with auto odds calculation.' },
                { icon: <BarChart2 className="w-5 h-5" />, title: 'Bet Tracker', desc: 'Log every bet, track ROI, see win rate by tier and sport. Identify which types of bets make you money.' },
                { icon: <Copy className="w-5 h-5" />, title: 'One-Tap Copy', desc: 'Copy formatted parlay picks directly to Threads or Telegram with one tap. Post like a pro instantly.' },
                { icon: <Bell className="w-5 h-5" />, title: 'Lineup Alerts', desc: 'Get notified 1 hour before kickoff when a key player is scratched or a line moves significantly.' },
                { icon: <BarChart2 className="w-5 h-5" />, title: 'Series Momentum', desc: 'MLB series tracker shows momentum shifts, bullpen fatigue, and home/away splits over the last 7 days.' },
                { icon: <Shield className="w-5 h-5" />, title: 'Motivation Check', desc: 'Soccer-specific feature — tracks rest, travel, tournament context, and motivation levels for both squads.' },
              ].map((f, i) => (
                <div key={i} className="bg-card border border-dim rounded-2xl p-6 card-hover cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center text-neon mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 px-4 bg-card border-t border-b border-dim">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs font-bold text-neon tracking-widest uppercase mb-3">Process</p>
            <h2 className="text-4xl font-black tracking-tight mb-14">How GambitParlay Works</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { num: '01', title: 'Sign Up Free', desc: 'Create your account in 30 seconds. No credit card required for the free tier.' },
                { num: '02', title: 'Get AI Picks', desc: 'Every morning, Claude analyzes data and generates Tier 1–3 picks across NFL, MLB, and Soccer.' },
                { num: '03', title: 'Track & Win', desc: 'Log your bets, track ROI, and copy posts directly to Threads or Telegram.' },
              ].map((s, i) => (
                <div key={i} className="relative">
                  <div className="text-6xl font-black text-neon/10 mb-3 font-mono">{s.num}</div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TIER SHOWCASE */}
        <section className="py-24 px-4 border-b border-dim">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-neon tracking-widest uppercase mb-3">Tier System</p>
              <h2 className="text-4xl font-black tracking-tight mb-4">Pick Your Risk Level</h2>
              <p className="text-white/50">Every pick is classified into 3 tiers. Stack them based on your bankroll and risk tolerance.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { tier: 1, label: 'Tier 1', sub: 'Safest', color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-400', desc: 'High-confidence, lower variance. These are your bread-and-butter picks — 65%+ AI confidence, strong matchup edge, minimal lineup risk.', conf: '65–85%' },
                { tier: 2, label: 'Tier 2', sub: 'Balanced', color: 'from-neon/20 to-neon/5', border: 'border-neon/30', badge: 'bg-neon/10 text-neon', desc: 'Balanced risk-reward. Good confidence with upside potential. Perfect for 2–3 leg parlays. AI confidence 55–70% with clear reasoning.', conf: '55–70%' },
                { tier: 3, label: 'Tier 3', sub: 'High Reward', color: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/30', badge: 'bg-orange-500/20 text-orange-400', desc: 'Contrarian plays with high ceiling. Fade the public, exploit line value. Lower win rate but big payout potential. Size down on these.', conf: '45–60%' },
              ].map(t => (
                <div key={t.tier} className={`relative bg-gradient-to-b ${t.color} border ${t.border} rounded-2xl p-6`}>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-4 ${t.badge}`}>
                    {t.label} · {t.sub}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">{t.desc}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30">AI Confidence Range</span>
                    <span className="font-mono font-bold text-white">{t.conf}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING PREVIEW */}
        <section className="py-24 px-4 border-b border-dim bg-card">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-neon tracking-widest uppercase mb-3">Pricing</p>
              <h2 className="text-4xl font-black tracking-tight mb-4">Simple, Transparent Pricing</h2>
              <p className="text-white/50">Start free. Upgrade when you&apos;re winning.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  name: 'Free', price: '$0', per: 'forever',
                  features: ['1 warning post / day', 'Basic Tier 1 picks', 'Bet tracker (5 bets)', 'Community access'],
                  cta: 'Get Started', href: '/subscribe', highlight: false,
                },
                {
                  name: 'Premium', price: '$9.99', per: '/month',
                  features: ['All picks — all tiers', 'All sports (NFL, MLB, Soccer)', 'Unlimited bet tracker', 'Copy-ready Threads posts', 'Lineup alerts', 'Series momentum tracker'],
                  cta: 'Start Premium', href: '/subscribe?plan=premium', highlight: true,
                },
                {
                  name: 'VIP', price: '$24.99', per: '/month',
                  features: ['Everything in Premium', 'Props & player props', 'Live bet updates', 'Direct Telegram picks', 'Motivation checker', 'Priority support'],
                  cta: 'Go VIP', href: '/subscribe?plan=vip', highlight: false,
                },
              ].map(p => (
                <div key={p.name} className={`rounded-2xl p-6 border ${p.highlight ? 'bg-neon/5 border-neon/40 shadow-neon' : 'bg-elevated border-dim'}`}>
                  {p.highlight && (
                    <div className="text-xs font-black text-neon tracking-widest uppercase mb-2">Most Popular</div>
                  )}
                  <h3 className="text-xl font-black mb-1">{p.name}</h3>
                  <div className="mb-5">
                    <span className="text-3xl font-black font-mono">{p.price}</span>
                    <span className="text-white/40 text-sm ml-1">{p.per}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={p.href}
                    className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                      p.highlight
                        ? 'bg-neon text-black hover:bg-neon/90 hover:shadow-neon'
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

        {/* FINAL CTA */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6">📋</div>
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Ready to <span className="gradient-text">Stop Guessing?</span>
            </h2>
            <p className="text-white/50 mb-8 text-lg">
              Join 10,000+ bettors using GambitParlay to research smarter, bet less, and win more.
            </p>
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-neon text-black font-bold text-lg hover:bg-neon/90 transition-all hover:shadow-neon"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-white/25 mt-4">No credit card required · Free tier available · Cancel anytime</p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
