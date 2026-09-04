import { getAdminStats } from '@/lib/db'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const stats = await getAdminStats()

  return (
    <div className="min-h-screen bg-bg px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-grotesk text-2xl font-semibold text-ink">Admin</h1>
          <LogoutButton />
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Total Lookups" value={stats.totalLookups.toLocaleString()} />
          <Stat label="Free Decodes" value={stats.totalFree.toLocaleString()} />
          <Stat label="Reports Sold" value={stats.totalPaid.toLocaleString()} color="text-teal" />
          <Stat
            label="Revenue"
            value={`$${(stats.totalRevenueCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            color="text-amber"
          />
        </div>

        <div className="mt-8 rounded-card border border-line bg-panel">
          <div className="border-b border-line px-6 py-4 font-grotesk text-sm font-semibold text-ink">
            Recent activity
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-muted">
                  <th className="px-6 py-3 font-mono text-xs uppercase tracking-wider">VIN</th>
                  <th className="px-6 py-3 font-mono text-xs uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 font-mono text-xs uppercase tracking-wider">When</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-6 text-muted">
                      No lookups yet.
                    </td>
                  </tr>
                )}
                {stats.recent.map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="readout px-6 py-3 text-ink">{r.vin}</td>
                    <td className="px-6 py-3">
                      <span className={r.type === 'paid' ? 'text-amber' : 'text-teal'}>{r.type}</span>
                    </td>
                    <td className="px-6 py-3 text-muted">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color = 'text-ink' }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-card border border-line bg-panel p-5">
      <div className="font-mono text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-2 font-mono text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  )
}
