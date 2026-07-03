import { useEffect, useState } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  MessageSquare, Users, Clock, ThumbsUp, Download, Loader2,
  CalendarDays, Calendar, Smile, Database, AlertTriangle, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value ?? 0}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={17} className="text-white" />
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, sub }) {
  return (
    <div className="mb-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Analytics() {
  const [data, setData]   = useState(null)
  const [tab, setTab]     = useState('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const exportCSV  = () => window.open('/api/v1/analytics/export/csv', '_blank')
  const exportJSON = () => window.open('/api/v1/analytics/export/json', '_blank')

  const volumeData = tab === 'daily'   ? data?.daily_stats
                   : tab === 'weekly'  ? data?.weekly_stats
                   : tab === 'monthly' ? data?.monthly_stats
                   :                    data?.hourly_stats

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={32} className="animate-spin text-violet-600" />
      </div>
    </Layout>
  )

  const s = data?.summary

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Insights into your AI support performance</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV}  className="btn-secondary flex items-center gap-2 text-sm"><Download size={15}/> CSV</button>
            <button onClick={exportJSON} className="btn-secondary flex items-center gap-2 text-sm"><Download size={15}/> JSON</button>
          </div>
        </div>

        {/* Stats row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard icon={MessageSquare} label="Total Chats"   value={s?.total_chats}    color="bg-violet-500" />
          <StatCard icon={CalendarDays}  label="Today"          value={s?.today_chats}    color="bg-indigo-500" />
          <StatCard icon={Calendar}      label="This Month"     value={s?.monthly_chats}  color="bg-blue-500" />
          <StatCard icon={Users}         label="Sessions"        value={s?.total_sessions} color="bg-sky-500" />
        </div>

        {/* Stats row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Clock}      label="Avg Response"       value={`${s?.avg_response_time_ms ?? 0}ms`} color="bg-amber-500" />
          <StatCard icon={ThumbsUp}   label="Helpful Rate"       value={`${s?.helpful_feedback_pct ?? 0}%`} color="bg-emerald-500" />
          <StatCard icon={Smile}      label="Positive Sentiment" value={`${s?.positive_pct ?? 0}%`}         color="bg-teal-500" />
          <StatCard icon={Database}   label="Knowledge Coverage" value={`${s?.knowledge_coverage ?? 0}%`}   color="bg-fuchsia-500"
            sub={`${s?.total_documents ?? 0} documents`} />
        </div>

        {/* Chat Volume — with tab switcher */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="Chat Volume" sub="Messages sent to the AI" />
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {['hourly', 'daily', 'weekly', 'monthly'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1 text-xs rounded-md font-medium capitalize transition
                    ${tab === t ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={volumeData || []}>
              <defs>
                <linearGradient id="chatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="chat_count" stroke="#7c3aed" strokeWidth={2}
                fill="url(#chatGrad)" name="Chats" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category + Sentiment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <SectionHeader title="Issue Categories" sub="Types of questions customers ask" />
            {data?.category_breakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={data.category_breakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none' }} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} name="Questions" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 py-8 text-center">No data yet.</p>}
          </div>

          <div className="card">
            <SectionHeader title="Sentiment Distribution" sub="Customer mood analysis" />
            {data?.sentiment_breakdown?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={data.sentiment_breakdown} dataKey="count" nameKey="sentiment"
                      cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                      {data.sentiment_breakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {data.sentiment_breakdown.map((s, i) => (
                    <div key={s.sentiment} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {s.sentiment} {s.percentage}%
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="text-sm text-gray-400 py-8 text-center">No data yet.</p>}
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="card mb-6">
          <SectionHeader title="Customer Satisfaction" sub="Feedback ratings over time" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 flex flex-col justify-center items-center gap-2 py-4">
              <div className="text-5xl font-black text-violet-600">
                {(analytics_rating(data?.feedback_rating))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Satisfaction Score</p>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`text-lg ${i <= Math.round((data?.feedback_rating || 0) * 5) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}>★</span>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">👍 Helpful</span>
                  <span className="font-semibold text-emerald-600">{s?.helpful_feedback_pct ?? 0}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s?.helpful_feedback_pct ?? 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">👎 Not Helpful</span>
                  <span className="font-semibold text-red-500">{s?.not_helpful_feedback_pct ?? 0}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${s?.not_helpful_feedback_pct ?? 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">😊 Positive Sentiment</span>
                  <span className="font-semibold text-teal-600">{s?.positive_pct ?? 0}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${s?.positive_pct ?? 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top questions + Failed queries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <SectionHeader title="Top Questions" sub="Most frequently asked" />
            {data?.top_questions?.length > 0 ? (
              <div className="space-y-3">
                {data.top_questions.slice(0, 8).map((q, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 w-5 flex-shrink-0">#{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{q.question}</p>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${(q.count / (data.top_questions[0]?.count || 1)) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 w-8 text-right">{q.count}x</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400 py-4 text-center">No data yet.</p>}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={15} className="text-amber-500" />
              <SectionHeader title="Knowledge Gaps" sub="Questions the AI couldn't answer" />
            </div>
            {data?.top_failed_queries?.length > 0 ? (
              <div className="space-y-2">
                {data.top_failed_queries.map((q, i) => (
                  <div key={i} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{q.query}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Add documents to cover this topic</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp size={28} className="text-emerald-400 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">No gaps — great knowledge coverage!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  )
}

function analytics_rating(r) {
  if (!r) return '—'
  return `${(r * 100).toFixed(0)}%`
}
