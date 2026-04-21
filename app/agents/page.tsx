import Link from 'next/link'
import { Rocket } from 'lucide-react'
import { AGENTS } from '@/lib/agents'

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">ResumeRocket</span>
          </Link>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">AI Team</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Your AI Team</h1>
          <p className="text-slate-400 text-lg">
            Six specialists, all briefed on ResumeRocket. Ask them anything.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent) => (
            <Link
              key={agent.slug}
              href={`/agents/${agent.slug}`}
              className="group block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 hover:bg-slate-800 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${agent.bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-sm font-bold ${agent.color}`}>{agent.initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{agent.name}</p>
                  <p className="text-xs text-slate-400">{agent.title}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{agent.focus}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
                Chat with {agent.name}
                <span className="ml-1 group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
