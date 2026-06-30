import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Check, Zap } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    per: 'forever',
    desc: 'Get started with daily warnings and basic picks.',
    features: [
      '1 warning post per day',
      'Basic Tier 1 picks only',
      'Bet tracker (up to 5 bets)',
      'Community Discord access',
      'NFL & MLB only',
    ],
    locked: [
      'Tier 2 & 3 picks',
      'Copy-ready Threads posts',
      'Player props',
      'Lineup alerts',
      'Telegram picks',
    ],
    cta: 'Get Started Free',
    href: '/subscribe',
    highlight: false,
    badge: null,
  },
  {
    name: 'Premium',
    price: '$9.99',
    per: '/month',
    desc: 'Everything you need to bet smarter across all sports.',
    features: [
      'All picks — Tier 1, 2 & 3',
      'NFL, MLB, NBA & Soccer',
      'Unlimited bet tracker',
      'Copy-ready Threads & X posts',
      'Lineup alerts (1hr before)',
      'MLB series momentum tracker',
      'Soccer motivation checker',
      'Parlay builder with odds calc',
      'Email & SMS pick alerts',
    ],
    locked: [
      'Player props',
      'Live bet updates',
      'Direct Telegram channel',
    ],
    cta: 'Start Premium',
    href: '/subscribe?plan=premium',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'VIP',
    price: '$24.99',
    per: '/month',
    desc: 'The full experience. Props, live updates, and direct access.',
    features: [
      'Everything in Premium',
      'Player props & same-game parlays',
      'Live line movement alerts',
      'Direct Telegram pick channel',
      'VIP-only high-confidence locks',
      'Priority customer support',
      'Early access to new features',
      'Monthly ROI breakdown report',
    ],
    locked: [],
    cta: 'Go VIP',
    href: '/subscribe?plan=vip',
    highlight: false,
    badge: null,
  },
]

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes — cancel your subscription from your account settings at any time. No lock-ins, no cancellation fees. Your access stays active until the end of the billing period.' },
  { q: 'Is there a free trial for Premium or VIP?', a: 'We offer a 7-day free trial on Premium. Start your trial with no credit card required and cancel anytime before day 7.' },
  { q: 'How are picks generated?', a: 'Our AI uses Claude to analyze matchup data, recent form, injury reports, line movement, and weather. Picks are reviewed and published every morning by 8am EST.' },
  { q: 'What sports do you cover?', a: 'Premium covers NFL, MLB, NBA, NHL, and Soccer (MLS, Premier League, Champions League, World Cup). Free tier covers NFL and MLB only.' },
  { q: 'What\'s included in the Telegram channel?', a: 'VIP subscribers get access to our private Telegram channel where picks, warnings, and live updates are posted in real time throughout the day.' },
]

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="pt-16 pb-20 px-4 text-center border-b border-dim bg-grid">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/20 text-neon text-xs font-bold tracking-widest uppercase mb-5">
              <Zap className="w-3 h-3" />
              Simple Pricing
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-4">
              Start Free.<br />Win More.
            </h1>
            <p className="text-white/50 text-lg">No contracts. No lock-ins. Upgrade or downgrade whenever you want.</p>
          </div>
        </section>

        {/* Plans */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-6">
              {PLANS.map(plan => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-6 border flex flex-col ${
                    plan.highlight
                      ? 'bg-neon/5 border-neon/40 shadow-neon relative'
                      : 'bg-card border-dim'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-neon text-black text-xs font-black tracking-widest uppercase">
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-5">
                    <h2 className="text-xl font-black mb-1">{plan.name}</h2>
                    <div className="mb-2">
                      <span className="text-4xl font-black font-mono">{plan.price}</span>
                      <span className="text-white/30 ml-1 text-sm">{plan.per}</span>
                    </div>
                    <p className="text-sm text-white/40">{plan.desc}</p>
                  </div>

                  <div className="flex-1">
                    <ul className="space-y-2.5 mb-5">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                          <Check className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                      {plan.locked.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-white/20 line-through">
                          <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center text-xs">✕</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={plan.href}
                    className={`block text-center py-3.5 rounded-xl font-bold text-sm transition-all ${
                      plan.highlight
                        ? 'bg-neon text-black hover:bg-neon/90 hover:shadow-neon'
                        : 'border border-dim text-white/70 hover:border-neon/30 hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 border-t border-dim bg-card">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black tracking-tight text-center mb-10">FAQ</h2>
            <div className="space-y-5">
              {FAQ.map(item => (
                <div key={item.q} className="border border-dim rounded-2xl p-5">
                  <h3 className="font-bold mb-2">{item.q}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
