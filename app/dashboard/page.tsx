'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, LogOut, BarChart3, CheckCircle, Clock, ArrowRight, Trophy } from 'lucide-react'
import { SUBJECTS } from '@/lib/questions'
import { hasFreeAccess } from '@/lib/access'
import { getUser, signOut as authSignOut } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalAnswered: 0, correct: 0, streak: 0 })
  const [freeAccess, setFreeAccess] = useState(false)

  useEffect(() => {
    const init = async () => {
      const user = await getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      setFreeAccess(hasFreeAccess(user.email))

      // Load stats from localStorage for now
      const stored = localStorage.getItem('nurseedge_stats')
      if (stored) setStats(JSON.parse(stored))
      setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    await authSignOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const accuracy = stats.totalAnswered > 0 ? Math.round((stats.correct / stats.totalAnswered) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">NurseEdge</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">{user?.user_metadata?.full_name || user?.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            Hey {user?.user_metadata?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-400">Ready to study? Pick a subject to start practicing.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, label: 'Questions answered', value: stats.totalAnswered },
            { icon: <BarChart3 className="w-5 h-5 text-blue-400" />, label: 'Accuracy', value: `${accuracy}%` },
            { icon: <Trophy className="w-5 h-5 text-amber-400" />, label: 'Day streak', value: stats.streak },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-center">
              <div className="flex justify-center mb-2">{s.icon}</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Subjects */}
        <h2 className="text-lg font-bold text-white mb-4">Choose a subject</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {SUBJECTS.map(s => (
            <Link
              key={s.id}
              href={`/dashboard/practice?subject=${s.id}`}
              className="group bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-6 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{s.icon}</span>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </div>
              <h3 className="font-bold text-white text-lg mb-1">{s.label}</h3>
              <p className="text-slate-400 text-sm">{s.description}</p>
            </Link>
          ))}
        </div>

        {/* Mock Exam CTA */}
        <div className="bg-gradient-to-r from-blue-900/50 to-teal-900/50 border border-blue-700/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white">Full Mock Exam</h3>
            </div>
            <p className="text-slate-400 text-sm">Simulate the real TEAS experience. 170 questions, timed, all subjects.</p>
          </div>
          <Link
            href="/dashboard/exam"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
          >
            Start Exam
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
