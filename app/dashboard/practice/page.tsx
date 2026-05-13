'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, ArrowRight, BookOpen, Loader2 } from 'lucide-react'
import { SAMPLE_QUESTIONS, SUBJECTS, type Question, type Subject } from '@/lib/questions'
import { supabaseClient } from '@/lib/supabase'

function PracticeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') as Subject | null

  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [aiExplanation, setAiExplanation] = useState('')

  useEffect(() => {
    supabaseClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
    const filtered = subject
      ? SAMPLE_QUESTIONS.filter(q => q.subject === subject)
      : SAMPLE_QUESTIONS
    setQuestions(filtered.sort(() => Math.random() - 0.5))
  }, [subject, router])

  const subjectInfo = SUBJECTS.find(s => s.id === subject)
  const q = questions[current]

  const handleSelect = async (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    setShowExplanation(true)

    const isCorrect = idx === q.correct
    const newStats = { correct: sessionStats.correct + (isCorrect ? 1 : 0), total: sessionStats.total + 1 }
    setSessionStats(newStats)

    // Update localStorage stats
    const stored = localStorage.getItem('nurseedge_stats')
    const prev = stored ? JSON.parse(stored) : { totalAnswered: 0, correct: 0, streak: 0 }
    localStorage.setItem('nurseedge_stats', JSON.stringify({
      totalAnswered: prev.totalAnswered + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      streak: prev.streak,
    }))

    // Get AI explanation for wrong answers
    if (!isCorrect) {
      setLoadingExplanation(true)
      try {
        const res = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q.question,
            options: q.options,
            correctIndex: q.correct,
            selectedIndex: idx,
            baseExplanation: q.explanation,
          }),
        })
        const data = await res.json()
        if (data.explanation) setAiExplanation(data.explanation)
      } catch { /* use base explanation */ } finally {
        setLoadingExplanation(false)
      }
    }
  }

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
      setShowExplanation(false)
      setAiExplanation('')
    } else {
      router.push('/dashboard')
    }
  }

  if (!q) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{current + 1} / {questions.length}</span>
            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="text-sm font-semibold text-emerald-400">{sessionStats.correct}/{sessionStats.total} correct</div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Subject badge */}
        {subjectInfo && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-6">
            <span>{subjectInfo.icon}</span>
            <span>{subjectInfo.label} — {q.topic}</span>
          </div>
        )}

        {/* Question */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-5">
          <p className="text-white text-base sm:text-lg leading-relaxed font-medium">{q.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options.map((option, idx) => {
            let style = 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
            if (selected !== null) {
              if (idx === q.correct) style = 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
              else if (idx === selected) style = 'bg-rose-500/10 border-rose-500 text-rose-300'
              else style = 'bg-slate-900 border-slate-800 text-slate-500'
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-sm leading-relaxed ${style} ${selected === null ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span>{option}</span>
                  {selected !== null && idx === q.correct && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 ml-auto" />}
                  {selected !== null && idx === selected && idx !== q.correct && <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 ml-auto" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`rounded-2xl p-5 sm:p-6 mb-6 border ${selected === q.correct ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-slate-700'}`}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white">Explanation</span>
            </div>
            {loadingExplanation ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Getting detailed explanation...
              </div>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed">{aiExplanation || q.explanation}</p>
            )}
          </div>
        )}

        {/* Next button */}
        {selected !== null && (
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            {current < questions.length - 1 ? 'Next Question' : 'Finish Session'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PracticeContent />
    </Suspense>
  )
}
