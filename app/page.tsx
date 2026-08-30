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

    // ── Hero bokeh canvas ────────────────────────────────
    const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null
    let rafId: number
    let resizeObserver: ResizeObserver | null = null
    let mouseHX = -1, mouseHY = -1

    if (canvas && !reduced) {
      const ctx = canvas.getContext('2d')!
      const isMobile = () => window.innerWidth < 640

      function resize() {
        const rect = canvas!.parentElement!.getBoundingClientRect()
        canvas!.width = rect.width
        canvas!.height = rect.height
      }
      resize()

      interface Spot {
        x: number; y: number
        vx: number; vy: number
        r: number
        opacity: number
        phase: number
        phaseSpeed: number
        color: [number, number, number]
      }

      function makeSpot(w: number, h: number): Spot {
        const colors: [number,number,number][] = [
          [201, 168, 76],
          [220, 180, 90],
          [180, 130, 55],
          [201, 168, 76],
        ]
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.22,
          r: 80 + Math.random() * 200,
          opacity: 0.12 + Math.random() * 0.22,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.005 + Math.random() * 0.007,
          color: colors[Math.floor(Math.random() * colors.length)],
        }
      }

      let spots: Spot[] = []
      function initSpots() {
        const w = canvas!.width, h = canvas!.height
        const count = isMobile() ? 12 : 22
        spots = Array.from({ length: count }, () => makeSpot(w, h))
      }
      initSpots()

      function draw() {
        const w = canvas!.width, h = canvas!.height
        ctx.clearRect(0, 0, w, h)

        // Warm headlight glow
        const glow = ctx.createRadialGradient(w * 0.72, h * 0.55, 0, w * 0.72, h * 0.55, w * 0.70)
        glow.addColorStop(0, 'rgba(210,155,60,0.18)')
        glow.addColorStop(0.4, 'rgba(201,140,50,0.06)')
        glow.addColorStop(1, 'rgba(12,12,13,0)')
        ctx.fillStyle = glow
        ctx.fillRect(0, 0, w, h)

        // Cursor spotlight
        if (mouseHX >= 0) {
          const spot = ctx.createRadialGradient(mouseHX, mouseHY, 0, mouseHX, mouseHY, 240)
          spot.addColorStop(0, 'rgba(201,168,76,0.11)')
          spot.addColorStop(0.6, 'rgba(201,168,76,0.03)')
          spot.addColorStop(1, 'rgba(12,12,13,0)')
          ctx.fillStyle = spot
          ctx.fillRect(0, 0, w, h)
        }

        spots.forEach(s => {
          s.phase += s.phaseSpeed
          const alpha = s.opacity * (0.55 + 0.45 * Math.sin(s.phase))
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r)
          grad.addColorStop(0, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${alpha.toFixed(3)})`)
          grad.addColorStop(0.5, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},${(alpha * 0.3).toFixed(3)})`)
          grad.addColorStop(1, `rgba(${s.color[0]},${s.color[1]},${s.color[2]},0)`)
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, w, h)
          s.x += s.vx; s.y += s.vy
          if (s.x < -s.r) s.x = w + s.r
          if (s.x > w + s.r) s.x = -s.r
          if (s.y < -s.r) s.y = h + s.r
          if (s.y > h + s.r) s.y = -s.r
        })

        rafId = requestAnimationFrame(draw)
      }
      draw()

      function onCanvasMouse(e: MouseEvent) {
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        mouseHX = (e.clientX - rect.left) * (canvas.width / rect.width)
        mouseHY = (e.clientY - rect.top) * (canvas.height / rect.height)
      }
      function onCanvasLeave() { mouseHX = -1; mouseHY = -1 }
      canvas.parentElement?.addEventListener('mousemove', onCanvasMouse, { passive: true })
      canvas.parentElement?.addEventListener('mouseleave', onCanvasLeave)

      resizeObserver = new ResizeObserver(() => { resize(); initSpots() })
      resizeObserver.observe(canvas.parentElement!)
    }

    // ── SVG car: draw-on stroke animation ────────────────
    const carWrap = document.querySelector('.hero-car-wrap') as HTMLElement | null
    const carSvg = document.querySelector('.hero-car-svg') as SVGElement | null
    if (carSvg && !reduced) {
      const stroked = carSvg.querySelectorAll('[stroke]') as NodeListOf<SVGGeometryElement>
      stroked.forEach((el, i) => {
        try {
          const len = el.getTotalLength ? Math.ceil(el.getTotalLength()) + 10 : 600
          el.style.strokeDasharray = String(len)
          el.style.strokeDashoffset = String(len)
          el.style.transition = `stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1) ${0.5 + i * 0.045}s`
        } catch (_) { /* line elements may throw */ }
      })
      requestAnimationFrame(() => {
        stroked.forEach(el => { el.style.strokeDashoffset = '0' })
      })
    }

    // ── Mouse parallax + gentle car float ────────────────
    const heroSection = document.getElementById('home')
    const heroContent = document.querySelector('.hero-content-wrap') as HTMLElement | null
    let tX = 0, tY = 0, cX = 0, cY = 0
    let parallaxRaf = 0

    function onHeroMouse(e: MouseEvent) {
      const rect = heroSection!.getBoundingClientRect()
      tX = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)
      tY = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)
    }
    function onHeroLeave() { tX = 0; tY = 0 }

    function runParallax() {
      cX += (tX - cX) * 0.05
      cY += (tY - cY) * 0.05
      const float = Math.sin(Date.now() / 1400) * 5   // ~8.8s gentle bob
      if (carWrap) {
        carWrap.style.transform = `translate(${cX * -30}px, ${cY * -14 + float}px)`
      }
      if (heroContent) {
        heroContent.style.transform = `translate(${cX * 8}px, ${cY * 5}px)`
      }
      parallaxRaf = requestAnimationFrame(runParallax)
    }

    if (!reduced) {
      heroSection?.addEventListener('mousemove', onHeroMouse, { passive: true })
      heroSection?.addEventListener('mouseleave', onHeroLeave)
      runParallax()
    }

    // ── Section reveals ──────────────────────────────────
    const revealEls = document.querySelectorAll('.reveal')
    let cleanupObserver: (() => void) | undefined
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
      cleanupObserver = () => observer.disconnect()
    } else {
      revealEls.forEach(el => el.classList.add('in'))
    }

    return () => {
      window.removeEventListener('scroll', updateNav)
      cancelAnimationFrame(rafId)
      cancelAnimationFrame(parallaxRaf)
      resizeObserver?.disconnect()
      cleanupObserver?.()
      heroSection?.removeEventListener('mousemove', onHeroMouse)
      heroSection?.removeEventListener('mouseleave', onHeroLeave)
    }
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
        <canvas id="hero-canvas" aria-hidden="true"></canvas>
        <div className="hero-overlay" aria-hidden="true"></div>

        {/* Classic GT coupe silhouette — Ferrari 250-inspired line art */}
        <div className="hero-car-wrap" aria-hidden="true">
        <svg className="hero-car-svg" viewBox="0 0 1100 480" xmlns="http://www.w3.org/2000/svg" fill="none">
          <defs>
            <radialGradient id="carGlow" cx="50%" cy="80%" r="55%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.18"/>
              <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="headlightBeam" cx="8%" cy="68%" r="35%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e8c870" stopOpacity="0.22"/>
              <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
            </radialGradient>
            <filter id="softGlow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Ground glow beneath car */}
          <ellipse cx="560" cy="418" rx="440" ry="28" fill="url(#carGlow)"/>
          {/* Headlight beam */}
          <ellipse cx="88" cy="330" rx="200" ry="55" fill="url(#headlightBeam)" transform="rotate(-12 88 330)"/>

          {/* ── Main body outline ── */}
          <path
            d="
              M 82 348
              L 76 318
              C 72 292 76 268 94 252
              L 124 240
              C 178 226 295 216 438 210
              C 504 207 553 206 572 209
              C 582 206 594 192 603 170
              C 612 148 616 120 614 102
              C 630 96 668 93 714 93
              C 758 93 800 96 822 102
              C 840 116 854 142 856 170
              C 858 194 852 224 848 242
              C 844 258 844 280 848 300
              L 850 348

              L 773 350
              C 758 388 728 410 694 410
              C 660 410 630 388 615 350

              L 458 350
              C 443 388 413 410 379 410
              C 345 410 315 388 300 350

              Z
            "
            fill="rgba(201,168,76,0.05)"
            stroke="rgba(201,168,76,0.70)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            filter="url(#softGlow)"
          />

          {/* ── Bonnet / hood character line ── */}
          <path
            d="M 118 244 C 200 232 340 220 480 213"
            stroke="rgba(201,168,76,0.30)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />

          {/* ── Door / side crease line ── */}
          <path
            d="M 440 260 C 520 255 580 252 630 254 C 660 255 690 260 710 270"
            stroke="rgba(201,168,76,0.28)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />

          {/* ── Windscreen inner line ── */}
          <path
            d="M 575 207 C 585 200 596 186 605 163 C 612 145 615 118 614 102"
            stroke="rgba(201,168,76,0.25)"
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* ── Rear quarter / fastback line ── */}
          <path
            d="M 822 102 C 840 116 854 142 856 170 C 858 194 852 224 848 240"
            stroke="rgba(201,168,76,0.25)"
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* ── Front wheel (spoked) ── */}
          <circle cx="379" cy="380" r="62" stroke="rgba(201,168,76,0.55)" strokeWidth="1.4" filter="url(#softGlow)"/>
          <circle cx="379" cy="380" r="44" stroke="rgba(201,168,76,0.22)" strokeWidth="0.8"/>
          <circle cx="379" cy="380" r="14" stroke="rgba(201,168,76,0.45)" strokeWidth="1.2"/>
          {/* spokes */}
          {[0,60,120,180,240,300].map(deg => {
            const rad = (deg * Math.PI) / 180
            const x1 = 379 + 15 * Math.cos(rad), y1 = 380 + 15 * Math.sin(rad)
            const x2 = 379 + 43 * Math.cos(rad), y2 = 380 + 43 * Math.sin(rad)
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(201,168,76,0.30)" strokeWidth="0.9"/>
          })}

          {/* ── Rear wheel (spoked) ── */}
          <circle cx="694" cy="380" r="62" stroke="rgba(201,168,76,0.55)" strokeWidth="1.4" filter="url(#softGlow)"/>
          <circle cx="694" cy="380" r="44" stroke="rgba(201,168,76,0.22)" strokeWidth="0.8"/>
          <circle cx="694" cy="380" r="14" stroke="rgba(201,168,76,0.45)" strokeWidth="1.2"/>
          {[0,60,120,180,240,300].map(deg => {
            const rad = (deg * Math.PI) / 180
            const x1 = 694 + 15 * Math.cos(rad), y1 = 380 + 15 * Math.sin(rad)
            const x2 = 694 + 43 * Math.cos(rad), y2 = 380 + 43 * Math.sin(rad)
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(201,168,76,0.30)" strokeWidth="0.9"/>
          })}

          {/* ── Headlight circle ── */}
          <circle cx="88" cy="290" r="22" stroke="rgba(201,168,76,0.60)" strokeWidth="1.4" filter="url(#softGlow)"/>
          <circle cx="88" cy="290" r="14" stroke="rgba(201,168,76,0.35)" strokeWidth="0.8"/>

          {/* ── Rear tail light ── */}
          <rect x="845" y="268" width="8" height="26" rx="1" stroke="rgba(201,168,76,0.45)" strokeWidth="1" fill="rgba(201,168,76,0.06)"/>

          {/* ── Front grille slats ── */}
          {[0,1,2,3].map(i => (
            <line key={i}
              x1={74} y1={262 + i * 12}
              x2={94} y2={262 + i * 12}
              stroke="rgba(201,168,76,0.38)" strokeWidth="0.9"
            />
          ))}
        </svg>
        </div>{/* hero-car-wrap */}

        <div className="hero-content-wrap">
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
                Own The Marque is a specialist search service for exotic and classic cars. Tell us exactly what you want. We search dealers, auctions, private collections, and club networks until we find it, then connect you directly with the seller.
              </p>
              <p className="hero-line" style={{ transitionDelay: '0.55s', marginTop: '10px', fontSize: '14px', color: 'var(--text-3)' }}>
                One finder&apos;s fee: 5% of the sale price, payable only when we deliver the car.
              </p>
            </div>
            <div className="hero-actions hero-line" style={{ transitionDelay: '0.65s' }}>
              <a href="#request" className="btn-primary">Submit a Search Request →</a>
              <a href="#process" className="btn-ghost">See how it works</a>
            </div>
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
              <p>Make, model, year, specification, colour. The more specific, the better. We deal exclusively in the exotic and classic space, so precision is welcome here.</p>
            </div>
            <div className="step reveal reveal-delay-2">
              <span className="step-num" aria-hidden="true">02</span>
              <h3>We search the network</h3>
              <p>Active outreach across specialist dealers, auction houses, private sellers, marque registers, and club contacts. Sources most buyers can&apos;t reach independently.</p>
            </div>
            <div className="step reveal reveal-delay-3">
              <span className="step-num" aria-hidden="true">03</span>
              <h3>We verify and connect</h3>
              <p>Provenance checks, documentation review, coordinating a trusted third party inspection, and market valuation, so you go into the deal fully informed.</p>
            </div>
            <div className="step reveal reveal-delay-4">
              <span className="step-num" aria-hidden="true">04</span>
              <h3>You take the keys</h3>
              <p>When you&apos;re satisfied and the deal is done, our fee is 5% of the final sale price. No find, no fee. We only get paid when you get the car.</p>
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
                  <label htmlFor="year-from">Year From</label>
                  <input type="text" id="year-from" name="year-from" placeholder="e.g. 1968" />
                </div>
                <div className="field">
                  <label htmlFor="year-to">Year To</label>
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
                  We respond to all enquiries within one business day.<br />
                  Your details are never shared with third parties.
                </p>
              </div>
            </form>

            <div className="form-success" id="form-success" aria-live="polite">
              <div className="success-icon">◆</div>
              <h3>Enquiry received</h3>
              <p>We&apos;ll review the details of your search and be in touch within one business day to discuss next steps.</p>
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
              <p className="reveal reveal-delay-1">Own The Marque was founded because I know exactly what makes a specific car worth owning: the right production year, the correct trim specification, documented provenance, matching numbers. I got tired of watching buyers overpay for the wrong example or miss the right one entirely. That knowledge is what this service is built on.</p>
              <p className="reveal reveal-delay-2">Exotic and classic cars are a different category from standard car buying. A 1967 Jaguar E-Type with a Heritage certificate and matching drivetrain is a fundamentally different object from the same car without that history. Knowing which details actually matter, and which sellers are genuinely representing them, takes deep immersion in this world, and that&apos;s where I live.</p>
              <p className="reveal reveal-delay-3">We work exclusively in the exotic and classic segment, not general car buying. That focus means every search gets specialist attention: we already speak the language of the car you&apos;re looking for, its production quirks, its known problem areas, what the market pays for the right example versus a compromised one. We&apos;re currently building our network across South Florida, working with independent dealers, auction contacts, and collector clubs including AACA chapters and marque specific clubs, with plans to expand nationally as the business grows.</p>
              <p className="reveal reveal-delay-4">The no find, no fee model keeps the incentives honest. We don&apos;t charge a retainer or consultation fee. We earn 5% of the sale price when we deliver the car you want. That means we&apos;re motivated to find the right car, not just any car.</p>
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
                  <p>Dealers, auctions, AACA chapters, and marque clubs across South Florida, expanding nationally with our client base.</p>
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
                <p>All enquiries acknowledged within one business day. Calls available by appointment.</p>
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
            <p className="footer-copy">© 2026 Own The Marque · ownthemarque.com</p>
            <ul className="footer-links">
              <li><a href="#request">Submit a Request</a></li>
              <li><a href="mailto:hello@ownthemarque.com">Email</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  )
}
