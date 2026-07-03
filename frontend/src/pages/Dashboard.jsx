import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  MessageSquare, FileText, TrendingUp, ArrowRight, Zap,
  CalendarDays, Calendar, Smile, Frown, Database,
  AlertTriangle, ExternalLink, Users, BarChart3, Clock
} from 'lucide-react'
import Layout from '../components/Layout'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const STAT_CONFIGS = [
  { key: 'total_chats',    label: 'Total Chats',     icon: MessageSquare, gradient: 'linear-gradient(135deg,#6C63FF,#7C3AED)', textColor: '#6C63FF' },
  { key: 'today_chats',   label: "Today's Chats",   icon: CalendarDays,  gradient: 'linear-gradient(135deg,#2563EB,#3B82F6)', textColor: '#2563EB' },
  { key: 'monthly_chats', label: 'This Month',       icon: Calendar,      gradient: 'linear-gradient(135deg,#0891B2,#06B6D4)', textColor: '#0891B2' },
  { key: 'total_sessions',label: 'Sessions',          icon: Users,         gradient: 'linear-gradient(135deg,#7C3AED,#8B5CF6)', textColor: '#7C3AED' },
  { key: 'total_documents',label: 'Documents',        icon: FileText,      gradient: 'linear-gradient(135deg,#059669,#10B981)', textColor: '#059669', sub: d => `${d?.knowledge_coverage ?? 0}% indexed` },
  { key: 'avg_response_time_ms', label: 'Avg Response', icon: Clock,       gradient: 'linear-gradient(135deg,#D97706,#F59E0B)', textColor: '#D97706', format: v => `${v}ms` },
  { key: 'positive_pct',  label: 'Positive',          icon: Smile,         gradient: 'linear-gradient(135deg,#0891B2,#10B981)', textColor: '#0891B2', format: v => `${v}%` },
  { key: 'negative_pct',  label: 'Negative',          icon: Frown,         gradient: 'linear-gradient(135deg,#DC2626,#EF4444)', textColor: '#DC2626', format: v => `${v}%` },
]

function StatCard({ config, summary, loading }) {
  const { key, label, icon: Icon, gradient, textColor, sub, format } = config
  const raw = summary?.[key]
  const value = format ? format(raw ?? 0) : (raw ?? 0)

  return (
    <motion.div variants={item}
      className="card card-hover relative overflow-hidden"
      whileHover={{ y: -3, transition: { duration: 0.2 } }}>
      {/* background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 translate-x-6 -translate-y-6"
        style={{ background: gradient }} />

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: gradient }}>
          <Icon size={17} className="text-white" />
        </div>
        <TrendingUp size={13} className="text-gray-300 dark:text-gray-700" />
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-8 w-20 rounded-lg" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold tracking-tight font-display"
            style={{ color: textColor }}>{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub ? sub(summary) : label}</p>
        </>
      )}
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    api.get('/analytics/').then(r => setAnalytics(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const s = analytics?.summary
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
                {greeting}, {user?.full_name?.split(' ')[0]}
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Here&apos;s what&apos;s happening with{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.company_name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/chat/${user?.company_slug}`} target="_blank" rel="noreferrer"
              className="btn-secondary text-sm flex items-center gap-1.5">
              <ExternalLink size={14} /> Live Widget
            </a>
            <Link to="/chat" className="btn-primary text-sm flex items-center gap-1.5">
              <Zap size={14} /> New Chat
            </Link>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STAT_CONFIGS.map(cfg => (
            <StatCard key={cfg.key} config={cfg} summary={s} loading={loading} />
          ))}
        </motion.div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 font-display">Quick Actions</h3>
            <div className="space-y-1">
              {[
                { to: '/chat',      label: 'Start a conversation',  icon: MessageSquare, color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
                { to: '/documents', label: 'Upload documents',       icon: FileText,      color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
                { to: '/analytics', label: 'View analytics',         icon: BarChart3,     color: '#2563EB', bg: 'rgba(37,99,235,0.08)'  },
                { to: '/history',   label: 'Browse chat history',    icon: Users,         color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
                { to: '/settings',  label: 'Get embed code',         icon: Database,      color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
              ].map(({ to, label, icon: Icon, color, bg }) => (
                <Link key={to} to={to}
                  className="flex items-center justify-between p-3 rounded-xl transition-all group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: bg }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Sentiment */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-5 font-display">Customer Sentiment</h3>
            {loading ? (
              <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
            ) : analytics?.sentiment_breakdown?.length > 0 ? (
              <div className="space-y-4">
                {analytics.sentiment_breakdown.map(s => {
                  const colors = { Positive: '#10B981', Negative: '#EF4444', Neutral: '#6C63FF' }
                  const bgs =    { Positive: 'rgba(16,185,129,0.1)', Negative: 'rgba(239,68,68,0.1)', Neutral: 'rgba(108,99,255,0.1)' }
                  return (
                    <div key={s.sentiment} className="p-3 rounded-xl" style={{ background: bgs[s.sentiment] || 'rgba(108,99,255,0.05)' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold" style={{ color: colors[s.sentiment] }}>{s.sentiment}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{s.percentage}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/50 dark:bg-black/20 overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${s.percentage}%` }}
                          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                          style={{ background: colors[s.sentiment] }} />
                      </div>
                    </div>
                  )
                })}
                <div className="pt-1 flex justify-between text-xs text-gray-500">
                  <span>Helpful rate</span>
                  <span className="font-semibold text-emerald-600">{s?.helpful_feedback_pct ?? 0}%</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare size={28} className="text-gray-200 dark:text-gray-700 mb-3" />
                <p className="text-sm text-gray-400">No sentiment data yet</p>
                <p className="text-xs text-gray-400 mt-1">Start chatting to see insights</p>
              </div>
            )}
          </motion.div>

          {/* Top questions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-white font-display">Top Questions</h3>
              <Link to="/analytics" className="text-xs text-violet-600 hover:underline">View all</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-9 rounded-xl" />)}</div>
            ) : analytics?.top_questions?.length > 0 ? (
              <div className="space-y-2">
                {analytics.top_questions.slice(0, 5).map((q, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <span className="text-xs font-bold w-5 text-center flex-shrink-0"
                      style={{ color: i === 0 ? '#6C63FF' : i === 1 ? '#7C3AED' : '#94A3B8' }}>
                      #{i+1}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-1 truncate">{q.question}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 font-mono">{q.count}x</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart3 size={28} className="text-gray-200 dark:text-gray-700 mb-3" />
                <p className="text-sm text-gray-400">No questions yet</p>
              </div>
            )}

            {/* Failed queries alert */}
            {analytics?.top_failed_queries?.length > 0 && (
              <div className="mt-4 p-3 rounded-xl flex items-start gap-2.5"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Knowledge gap detected</p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-0.5">
                    {analytics.top_failed_queries.length} questions couldn't be answered
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
