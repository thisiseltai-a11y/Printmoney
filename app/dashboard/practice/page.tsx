'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Loader2, Flag, CheckCircle, XCircle } from 'lucide-react'
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
  const [flagged, setFlagged] = useState<Set<number>>(new Set())

  useEffect(() => {
    supabaseClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
    const filtered = subject
      ? SAMPLE_QUESTIONS.filter(q => q.subject === subject)
      : SAMPLE_QUESTIONS
    setQuestions(filtered)
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

    const stored = localStorage.getItem('nurseedge_stats')
    const prev = stored ? JSON.parse(stored) : { totalAnswered: 0, correct: 0, streak: 0 }
    localStorage.setItem('nurseedge_stats', JSON.stringify({
      totalAnswered: prev.totalAnswered + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      streak: prev.streak,
    }))

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

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev)
      if (next.has(current)) next.delete(current)
      else next.add(current)
      return next
    })
  }

  if (!q) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const hasPassage = Boolean(q.passage)

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 flex-shrink-0">
        <div className="px-4 h-14 flex items-center justify-between gap-4">
          {/* Left: back */}
          <Link href="/dashboard" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Center: progress dots */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[50vw] no-scrollbar">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setSelected(null); setShowExplanation(false); setAiExplanation('') }}
                className={`flex-shrink-0 rounded-full transition-all ${
                  i === current
                    ? 'w-5 h-3 bg-blue-500'
                    : flagged.has(i)
                    ? 'w-3 h-3 bg-amber-500'
                    : 'w-3 h-3 bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {/* Right: flag + score */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={toggleFlag}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                flagged.has(current)
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-amber-400 border border-transparent'
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

      {/* ── Body ── */}
      {hasPassage ? (
        // Split layout for passage questions
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left: passage panel */}
          <div className="md:w-1/2 md:h-[calc(100vh-56px)] md:overflow-y-auto border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950">
            <div className="p-5 sm:p-7">
              {q.stimulusTotal && q.stimulusTotal > 1 && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full mb-4">
                  <BookOpen className="w-3.5 h-3.5" />
                  Stimulus: {q.stimulusIndex} of {q.stimulusTotal}
                </div>
              )}
              {q.passageTitle && (
                <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">{q.passageTitle}</h2>
              )}
              <div className="text-slate-300 text-sm leading-[1.85] whitespace-pre-line">
                {q.passage}
              </div>
            </div>
          </div>

          {/* Right: question panel */}
          <div className="md:w-1/2 md:h-[calc(100vh-56px)] md:overflow-y-auto">
            <div className="p-5 sm:p-7">
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
              />
            </div>
          </div>
        </div>
      ) : (
        // Single-column layout for non-passage questions
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-7">
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
            />
          </div>
        </div>
      )}
    </div>
  )
}

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
}

function QuestionPanel({ q, subjectInfo, selected, showExplanation, loadingExplanation, aiExplanation, current, total, onSelect, onNext }: PanelProps) {
  return (
    <div className="space-y-4">
      {/* Topic badge */}
      {subjectInfo && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
          <span>{subjectInfo.icon}</span>
          <span>{subjectInfo.label} — {q.topic}</span>
        </div>
      )}

      {/* Question */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p className="text-white text-sm sm:text-[15px] leading-relaxed font-medium">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {q.options.map((option, idx) => {
          let style = 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
          let icon = null
          if (selected !== null) {
            if (idx === q.correct) {
              style = 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
              icon = <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 ml-auto text-emerald-400" />
            } else if (idx === selected) {
              style = 'bg-rose-500/10 border-rose-500 text-rose-300'
              icon = <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 ml-auto text-rose-400" />
            } else {
              style = 'bg-slate-900 border-slate-800 text-slate-500'
            }
          }
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              disabled={selected !== null}
              className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all text-sm leading-snug ${style} ${selected === null ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-start gap-3">
                <span className="font-bold flex-shrink-0 w-5 text-center mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option}</span>
                {icon}
              </div>
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

      {/* Next button */}
      {selected !== null && (
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
        >
          {current < total - 1 ? 'Next Question' : 'Finish Session'}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

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
