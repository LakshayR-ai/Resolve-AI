import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'
import Layout from '../components/Layout'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  MessageSquare, Users, Clock, ThumbsUp, Download,
  Loader2, CalendarDays, Calendar, Smile, Database, AlertTriangle, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

const PALETTE = ['#6C63FF', '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#7C3AED', '#0891B2']
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '13px', fontWeight: 600, color: p.color }}>{p.value} chats</p>
      ))}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, sub, gradient, delay = 0 }) {
  return (
    <motion.div variants={item}
      className="card relative overflow-hidden"
      whileHover={{ y: -2, transition: { duration: 0.15 } }}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-6 translate-x-4 -translate-y-4"
        style={{ background: gradient }} />
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: gradient }}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-2xl font-bold font-display text-gray-900 dark:text-white">{value ?? 0}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function Analytics() {
  const [data,    setData]    = useState(null)
  const [tab,     setTab]     = useState('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const chartData = { hourly: data?.hourly_stats, daily: data?.daily_stats, weekly: data?.weekly_stats, monthly: data?.monthly_stats }[tab]
  const s = data?.summary

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-3">
          <Loader2 size={24} className="animate-spin" style={{ color: '#6C63FF' }} />
          <span className="text-sm text-gray-500">Loading analytics…</span>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Performance insights for your AI support</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.open('/api/v1/analytics/export/csv', '_blank')}
              className="btn-secondary text-xs flex items-center gap-1.5">
              <Download size={13} /> CSV
            </button>
            <button onClick={() => window.open('/api/v1/analytics/export/json', '_blank')}
              className="btn-secondary text-xs flex items-center gap-1.5">
              <Download size={13} /> JSON
            </button>
          </div>
        </motion.div>

        {/* KPI row 1 */}
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <KpiCard icon={MessageSquare} label="Total Chats"  value={s?.total_chats}    gradient="linear-gradient(135deg,#6C63FF,#7C3AED)" />
          <KpiCard icon={CalendarDays}  label="Today"         value={s?.today_chats}    gradient="linear-gradient(135deg,#2563EB,#3B82F6)" />
          <KpiCard icon={Calendar}      label="This Month"    value={s?.monthly_chats}  gradient="linear-gradient(135deg,#0891B2,#06B6D4)" />
          <KpiCard icon={Users}         label="Sessions"       value={s?.total_sessions} gradient="linear-gradient(135deg,#7C3AED,#8B5CF6)" />
        </motion.div>

        {/* KPI row 2 */}
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard icon={Clock}     label="Avg Response"        value={`${s?.avg_response_time_ms ?? 0}ms`}   gradient="linear-gradient(135deg,#D97706,#F59E0B)" />
          <KpiCard icon={ThumbsUp}  label="Helpful Rate"        value={`${s?.helpful_feedback_pct ?? 0}%`}   gradient="linear-gradient(135deg,#059669,#10B981)" />
          <KpiCard icon={Smile}     label="Positive Sentiment"  value={`${s?.positive_pct ?? 0}%`}           gradient="linear-gradient(135deg,#0891B2,#10B981)" />
          <KpiCard icon={Database}  label="Knowledge Coverage"  value={`${s?.knowledge_coverage ?? 0}%`}     gradient="linear-gradient(135deg,#6C63FF,#2563EB)"
            sub={`${s?.total_documents ?? 0} documents indexed`} />
        </motion.div>

        {/* Volume chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold font-display text-gray-900 dark:text-white">Chat Volume</h3>
              <p className="text-xs text-gray-400 mt-0.5">Conversations over time</p>
            </div>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#F1F5F9' }}>
              {['hourly', 'daily', 'weekly', 'monthly'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all capitalize"
                  style={tab === t
                    ? { background: 'white', color: '#6C63FF', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                    : { color: '#94A3B8' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData || []}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6C63FF" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="chat_count" stroke="#6C63FF" strokeWidth={2.5}
                fill="url(#areaGrad)" dot={false} name="Chats" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Categories */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card">
            <h3 className="font-semibold font-display text-gray-900 dark:text-white mb-1">Issue Categories</h3>
            <p className="text-xs text-gray-400 mb-5">What customers ask about most</p>
            {data?.category_breakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.category_breakdown} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Questions">
                    {data.category_breakdown.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 py-8 text-center">No data yet</p>}
          </motion.div>

          {/* Sentiment */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="card">
            <h3 className="font-semibold font-display text-gray-900 dark:text-white mb-1">Sentiment</h3>
            <p className="text-xs text-gray-400 mb-4">Customer mood analysis</p>
            {data?.sentiment_breakdown?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={data.sentiment_breakdown} dataKey="count" nameKey="sentiment"
                      cx="50%" cy="50%" outerRadius={72} innerRadius={40} paddingAngle={3}>
                      {data.sentiment_breakdown.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center flex-wrap gap-4 mt-3">
                  {data.sentiment_breakdown.map((s, i) => (
                    <div key={s.sentiment} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: PALETTE[i % PALETTE.length] }} />
                      {s.sentiment} <span className="font-semibold">{s.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="text-sm text-gray-400 py-8 text-center">No data yet</p>}
          </motion.div>
        </div>

        {/* Satisfaction + top questions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="card">
            <h3 className="font-semibold font-display text-gray-900 dark:text-white mb-5">Customer Satisfaction</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center">
                <p className="text-5xl font-black font-display" style={{ color: '#6C63FF' }}>
                  {data?.feedback_rating ? `${(data.feedback_rating * 100).toFixed(0)}%` : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Satisfaction score</p>
                <div className="flex gap-0.5 mt-2">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="text-base"
                      style={{ color: i <= Math.round((data?.feedback_rating || 0) * 5) ? '#F59E0B' : '#E5E7EB' }}>★</span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: '👍 Helpful',    pct: s?.helpful_feedback_pct ?? 0,     color: '#10B981' },
                  { label: '👎 Not helpful', pct: s?.not_helpful_feedback_pct ?? 0, color: '#EF4444' },
                  { label: '😊 Positive',   pct: s?.positive_pct ?? 0,             color: '#0891B2' },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                        style={{ background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold font-display text-gray-900 dark:text-white">Top Questions</h3>
              {data?.top_failed_queries?.length > 0 && (
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#D97706' }}>
                  <AlertTriangle size={11} />
                  {data.top_failed_queries.length} gaps
                </span>
              )}
            </div>
            {data?.top_questions?.length > 0 ? (
              <div className="space-y-2">
                {data.top_questions.slice(0, 6).map((q, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    <span className="text-xs font-bold w-5 text-center flex-shrink-0"
                      style={{ color: i < 3 ? '#6C63FF' : '#CBD5E1' }}>#{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 truncate">{q.question}</p>
                      <div className="h-1 rounded-full mt-1" style={{ background: '#F1F5F9', width: '100%' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${(q.count / (data.top_questions[0]?.count || 1)) * 100}%`, background: 'linear-gradient(90deg, #6C63FF, #7C3AED)' }} />
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 flex-shrink-0">{q.count}×</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp size={24} className="mb-2" style={{ color: '#CBD5E1' }} />
                <p className="text-sm text-gray-400">No questions yet</p>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </Layout>
  )
}
