import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  MessageSquare, FileText, Users, TrendingUp, ArrowRight,
  Loader2, CalendarDays, Calendar, ThumbsUp, ThumbsDown,
  Smile, Frown, Database, AlertTriangle, ExternalLink
} from 'lucide-react'
import Layout from '../components/Layout'

function StatCard({ icon: Icon, label, value, sub, color, loading, accent }) {
  return (
    <div className={`card flex items-center gap-4 ${accent || ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
        {loading ? (
          <div className="h-7 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value ?? 0}</p>
        )}
        {sub && !loading && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function SentimentBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [company, setCompany]     = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/').then(r => setAnalytics(r.data)).catch(() => {}),
      api.get('/company/profile').then(r => setCompany(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const s = analytics?.summary

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Here&apos;s what&apos;s happening with <strong className="text-gray-700 dark:text-gray-200">{user?.company_name}</strong>
            </p>
          </div>
          <a href={`/chat/${user?.company_slug}`} target="_blank" rel="noreferrer"
            className="btn-secondary flex items-center gap-2 text-sm">
            <ExternalLink size={15} /> View Chatbot
          </a>
        </div>

        {/* Primary stats — 4 cols */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard icon={MessageSquare} label="Total Chats"    value={s?.total_chats}    color="bg-violet-500" loading={loading} />
          <StatCard icon={CalendarDays}  label="Today's Chats"  value={s?.today_chats}    color="bg-indigo-500" loading={loading} />
          <StatCard icon={Calendar}      label="Monthly Chats"  value={s?.monthly_chats}  color="bg-blue-500"   loading={loading} />
          <StatCard icon={Users}         label="Sessions"        value={s?.total_sessions} color="bg-sky-500"    loading={loading} />
        </div>

        {/* Secondary stats — 4 cols */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText}    label="Documents"       value={s?.total_documents}   color="bg-emerald-500" loading={loading}
            sub={s ? `${s.knowledge_coverage}% indexed` : null} />
          <StatCard icon={TrendingUp}  label="Avg Response"    value={s ? `${s.avg_response_time_ms}ms` : null} color="bg-amber-500" loading={loading} />
          <StatCard icon={Smile}       label="Positive"         value={s ? `${s.positive_pct}%` : null}         color="bg-teal-500"  loading={loading} />
          <StatCard icon={Frown}       label="Negative"         value={s ? `${s.negative_pct}%` : null}         color="bg-rose-500"  loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { to: '/chat',      label: 'Start a chat session',   icon: MessageSquare, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950' },
                { to: '/documents', label: 'Upload documents',        icon: FileText,      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
                { to: '/analytics', label: 'View full analytics',     icon: TrendingUp,    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
                { to: '/history',   label: 'Browse chat history',     icon: Users,         color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
                { to: '/settings',  label: 'Get embed code',          icon: Database,      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950' },
              ].map(({ to, label, icon: Icon, color }) => (
                <Link key={to} to={to}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition group">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color.split(' ').slice(1).join(' ')}`}>
                      <Icon size={14} className={color.split(' ')[0]} />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition" />
                </Link>
              ))}
            </div>
          </div>

          {/* Sentiment overview */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Customer Sentiment</h3>
            {loading ? (
              <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
            ) : analytics?.sentiment_breakdown?.length > 0 ? (
              <div className="space-y-4">
                {analytics.sentiment_breakdown.map(s => (
                  <SentimentBar key={s.sentiment} label={s.sentiment}
                    value={s.percentage}
                    color={s.sentiment === 'Positive' ? 'bg-emerald-500' : s.sentiment === 'Negative' ? 'bg-rose-500' : 'bg-blue-400'}
                  />
                ))}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Helpful feedback</span>
                  <span className="font-semibold text-emerald-600">{analytics.summary.helpful_feedback_pct}%</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare size={28} className="text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-400">No data yet. Start chatting!</p>
              </div>
            )}
          </div>

          {/* Knowledge Base status */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Knowledge Base</h3>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Coverage</span>
                  <span className="font-bold text-gray-900 dark:text-white">{s?.knowledge_coverage ?? 0}%</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${s?.knowledge_coverage ?? 0}%` }} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Total Documents</span>
                    <span className="font-medium text-gray-900 dark:text-white">{s?.total_documents ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Feedback Rating</span>
                    <span className="font-medium text-gray-900 dark:text-white">{analytics?.feedback_rating ? `${(analytics.feedback_rating * 100).toFixed(0)}%` : '—'}</span>
                  </div>
                </div>
                <Link to="/documents" className="mt-4 flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:underline">
                  Manage Knowledge Base <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Top questions + failed queries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Most Asked Questions</h3>
            {loading ? (
              <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
            ) : analytics?.top_questions?.length > 0 ? (
              <div className="space-y-2">
                {analytics.top_questions.slice(0, 5).map((q, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 w-5 flex-shrink-0">#{i+1}</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{q.question}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{q.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No questions yet.</p>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-amber-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Most Failed Queries</h3>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
            ) : analytics?.top_failed_queries?.length > 0 ? (
              <div className="space-y-2">
                {analytics.top_failed_queries.slice(0, 5).map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                    <AlertTriangle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{q.query}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <ThumbsUp size={24} className="text-emerald-400 mb-2" />
                <p className="text-sm text-gray-400">No failed queries — great coverage!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  )
}
