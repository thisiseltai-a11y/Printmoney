'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Loader2, Flag, CheckCircle, XCircle } from 'lucide-react'
import { SAMPLE_QUESTIONS, SUBJECTS, type Question, type Subject } from '@/lib/questions'
import { supabaseClient } from '@/lib/supabase'

// ── helpers ──────────────────────────────────────────────────────────────────

/** A passage is "long" if it has multiple stimulus questions. Short/standalone passages are shown inline above the question. */
function isLongPassage(q: Question) {
  return Boolean(q.passage && q.stimulusTotal && q.stimulusTotal > 1)
}

// ── main component ────────────────────────────────────────────────────────────

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
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  // track answer state per question so Previous shows correct state
  const [answers, setAnswers] = useState<(number | null)[]>([])

  useEffect(() => {
    supabaseClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
    const filtered = subject
      ? SAMPLE_QUESTIONS.filter(q => q.subject === subject)
      : SAMPLE_QUESTIONS
    setQuestions(filtered)
    setAnswers(new Array(filtered.length).fill(null))
  }, [subject, router])

  const subjectInfo = SUBJECTS.find(s => s.id === subject)
  const q = questions[current]

  const goTo = (idx: number) => {
    setCurrent(idx)
    // restore saved answer state for that question
    const savedAnswer = answers[idx] ?? null
    setSelected(savedAnswer)
    setShowExplanation(savedAnswer !== null)
    setAiExplanation('')
    setLoadingExplanation(false)
  }

  const handleSelect = async (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    setShowExplanation(true)

    // save answer
    const newAnswers = [...answers]
    newAnswers[current] = idx
    setAnswers(newAnswers)

    const isCorrect = idx === q.correct
    const newStats = { correct: sessionStats.correct + (isCorrect ? 1 : 0), total: sessionStats.total + 1 }
    setSessionStats(newStats)

    try {
      const stored = localStorage.getItem('nurseedge_stats')
      const prev = stored ? JSON.parse(stored) : { totalAnswered: 0, correct: 0, streak: 0 }
      localStorage.setItem('nurseedge_stats', JSON.stringify({
        totalAnswered: prev.totalAnswered + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        streak: prev.streak,
      }))
    } catch {}

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
    if (current < questions.length - 1) goTo(current + 1)
    else router.push('/dashboard')
  }

  const handlePrev = () => {
    if (current > 0) goTo(current - 1)
  }

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev)
      if (next.has(current)) next.delete(current)
      else next.add(current)
      return next
    })
  }

  if (!q || questions.length === 0) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const splitLayout = isLongPassage(q)

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 flex-shrink-0">
        <div className="px-4 h-14 flex items-center justify-between gap-3">

          {/* Back */}
          <Link href="/dashboard" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Progress dots */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[50vw] no-scrollbar py-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                title={`Question ${i + 1}`}
                className={`flex-shrink-0 rounded-full transition-all duration-200 ${
                  i === current
                    ? 'w-5 h-3 bg-blue-500'
                    : answers[i] !== null
                    ? answers[i] === questions[i].correct
                      ? 'w-3 h-3 bg-emerald-500'
                      : 'w-3 h-3 bg-rose-500'
                    : flagged.has(i)
                    ? 'w-3 h-3 bg-amber-500'
                    : 'w-3 h-3 bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {/* Flag + score */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleFlag}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                flagged.has(current)
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'text-slate-400 hover:text-amber-400 border-transparent'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{flagged.has(current) ? 'Flagged' : 'Flag'}</span>
            </button>
            <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg">
              {sessionStats.correct}/{sessionStats.total}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      {splitLayout ? (
        // SPLIT LAYOUT — long passage left, question right
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left: passage */}
          <div className="md:w-1/2 md:h-[calc(100vh-56px)] md:overflow-y-auto border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60">
            <div className="p-5 sm:p-7 lg:p-8">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Use the passage below to answer the question.
              </p>
              {q.passageTitle && (
                <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">{q.passageTitle}</h2>
              )}
              <div className="text-slate-300 text-sm leading-[1.9] whitespace-pre-line">
                {q.passage}
              </div>
            </div>
          </div>

          {/* Right: question */}
          <div className="md:w-1/2 md:h-[calc(100vh-56px)] md:overflow-y-auto">
            <div className="p-5 sm:p-7 lg:p-8">
              {q.stimulusTotal && q.stimulusTotal > 1 && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full mb-4">
                  <BookOpen className="w-3.5 h-3.5" />
                  Stimulus: {q.stimulusIndex} of {q.stimulusTotal}
                </div>
              )}
              <QuestionPanel
                q={q}
                subjectInfo={subjectInfo}
                selected={selected}
                showExplanation={showExplanation}
                loadingExplanation={loadingExplanation}
                aiExplanation={aiExplanation}
                current={current}
                total={questions.length}
                onSelect={handleSelect}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            </div>
          </div>
        </div>
      ) : (
        // SINGLE-COLUMN — short/no passage, centered
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-7">
            {/* Inline short passage */}
            {q.passage && (
              <div className="mb-5 p-5 bg-slate-900/60 border border-slate-800 rounded-xl">
                {q.passageTitle && (
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{q.passageTitle}</p>
                )}
                <p className="text-slate-200 text-sm leading-[1.9] font-medium">{q.passage}</p>
              </div>
            )}
            <QuestionPanel
              q={q}
              subjectInfo={subjectInfo}
              selected={selected}
              showExplanation={showExplanation}
              loadingExplanation={loadingExplanation}
              aiExplanation={aiExplanation}
              current={current}
              total={questions.length}
              onSelect={handleSelect}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── QuestionPanel ─────────────────────────────────────────────────────────────

interface PanelProps {
  q: Question
  subjectInfo: ReturnType<typeof SUBJECTS.find>
  selected: number | null
  showExplanation: boolean
  loadingExplanation: boolean
  aiExplanation: string
  current: number
  total: number
  onSelect: (idx: number) => void
  onNext: () => void
  onPrev: () => void
}

function QuestionPanel({ q, subjectInfo, selected, showExplanation, loadingExplanation, aiExplanation, current, total, onSelect, onNext, onPrev }: PanelProps) {
  return (
    <div className="space-y-4">
      {/* Topic badge */}
      {subjectInfo && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
          <span>{subjectInfo.icon}</span>
          <span>{subjectInfo.label} — {q.topic}</span>
        </div>
      )}

      {/* Question text */}
      <p className="text-white text-sm sm:text-[15px] leading-relaxed font-semibold">{q.question}</p>

      {/* Answer choices — circular radio style */}
      <div className="space-y-2">
        {q.options.map((option, idx) => {
          const isAnswered = selected !== null
          const isCorrect = idx === q.correct
          const isSelected = idx === selected

          let ringClass = 'border-slate-600 bg-slate-900 text-slate-300 hover:border-slate-400 hover:bg-slate-800'
          let dotClass = 'border-slate-500'
          let dotFillClass = ''

          if (isAnswered) {
            if (isCorrect) {
              ringClass = 'border-emerald-500 bg-emerald-500/8 text-emerald-200'
              dotClass = 'border-emerald-500 bg-emerald-500'
              dotFillClass = 'bg-white'
            } else if (isSelected) {
              ringClass = 'border-rose-500 bg-rose-500/8 text-rose-300'
              dotClass = 'border-rose-500 bg-rose-500'
              dotFillClass = 'bg-white'
            } else {
              ringClass = 'border-slate-700 bg-slate-900 text-slate-500'
              dotClass = 'border-slate-600'
            }
          }

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              disabled={isAnswered}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all text-sm leading-snug flex items-start gap-3 ${ringClass} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {/* Radio circle */}
              <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${dotClass}`}>
                {isAnswered && (isCorrect || isSelected) && (
                  <span className={`w-2 h-2 rounded-full ${dotFillClass}`} />
                )}
              </span>
              <span className="flex-1">{option}</span>
              {isAnswered && isCorrect && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />}
              {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`rounded-xl p-4 sm:p-5 border ${selected === q.correct ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-slate-700'}`}>
          <div className="flex items-center gap-2 mb-2.5">
            <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
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

      {/* Navigation — Previous / Continue */}
      <div className="flex items-center justify-between pt-1 gap-3">
        <button
          onClick={onPrev}
          disabled={current === 0}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            current === 0
              ? 'opacity-0 pointer-events-none'
              : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        {selected !== null && (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm ml-auto"
          >
            {current < total - 1 ? 'Continue' : 'Finish'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── page export ───────────────────────────────────────────────────────────────

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PracticeContent />
    </Suspense>
  )
}
