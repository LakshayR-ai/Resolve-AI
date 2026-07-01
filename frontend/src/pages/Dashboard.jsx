import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { MessageSquare, FileText, Users, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? 0}</p>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/').then(r => setAnalytics(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stats = analytics?.summary

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening with <strong>{user?.company_name}</strong>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={MessageSquare} label="Total Chats" value={stats?.total_chats} color="bg-violet-500" loading={loading} />
          <StatCard icon={Users} label="Total Sessions" value={stats?.total_sessions} color="bg-blue-500" loading={loading} />
          <StatCard icon={FileText} label="Documents" value={stats?.total_documents} color="bg-emerald-500" loading={loading} />
          <StatCard icon={TrendingUp} label="Avg Response" value={stats ? `${stats.avg_response_time_ms}ms` : null} color="bg-amber-500" loading={loading} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { to: '/chat', label: 'Start a chat session', icon: MessageSquare, color: 'text-violet-600' },
                { to: '/documents', label: 'Upload documents', icon: FileText, color: 'text-emerald-600' },
                { to: '/analytics', label: 'View analytics', icon: TrendingUp, color: 'text-blue-600' },
              ].map(({ to, label, icon: Icon, color }) => (
                <Link key={to} to={to}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition group">
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={color} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition" />
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sentiment Overview</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
              </div>
            ) : analytics?.sentiment_breakdown?.length > 0 ? (
              <div className="space-y-3">
                {analytics.sentiment_breakdown.map(s => (
                  <div key={s.sentiment}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{s.sentiment}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{s.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.sentiment === 'Positive' ? 'bg-emerald-500' : s.sentiment === 'Negative' ? 'bg-red-500' : 'bg-blue-400'}`}
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No data yet. Start chatting!</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
