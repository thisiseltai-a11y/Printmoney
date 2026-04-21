# ResumeRocket — Business Plan & Marketing Strategy
*Last updated: April 2026*

---

## Executive Summary

**ResumeRocket** is an AI-powered resume and cover letter writing service. Users provide their background and a job description; the AI returns a polished, ATS-optimized resume and cover letter in under 60 seconds. The service targets the $1.5B+ resume writing market, which is growing at 5–8% annually, while the AI resume tools segment is growing at 20% CAGR.

**Revenue model:** Pay-per-use + monthly subscription.  
**Unfair advantage:** Instant delivery (< 60s vs. 3–5 days for human writers), fraction of the price, quality that rivals $300+ professional services.

---

## Market Analysis

### Market Size
- Global resume writing services market: **$1.5B in 2026**, projected $1.76B by 2035 (5.2% CAGR)
- AI-powered resume builders segment: **$400M in 2024**, projected $1.8B by 2032 (20% CAGR)
- ~60% of job seekers now prefer AI-assisted tools for ATS optimization

### Target Customer
**Primary:** Job seekers actively applying (ages 22–40)
- Recent graduates entering the workforce
- Mid-career professionals switching jobs or industries
- Laid-off workers who need to update stale resumes quickly

**Secondary:** Career changers, executives, and recurring users who apply to many roles

### Pain Points We Solve
1. ATS systems reject 75%+ of resumes before a human sees them
2. Professional human resume writers cost $150–$800 and take 3–5 days
3. DIY builders produce generic, template-looking outputs
4. Writing a good resume is genuinely hard and time-consuming

---

## Competitive Analysis

| Competitor | Price | Type | Weakness |
|---|---|---|---|
| Kickresume | $4–9/mo | Template builder | Not truly AI-tailored; generic |
| Zety | $5.95–26/mo | Template builder | Bait-and-switch; pay-to-download |
| Rezi | $29/mo | AI builder | Subscription-only; expensive for light use |
| ZipJob | $139–799 one-time | Human writers | Slow (3–5 days); very expensive |
| TopResume | $179+ | Human writers | Slow; expensive; inconsistent quality |
| ChatGPT | Free–$20/mo | General AI | Generic output; no ATS specialization |

### Our Positioning
**Premium AI quality at accessible pricing, with instant delivery.**

We sit between the cheap template builders (low quality) and expensive human services (slow, costly). We deliver human-level quality in AI speed at 90% lower cost than human writers.

---

## Product

### Core Service
1. **Multi-step form** — guided data collection (5 steps, ~8 min)
2. **AI generation** — Claude AI writes the resume and cover letter in < 60s
3. **Instant delivery** — copy/download immediately, no email, no waiting

### What Users Get
- ATS-optimized resume with keywords extracted from the job description
- Personalized cover letter tailored to the specific company/role
- Clean, professional formatting that passes ATS scanners
- Unlimited regenerations (tweak inputs, get new output)

### Technology Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **AI Engine:** Anthropic Claude (claude-sonnet-4-6) — best-in-class writing quality
- **Payments:** Stripe (to be integrated)
- **Hosting:** Vercel (zero-config deployment, edge network)

---

## Pricing Strategy

### Pricing Tiers

| Plan | Price | Includes |
|---|---|---|
| **Single** | $12 one-time | 1 resume + 1 cover letter |
| **Bundle** | $29 one-time | 5 resume + cover letter sets, LinkedIn summary |
| **Unlimited** | $19/month | Unlimited resumes + cover letters + LinkedIn |

### Why This Pricing Works
- **$12** is an impulse buy — lower friction than competitors
- **$29 bundle** captures users who know they'll apply to multiple jobs (most users)
- **$19/month** attracts heavy users and provides recurring revenue
- All tiers are 85–95% cheaper than human writing services
- COGS per resume: ~$0.15 (Claude API cost) — margins are exceptional

### Unit Economics (targets)
- Average order value: ~$22
- COGS (API + hosting): ~$0.50
- Gross margin: ~97.7%
- CAC target: < $15 via SEO/content, < $35 via paid ads
- LTV: $45–65 (many users come back for each job search)

---

## Go-To-Market Strategy

### Phase 1: Organic Foundation (Months 1–3)

**SEO / Content Marketing — PRIMARY CHANNEL**

The resume writing space has enormous search volume with commercial intent. Target:

High-volume keywords:
- "ATS resume builder" (22K/mo)
- "free resume builder" (110K/mo)
- "cover letter generator AI" (18K/mo)
- "resume writing service" (27K/mo)
- "AI resume writer" (15K/mo)

Content strategy:
- 2 blog posts/week targeting long-tail keywords
- "How to beat ATS in 2026" 
- "Best action verbs for [job title] resume"
- "Cover letter template for [industry]"
- "How to write a resume with no experience"

Each post should have an inline CTA to the resume generator.

**Reddit / Community Marketing**
- r/jobs (1.1M members), r/resumes (500K+), r/careeradvice
- Post genuinely helpful resume tips — mention the tool naturally
- Share before/after resume transformations (with permission)

**ProductHunt Launch**
- Target top-3 placement on launch day
- Pre-build a launch list of supporters
- Offer free credits to PH community

### Phase 2: Paid Acquisition (Month 3+, after first $3K MRR)

**Google Ads**
- Target "resume writing service" + "ATS resume" keywords
- Focus on high-intent commercial keywords
- Expected CPC: $2–5, target CPA: < $30

**TikTok / Instagram Reels**
- "Watch AI write my resume in 60 seconds" — extremely shareable
- Show the before/after: generic resume vs. ResumeRocket output
- Partner with career coaching creators

**LinkedIn Ads**
- Target users who recently changed jobs or have job-seeking signals
- Retarget LinkedIn visitors with a $12 offer

### Phase 3: Retention & Referral (Month 4+)

**Email Sequences**
- Post-purchase: tips on using the resume, interview prep
- 30 days after first purchase: "How's the job search going?" + upgrade offer
- 90-day lapse: "Your industry is hiring — time to update your resume?"

**Referral Program**
- Give $5 credit for every friend who makes their first purchase
- Referred users get 20% off their first order

---

## Financial Projections

### Month-by-Month Targets (Year 1)

| Month | Users | MRR | Revenue |
|---|---|---|---|
| 1 | 50 | $200 | $1,100 |
| 2 | 150 | $500 | $3,300 |
| 3 | 400 | $1,200 | $8,800 |
| 4 | 800 | $2,400 | $17,600 |
| 5 | 1,400 | $4,000 | $30,800 |
| 6 | 2,200 | $6,200 | $48,400 |

**Year 1 Revenue Target:** ~$120,000  
**Year 2 Revenue Target:** ~$480,000 (scaling paid acquisition)

### Operating Costs (Monthly at scale)
- Anthropic API: $200–$400 (at 5,000 generations/month)
- Vercel hosting: $20–$80
- Stripe fees: 2.9% + $0.30 per transaction
- Ads (Phase 2): $1,000–$3,000/month
- Total OPEX: < $4,000/month at $20K MRR

**Net margins at scale: 80%+**

---

## Operations

This business can be run entirely autonomously:

### What Runs Automatically
- AI resume generation (fully automated)
- Payment processing via Stripe (automated)
- Order delivery (instant — no human needed)
- Email sequences via email service provider

### What Requires Occasional Attention
- Monitoring AI output quality (weekly spot-check: 30 min)
- Reviewing customer support emails (if any) — expected to be minimal
- Updating blog content for SEO (1-2 hours/week, or outsource to a writer)
- Monitoring ad spend ROI when running paid campaigns

**Total time investment after launch: 2–5 hours/week maximum.**

---

## Setup Checklist

To go live, complete these steps:

1. [ ] Buy a domain (resumerocket.ai or similar — ~$15/year)
2. [ ] Deploy to Vercel (free tier works to start, $20/mo Pro when scaling)
3. [ ] Get Anthropic API key at console.anthropic.com (pay-as-you-go, ~$0.15/1000 tokens)
4. [ ] Set up Stripe account for payments (replace `/order` flow with Stripe Checkout)
5. [ ] Add `ANTHROPIC_API_KEY` to Vercel environment variables
6. [ ] Set up Google Analytics + Microsoft Clarity (free)
7. [ ] Create ProductHunt account and schedule launch
8. [ ] Set up ConvertKit or Mailchimp for email sequences (free tiers available)

---

## Risk Analysis

| Risk | Likelihood | Mitigation |
|---|---|---|
| OpenAI/Google launches competing product | High | We're already live; focus on specialization and brand |
| AI output quality complaints | Low | Easy to regenerate; satisfaction guarantee |
| High CAC from paid ads | Medium | Lead with SEO/organic; paid is acceleration only |
| Anthropic API price increase | Low | Margins are high enough to absorb 2-3x cost increase |
| Slow organic growth | Medium | Product Hunt launch + Reddit to get initial traction |

---

## Summary

ResumeRocket is a lean, high-margin, largely automated business in a proven market with clear demand. The total cost to launch is under $100 (domain + API credits). The path to $10K/month is achievable within 4–6 months with consistent content marketing and one ProductHunt launch. No employees, no inventory, no support team required.

**It runs itself. You just own it.**
