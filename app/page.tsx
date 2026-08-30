'use client'
import { useEffect } from 'react'

export default function OwnTheMarque() {
  useEffect(() => {
    // ── Nav scroll ──────────────────────────────────────
    const nav = document.getElementById('nav')
    function updateNav() {
      nav?.classList.toggle('scrolled', window.scrollY > 40)
    }
    window.addEventListener('scroll', updateNav, { passive: true })
    updateNav()

    // ── Mobile menu ──────────────────────────────────────
    const hamburger = document.getElementById('hamburger')
    const mobileMenu = document.getElementById('mobile-menu')
    function toggleMenu() {
      const open = mobileMenu?.classList.toggle('open') ?? false
      hamburger?.classList.toggle('open', open)
      hamburger?.setAttribute('aria-expanded', String(open))
      mobileMenu?.setAttribute('aria-hidden', String(!open))
      document.body.style.overflow = open ? 'hidden' : ''
    }
    hamburger?.addEventListener('click', toggleMenu)
    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu?.classList.remove('open')
        hamburger?.classList.remove('open')
        hamburger?.setAttribute('aria-expanded', 'false')
        mobileMenu?.setAttribute('aria-hidden', 'true')
        document.body.style.overflow = ''
      })
    })

    // ── Hero entrance ────────────────────────────────────
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const heroLines = document.querySelectorAll('.hero-line')
    if (reduced) {
      heroLines.forEach(el => el.classList.add('in'))
    } else {
      requestAnimationFrame(() => heroLines.forEach(el => el.classList.add('in')))
    }

    // ── Section reveals ──────────────────────────────────
    const revealEls = document.querySelectorAll('.reveal')
    if ('IntersectionObserver' in window && !reduced) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0.12 })
      revealEls.forEach(el => observer.observe(el))
      return () => {
        observer.disconnect()
        window.removeEventListener('scroll', updateNav)
      }
    } else {
      revealEls.forEach(el => el.classList.add('in'))
    }

    return () => window.removeEventListener('scroll', updateNav)
  }, [])

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const carModel = (form.querySelector('#car-model') as HTMLInputElement)?.value.trim()
    const email = (form.querySelector('#email') as HTMLInputElement)?.value.trim()
    if (!carModel) { (form.querySelector('#car-model') as HTMLInputElement)?.focus(); return }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ;(form.querySelector('#email') as HTMLInputElement)?.focus(); return
    }
    form.style.transition = 'opacity 0.3s'
    form.style.opacity = '0'
    setTimeout(() => {
      form.hidden = true
      const success = document.getElementById('form-success')
      if (success) success.style.display = 'block'
    }, 300)
  }

  return (
    <>
      {/* ── NAV ───────────────────────────────────────────── */}
      <nav id="nav">
        <div className="nav-inner">
          <a href="#home" className="wordmark">
            <span className="wordmark-badge" aria-hidden="true">OTM</span>
            Own The Marque
          </a>
          <ul className="nav-links">
            <li><a href="#process">How It Works</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#request" className="nav-cta">Submit a Request</a></li>
          </ul>
          <button className="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className="mobile-menu" id="mobile-menu" aria-hidden="true">
        <a href="#process" className="mobile-link">How It Works</a>
        <a href="#request" className="mobile-link">Submit a Request</a>
        <a href="#about" className="mobile-link">About</a>
        <a href="#contact" className="mobile-link">Contact</a>
      </div>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section id="home">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-eyebrow">
              <p className="eyebrow hero-line" style={{ transitionDelay: '0.1s' }}>Exotic &amp; Classic Car Acquisition</p>
            </div>
            <div className="hero-headline" style={{ marginTop: '20px' }}>
              <h1 className="display display-xl hero-line" style={{ transitionDelay: '0.25s' }}>
                You know<br />the car.<br />We find it.
              </h1>
            </div>
            <div className="hero-sub">
              <p className="hero-line" style={{ transitionDelay: '0.45s' }}>
                Own The Marque is a personal buyer&apos;s agent for exotic and classic cars. Tell us exactly what you want — we search dealers, auctions, private collections, and club networks, then negotiate the deal on your behalf.
              </p>
              <p className="hero-line" style={{ transitionDelay: '0.55s', marginTop: '10px', fontSize: '14px', color: 'var(--text-3)' }}>
                One finder&apos;s fee — 5% of the sale price — payable only when we deliver the car.
              </p>
            </div>
            <div className="hero-actions hero-line" style={{ transitionDelay: '0.65s' }}>
              <a href="#request" className="btn-primary">Submit a Search Request →</a>
              <a href="#process" className="btn-ghost">See how it works</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="process">
        <div className="container">
          <p className="eyebrow reveal">Process</p>
          <div className="rule"></div>
          <h2 className="display display-md reveal reveal-delay-1">Four steps from<br />wish list to keys</h2>

          <div className="steps">
            <div className="step reveal reveal-delay-1">
              <span className="step-num" aria-hidden="true">01</span>
              <h3>Tell us what you want</h3>
              <p>Make, model, year, specification, colour — the more specific, the better. We deal exclusively in the exotic and classic space, so precision is welcome here.</p>
            </div>
            <div className="step reveal reveal-delay-2">
              <span className="step-num" aria-hidden="true">02</span>
              <h3>We search the network</h3>
              <p>Active outreach across specialist dealers, auction houses, private sellers, marque registers, and club contacts. Sources most buyers can&apos;t reach independently.</p>
            </div>
            <div className="step reveal reveal-delay-3">
              <span className="step-num" aria-hidden="true">03</span>
              <h3>We verify and negotiate</h3>
              <p>Provenance checks, documentation review, coordinating a trusted third-party inspection, and market valuation — before we negotiate the price squarely on your behalf.</p>
            </div>
            <div className="step reveal reveal-delay-4">
              <span className="step-num" aria-hidden="true">04</span>
              <h3>You take the keys</h3>
              <p>When you&apos;re satisfied and the deal is done, our fee is 5% of the final sale price. No find, no fee — we only get paid when you get the car.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── REQUEST FORM ──────────────────────────────────── */}
      <section id="request" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="form-wrap">
            <div className="form-header reveal">
              <p className="eyebrow">Start a Search</p>
              <div className="rule rule-center"></div>
              <h2 className="display display-md">Tell us about your car</h2>
              <p>The more detail you give us, the faster we can start looking. All enquiries are handled in strict confidence.</p>
            </div>

            <form id="request-form" onSubmit={handleFormSubmit} noValidate>
              <div className="form-grid reveal reveal-delay-1">
                <div className="field full">
                  <label htmlFor="car-model">Make &amp; Model</label>
                  <input type="text" id="car-model" name="car-model" placeholder="e.g. Ferrari 308 GTB, Jaguar E-Type Series 1" required />
                </div>
                <div className="field">
                  <label htmlFor="year-from">Year — From</label>
                  <input type="text" id="year-from" name="year-from" placeholder="e.g. 1968" />
                </div>
                <div className="field">
                  <label htmlFor="year-to">Year — To</label>
                  <input type="text" id="year-to" name="year-to" placeholder="e.g. 1972" />
                </div>
                <div className="field full">
                  <label htmlFor="spec">Specification &amp; Notes</label>
                  <textarea id="spec" name="spec" placeholder="Colour, interior, RHD or LHD, matching numbers, known history, any specific options you require..."></textarea>
                </div>
                <div className="field">
                  <label htmlFor="budget">Budget</label>
                  <select id="budget" name="budget">
                    <option value="">Select a range</option>
                    <option>Under $100,000</option>
                    <option>$100,000 – $250,000</option>
                    <option>$250,000 – $500,000</option>
                    <option>$500,000 – $1,000,000</option>
                    <option>Over $1,000,000</option>
                    <option>Prefer to discuss privately</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="timeline">Timeline</label>
                  <select id="timeline" name="timeline">
                    <option value="">Select timeline</option>
                    <option>This week</option>
                    <option>This month</option>
                    <option>Within 3 months</option>
                    <option>Within 6 months</option>
                    <option>Just exploring</option>
                  </select>
                </div>
                <div className="field full">
                  <label htmlFor="payment">How do you plan to pay?</label>
                  <select id="payment" name="payment">
                    <option value="">Select payment method</option>
                    <option>Cash / Wire transfer</option>
                    <option>Financing already arranged</option>
                    <option>Need guidance on financing options</option>
                    <option>Haven&apos;t decided yet</option>
                  </select>
                </div>
              </div>

              <div className="form-grid reveal reveal-delay-2" style={{ marginTop: '32px' }}>
                <div className="field">
                  <label htmlFor="name">Your Name</label>
                  <input type="text" id="name" name="name" placeholder="Full name" required />
                </div>
                <div className="field">
                  <label htmlFor="phone">Phone</label>
                  <input type="tel" id="phone" name="phone" placeholder="+1 or international" />
                </div>
                <div className="field full">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" placeholder="your@email.com" required />
                </div>
              </div>

              <div className="form-submit reveal reveal-delay-3">
                <button type="submit" className="btn-submit">Send Enquiry →</button>
                <p className="form-note">
                  We respond to all enquiries within 24 hours.<br />
                  Your details are never shared with third parties.
                </p>
              </div>
            </form>

            <div className="form-success" id="form-success" aria-live="polite">
              <div className="success-icon">◆</div>
              <h3>Enquiry received</h3>
              <p>We&apos;ll review the details of your search and be in touch within 24 hours to discuss next steps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────── */}
      <section id="about">
        <div className="container">
          <p className="eyebrow reveal">About</p>
          <div className="rule"></div>
          <h2 className="display display-md reveal reveal-delay-1">Why a specialist matters</h2>

          <div className="about-grid">
            <div className="about-copy">
              <p className="reveal reveal-delay-1">Own The Marque was founded because I know exactly what makes a specific car worth owning — the right production year, the correct trim specification, documented provenance, matching numbers — and I got tired of watching buyers overpay for the wrong example or miss the right one entirely. That knowledge is what this service is built on.</p>
              <p className="reveal reveal-delay-2">Exotic and classic cars are a different category from standard car buying. A 1967 Jaguar E-Type with a Heritage certificate and matching drivetrain is a fundamentally different object from the same car without that history. Knowing which details actually matter — and which sellers are genuinely representing them — takes deep immersion in this world, and that&apos;s where I live.</p>
              <p className="reveal reveal-delay-3">We work exclusively in the exotic and classic segment, not general car buying. That focus means every search gets specialist attention: we already speak the language of the car you&apos;re looking for — its production quirks, its known problem areas, what the market pays for the right example versus a compromised one. We&apos;re currently building our network across South Florida, working with independent dealers, auction contacts, and collector clubs including AACA chapters and marque-specific clubs, with plans to expand nationally as the business grows.</p>
              <p className="reveal reveal-delay-4">The no find, no fee model keeps the incentives honest. We don&apos;t charge a retainer or consultation fee — we earn 5% of the sale price when we deliver the car you want. That means we&apos;re motivated to find the right car, not just any car.</p>
            </div>

            <div className="about-panel reveal reveal-delay-2">
              <p className="eyebrow">What sets us apart</p>
              <div className="credential">
                <div className="credential-icon">◆</div>
                <div className="credential-text">
                  <h4>Exotic &amp; Classic only</h4>
                  <p>Not general car buying. Not fleet purchasing. One lane, executed with precision.</p>
                </div>
              </div>
              <div className="credential">
                <div className="credential-icon">◆</div>
                <div className="credential-text">
                  <h4>Buyer&apos;s side, always</h4>
                  <p>We hold no inventory and list nothing for sale. Our loyalty is exclusively to you.</p>
                </div>
              </div>
              <div className="credential">
                <div className="credential-icon">◆</div>
                <div className="credential-text">
                  <h4>South Florida network, growing</h4>
                  <p>Dealers, auctions, AACA chapters, and marque clubs across South Florida — expanding nationally with our client base.</p>
                </div>
              </div>
              <div className="credential">
                <div className="credential-icon">◆</div>
                <div className="credential-text">
                  <h4>No find, no fee</h4>
                  <p>A 5% finder&apos;s fee, paid only when you take the keys. Fully aligned incentives.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────── */}
      <section id="contact">
        <div className="container">
          <p className="eyebrow reveal">Contact</p>
          <div className="rule"></div>
          <h2 className="display display-md reveal reveal-delay-1">Get in touch</h2>

          <div className="contact-inner">
            <div className="contact-detail reveal reveal-delay-1">
              <div className="contact-item">
                <p className="contact-label">Email</p>
                <a href="mailto:hello@ownthemarque.com">hello@ownthemarque.com</a>
              </div>
              <div className="contact-item">
                <p className="contact-label">Website</p>
                <a href="https://ownthemarque.com">ownthemarque.com</a>
              </div>
              <div className="contact-item">
                <p className="contact-label">Response time</p>
                <p>All enquiries acknowledged within 24 hours. Calls available by appointment.</p>
              </div>
            </div>

            <div className="contact-note reveal reveal-delay-2">
              <p className="eyebrow">Prefer to write?</p>
              <p>Use the search request form above to give us the detail we need to start working straight away. The more you tell us about the car you&apos;re looking for, the faster we can begin reaching out to the network.</p>
              <br />
              <a href="#request" className="btn-primary" style={{ display: 'inline-flex', marginTop: '4px' }}>Submit a Request →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer>
        <div className="container">
          <div className="footer-inner">
            <p className="footer-copy">© 2025 Own The Marque · ownthemarque.com</p>
            <ul className="footer-links">
              <li><a href="#request">Submit a Request</a></li>
              <li><a href="mailto:hello@ownthemarque.com">Email</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  )
}
