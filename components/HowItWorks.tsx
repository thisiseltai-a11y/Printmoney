import { Car, HandCoins, MessageSquareText } from 'lucide-react'

const STEPS = [
  {
    icon: Car,
    step: '01',
    title: 'List your car',
    body: "Enter the details, photos, and your asking price — plus a minimum you'll actually consider. Buyers see that floor, so nobody wastes your time with a lowball.",
  },
  {
    icon: HandCoins,
    step: '02',
    title: 'Buyers make offers',
    body: 'Signed-in buyers submit an offer at or above your minimum. Anything below it is rejected automatically, before it ever reaches you.',
  },
  {
    icon: MessageSquareText,
    step: '03',
    title: 'Accept, counter, or decline',
    body: "Respond right from your dashboard. If you counter, the buyer gets notified instantly and can accept, counter back, or walk away.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-grotesk text-3xl font-semibold tracking-tight text-ink">How it works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step} className="card-lift rounded-card border border-line bg-panel p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-amber/10">
                  <s.icon className="h-5 w-5 text-amber" />
                </div>
                <span className="font-mono text-xs text-muted">{s.step}</span>
              </div>
              <h3 className="font-grotesk text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
