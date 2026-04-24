export interface Profession {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  headline: string
  subheadline: string
  description: string
  bullets: string[]
  testimonial: { quote: string; name: string; detail: string }
  color: string
  emoji: string
}

export const PROFESSIONS: Profession[] = [
  {
    slug: 'nurse',
    title: 'Registered Nurse',
    metaTitle: 'AI Resume Builder for Nurses — ATS-Optimized in 60 Seconds',
    metaDescription: 'Get a tailored, ATS-optimized nursing resume and cover letter in under 60 seconds. Built specifically for RNs, LPNs, and nursing students. From $12.',
    headline: 'AI Resume Builder for Nurses',
    subheadline: 'ATS-optimized nursing resume + cover letter in 60 seconds.',
    description: 'Built for RNs, LPNs, CNAs, and nursing students. Our AI knows healthcare — it highlights your clinical skills, certifications, and patient care experience in the exact format hospital recruiters and ATS systems are scanning for.',
    bullets: ['Clinical skills and specializations highlighted', 'HIPAA, EMR, and certification keywords included', 'Tailored for hospital, clinic, and travel nurse roles', 'Cover letter + LinkedIn summary included'],
    testimonial: { quote: 'Got 3 interview calls in the first week. The AI knew exactly what nursing recruiters look for.', name: 'Jessica M.', detail: 'RN · Now at Mayo Clinic' },
    color: 'from-blue-500 to-cyan-500',
    emoji: '🏥',
  },
  {
    slug: 'software-engineer',
    title: 'Software Engineer',
    metaTitle: 'AI Resume Builder for Software Engineers — ATS-Optimized',
    metaDescription: 'Get a tailored software engineer resume built by AI in 60 seconds. ATS-optimized with the right tech stack keywords. From $12, no subscription.',
    headline: 'AI Resume Builder for Software Engineers',
    subheadline: 'Land more tech interviews with an ATS-optimized resume built in 60 seconds.',
    description: 'Built for frontend, backend, full-stack, and DevOps engineers. The AI matches your tech stack to the job description — pulling in the exact languages, frameworks, and tools recruiters are filtering for at top tech companies.',
    bullets: ['Tech stack and frameworks correctly formatted', 'GitHub, system design, and project highlights', 'Tailored for FAANG, startups, and remote roles', 'Cover letter + LinkedIn summary included'],
    testimonial: { quote: 'Applied to 8 companies after using ResumeRocket. Got 5 first-round interviews. The keyword matching is real.', name: 'Marcus T.', detail: 'Software Engineer · Now at Stripe' },
    color: 'from-violet-500 to-indigo-500',
    emoji: '💻',
  },
  {
    slug: 'server',
    title: 'Restaurant Server',
    metaTitle: 'AI Resume Builder for Servers & Hospitality Workers',
    metaDescription: 'Get a professional server resume built by AI in 60 seconds. ATS-optimized for restaurant, bar, and hospitality jobs. From $12.',
    headline: 'AI Resume Builder for Servers & Hospitality',
    subheadline: 'Stand out from the stack with a professional resume built in 60 seconds.',
    description: 'Built for servers, bartenders, hosts, and hospitality workers. Most resume builders are made for office jobs — ours understands hospitality. The AI highlights your service skills, upselling ability, and customer experience in a format managers actually read.',
    bullets: ['Service skills and upselling experience highlighted', 'Fine dining, casual, and bar experience formatted correctly', 'Tailored for restaurant, hotel, and event roles', 'Cover letter included'],
    testimonial: { quote: 'Finally a resume that actually made my serving experience sound impressive. Got hired at a fine dining spot I thought was out of my league.', name: 'Destiny R.', detail: 'Server · Now at Nobu' },
    color: 'from-orange-500 to-amber-500',
    emoji: '🍽️',
  },
  {
    slug: 'teacher',
    title: 'Teacher',
    metaTitle: 'AI Resume Builder for Teachers — ATS-Optimized in 60 Seconds',
    metaDescription: 'Get a tailored teacher resume and cover letter built by AI in 60 seconds. For K-12, substitute, and special education teachers. From $12.',
    headline: 'AI Resume Builder for Teachers',
    subheadline: 'Get your next teaching position with an ATS-optimized resume in 60 seconds.',
    description: 'Built for K-12 teachers, substitute teachers, special education, and instructional coaches. The AI highlights your curriculum development, classroom management, and student outcomes — the things school districts and HR systems are looking for.',
    bullets: ['Curriculum, standards alignment, and assessments highlighted', 'Classroom management and student achievement metrics', 'Tailored for public, private, and charter schools', 'Cover letter + LinkedIn summary included'],
    testimonial: { quote: 'Used this for my first teaching job application after student teaching. Got called for 4 interviews in 2 weeks.', name: 'Amanda K.', detail: 'Elementary Teacher · Now at Chicago Public Schools' },
    color: 'from-green-500 to-emerald-500',
    emoji: '📚',
  },
  {
    slug: 'warehouse',
    title: 'Warehouse Associate',
    metaTitle: 'AI Resume Builder for Warehouse Workers — Fast & Professional',
    metaDescription: 'Get a professional warehouse resume built by AI in 60 seconds. ATS-optimized for Amazon, logistics, and distribution center jobs. From $12.',
    headline: 'AI Resume Builder for Warehouse Workers',
    subheadline: 'Get hired faster with a professional resume built in 60 seconds.',
    description: 'Built for warehouse associates, forklift operators, shipping and receiving clerks, and logistics workers. The AI knows what Amazon, FedEx, and distribution centers look for — forklift certifications, pick rates, safety records, and inventory systems.',
    bullets: ['Forklift certifications and equipment experience highlighted', 'Pick rates, accuracy, and productivity metrics', 'Tailored for Amazon, FedEx, UPS, and 3PL roles', 'Cover letter included'],
    testimonial: { quote: 'Had no idea how to put my warehouse experience on paper. This made it look professional and I got hired at Amazon within a week.', name: 'Carlos M.', detail: 'Warehouse Associate · Now at Amazon' },
    color: 'from-yellow-500 to-orange-500',
    emoji: '📦',
  },
  {
    slug: 'customer-service',
    title: 'Customer Service Representative',
    metaTitle: 'AI Resume Builder for Customer Service Jobs',
    metaDescription: 'Get an ATS-optimized customer service resume and cover letter in 60 seconds. Built for call center, retail, and support roles. From $12.',
    headline: 'AI Resume Builder for Customer Service',
    subheadline: 'Land your next customer service role with a resume built in 60 seconds.',
    description: 'Built for customer service reps, call center agents, retail associates, and support specialists. The AI highlights your problem resolution skills, customer satisfaction scores, and CRM experience — the metrics that get customer service candidates hired.',
    bullets: ['CSAT scores and resolution rates highlighted', 'CRM tools (Salesforce, Zendesk) correctly featured', 'Tailored for call center, retail, and remote support roles', 'Cover letter + LinkedIn summary included'],
    testimonial: { quote: 'My old resume listed my jobs but this one actually shows what I accomplished. Got 3 offers in 2 weeks.', name: 'Trina W.', detail: 'Customer Service Rep · Now at Chewy' },
    color: 'from-pink-500 to-rose-500',
    emoji: '🎧',
  },
  {
    slug: 'medical-assistant',
    title: 'Medical Assistant',
    metaTitle: 'AI Resume Builder for Medical Assistants — ATS-Optimized',
    metaDescription: 'Get a tailored medical assistant resume built by AI in 60 seconds. ATS-optimized for clinical and administrative MA roles. From $12.',
    headline: 'AI Resume Builder for Medical Assistants',
    subheadline: 'ATS-optimized medical assistant resume + cover letter in 60 seconds.',
    description: 'Built for certified and registered medical assistants in clinical and administrative roles. The AI knows healthcare hiring — it highlights your phlebotomy skills, EHR experience, clinical procedures, and certifications in the format that gets past hospital ATS systems.',
    bullets: ['CMA/RMA certifications and clinical skills highlighted', 'EHR systems (Epic, Cerner) correctly featured', 'Tailored for physician offices, hospitals, and urgent care', 'Cover letter included'],
    testimonial: { quote: 'Just got my CMA and needed a good resume fast. This nailed all the right keywords and I got hired at a great practice.', name: 'Brianna L.', detail: 'CMA · Now at Kaiser Permanente' },
    color: 'from-teal-500 to-cyan-500',
    emoji: '🩺',
  },
  {
    slug: 'sales',
    title: 'Sales Representative',
    metaTitle: 'AI Resume Builder for Sales Reps — ATS-Optimized',
    metaDescription: 'Get a tailored sales resume built by AI in 60 seconds. Highlights your quota attainment, revenue, and CRM skills. From $12.',
    headline: 'AI Resume Builder for Sales Representatives',
    subheadline: 'Close your next job with a resume that shows your numbers.',
    description: 'Built for inside sales, outside sales, SDRs, AEs, and account managers. Sales is all about numbers — the AI makes sure your quota attainment, revenue generated, and deal sizes are front and center in the format that sales hiring managers want to see.',
    bullets: ['Quota attainment and revenue numbers highlighted', 'CRM tools (Salesforce, HubSpot) correctly featured', 'Tailored for SaaS, B2B, retail, and insurance sales', 'Cover letter + LinkedIn summary included'],
    testimonial: { quote: 'My resume finally shows what I actually did — 140% quota, $2M pipeline. Got recruited by 3 companies after updating it.', name: 'Devon S.', detail: 'Account Executive · Now at Salesforce' },
    color: 'from-indigo-500 to-blue-500',
    emoji: '📈',
  },
  {
    slug: 'project-manager',
    title: 'Project Manager',
    metaTitle: 'AI Resume Builder for Project Managers — ATS-Optimized',
    metaDescription: 'Get a tailored project manager resume built by AI in 60 seconds. PMP, Agile, and Scrum experience highlighted. From $12.',
    headline: 'AI Resume Builder for Project Managers',
    subheadline: 'An ATS-optimized PM resume that shows scope, budget, and delivery.',
    description: 'Built for project managers, program managers, and Scrum masters across all industries. The AI highlights your project scope, budget management, on-time delivery rates, and certifications — the metrics that get PMs hired at competitive companies.',
    bullets: ['Project scope, budget, and timeline metrics highlighted', 'PMP, Agile, Scrum, and Six Sigma certifications featured', 'Tailored for tech, construction, healthcare, and consulting PMs', 'Cover letter + LinkedIn summary included'],
    testimonial: { quote: 'Went from no callbacks to 4 interviews in 10 days. The AI properly showcased my $5M project portfolio.', name: 'Raymond C.', detail: 'Senior PM · Now at Microsoft' },
    color: 'from-slate-500 to-slate-700',
    emoji: '📋',
  },
  {
    slug: 'data-analyst',
    title: 'Data Analyst',
    metaTitle: 'AI Resume Builder for Data Analysts — ATS-Optimized',
    metaDescription: 'Get a tailored data analyst resume built by AI in 60 seconds. SQL, Python, and visualization tools highlighted. From $12.',
    headline: 'AI Resume Builder for Data Analysts',
    subheadline: 'Land data roles faster with an ATS-optimized resume built in 60 seconds.',
    description: 'Built for data analysts, business analysts, and data scientists. The AI correctly formats your SQL queries, Python/R skills, visualization tools, and business impact — the technical stack that data hiring managers and ATS filters are looking for.',
    bullets: ['SQL, Python, R, and Excel skills correctly formatted', 'Tableau, Power BI, and Looker experience highlighted', 'Business impact and insights metrics featured', 'Cover letter + LinkedIn summary included'],
    testimonial: { quote: 'The AI knew to put my technical stack in a skills section at the top. Got past the ATS at every company I applied to.', name: 'Priya N.', detail: 'Data Analyst · Now at Google' },
    color: 'from-cyan-500 to-blue-500',
    emoji: '📊',
  },
]

export function getProfession(slug: string): Profession | undefined {
  return PROFESSIONS.find(p => p.slug === slug)
}
