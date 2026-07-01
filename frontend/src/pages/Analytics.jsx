import { useEffect, useState } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { MessageSquare, Users, Clock, ThumbsUp, FileText, TrendingUp, Download, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/').then(r => setData(r.data)).catch(() => toast.error('Failed to load analytics')).finally(() => setLoading(false))
  }, [])

  const exportCSV = () => { window.open('/api/v1/analytics/export/csv', '_blank') }
  const exportJSON = () => { window.open('/api/v1/analytics/export/json', '_blank') }

  const chartData = tab === 'daily' ? data?.daily_stats : tab === 'weekly' ? data?.weekly_stats : data?.monthly_stats

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Insights into your AI support performance</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
              <Download size={16} /> CSV
            </button>
            <button onClick={exportJSON} className="btn-secondary flex items-center gap-2 text-sm">
              <Download size={16} /> JSON
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={MessageSquare} label="Total Chats" value={s?.total_chats ?? 0} color="bg-violet-500" />
          <StatCard icon={Users} label="Sessions" value={s?.total_sessions ?? 0} color="bg-blue-500" />
          <StatCard icon={Clock} label="Avg Response" value={`${s?.avg_response_time_ms ?? 0}ms`} color="bg-amber-500" />
          <StatCard icon={ThumbsUp} label="Helpful Rate" value={`${s?.helpful_feedback_pct ?? 0}%`} color="bg-emerald-500" />
        </div>

        {/* Chat volume chart */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Chat Volume</h3>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {['daily', 'weekly', 'monthly'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1 text-xs rounded-md font-medium capitalize transition ${tab === t ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip />
              <Line type="monotone" dataKey="chat_count" stroke="#7c3aed" strokeWidth={2} dot={false} name="Chats" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Category */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Issue Categories</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.category_breakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data?.sentiment_breakdown || []} dataKey="count" nameKey="sentiment"
                  cx="50%" cy="50%" outerRadius={80} label={({ sentiment, percentage }) => `${sentiment} ${percentage}%`}>
                  {(data?.sentiment_breakdown || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top questions */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Questions</h3>
          {data?.top_questions?.length > 0 ? (
            <div className="space-y-3">
              {data.top_questions.slice(0, 8).map((q, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400 w-5">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{q.question}</p>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(q.count / (data.top_questions[0]?.count || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right">{q.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">No data yet.</p>
          )}
        </div>
      </div>
    </Layout>
  )
}
