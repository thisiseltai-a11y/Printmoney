'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'What exactly is ATS optimization?',
    a: "ATS (Applicant Tracking System) is software that over 99% of Fortune 500 companies use to automatically screen resumes before a human ever sees them. The system scans for specific keywords from the job description. If your resume doesn't have them, it gets rejected automatically — even if you're a great fit. We analyze the job description and weave those exact keywords into your resume naturally.",
  },
  {
    q: 'How long does it actually take?',
    a: 'Under 60 seconds for the AI to generate. The form itself takes about 5–10 minutes to fill out thoughtfully. The more detail you provide (especially pasting the full job description), the better the output.',
  },
  {
    q: "What if I don't have much experience?",
    a: "No problem. Our AI is trained to maximize what you do have — it re-frames internships, projects, and transferable skills to sound compelling and relevant. It's especially good at making entry-level candidates look strong.",
  },
  {
    q: 'Can I edit the resume after it\'s generated?',
    a: "Absolutely. The output is plain text you can copy into Word, Google Docs, or any editor. You can also go back to the form, tweak your inputs, and regenerate completely free. Iterate until it's exactly right.",
  },
  {
    q: 'Is my personal information secure?',
    a: "Yes. Your data is processed securely to generate your resume and is never sold to third parties or used to train AI models. We don't store your full resume data after delivery.",
  },
  {
    q: 'What if I\'m not happy with the result?',
    a: "We have a 100% satisfaction guarantee. If the output isn't what you expected, regenerate with different inputs or reach out and we'll make it right. We don't want your money unless the resume is genuinely useful to you.",
  },
  {
    q: 'How is this different from just using ChatGPT?',
    a: "Great question. Raw ChatGPT gives generic outputs that sound like AI wrote them. We use a specialized prompt system tuned specifically for resumes — ATS formatting, action verbs, quantifiable achievement frameworks, recruiter-specific language. The difference in quality is significant.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">FAQs</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Questions? We've got answers.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-6">
                  <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
