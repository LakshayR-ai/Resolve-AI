import { useState, useEffect } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import { Search, MessageSquare, ChevronRight, User, Bot, Loader2, Filter, X } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const SENTIMENTS = ['', 'Positive', 'Neutral', 'Negative']
const CATEGORIES = ['', 'Billing', 'Shipping', 'Technical', 'Account', 'Product', 'Cancellation', 'General']

const SENTIMENT_COLORS = {
  Positive: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  Negative: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
  Neutral: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
}

export default function History() {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [sentiment, setSentiment] = useState('')
  const [category, setCategory] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const load = (p = 1) => {
    setLoading(true)
    api.get('/chat/history/sessions', { params: { page: p, page_size: PAGE_SIZE } })
      .then(r => { setSessions(r.data.sessions); setTotal(r.data.total) })
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openSession = (sessionId) => {
    setSelectedSession(sessionId)
    setMsgLoading(true)
    api.get(`/chat/history/sessions/${sessionId}`)
      .then(r => setMessages(r.data.messages))
      .catch(() => toast.error('Failed to load conversation'))
      .finally(() => setMsgLoading(false))
  }

  const searchMessages = () => {
    setLoading(true)
    api.get('/chat/history/search', { params: { query: search, sentiment, category, page: 1, page_size: PAGE_SIZE } })
      .then(r => { setSessions([]); setTotal(r.data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const clearFilters = () => { setSearch(''); setSentiment(''); setCategory(''); load() }

  return (
    <Layout>
      <div className="flex h-screen overflow-hidden">
        {/* Left panel — sessions */}
        <div className="w-96 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Chat History</h1>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchMessages()}
                className="input pl-8 text-sm" placeholder="Search messages..." />
            </div>
            <div className="flex gap-2">
              <select value={sentiment} onChange={e => setSentiment(e.target.value)}
                className="input text-xs flex-1 py-1.5">
                {SENTIMENTS.map(s => <option key={s} value={s}>{s || 'All Sentiments'}</option>)}
              </select>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="input text-xs flex-1 py-1.5">
                {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={searchMessages} className="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center gap-1">
                <Filter size={12} /> Filter
              </button>
              <button onClick={clearFilters} className="btn-secondary text-xs py-1.5 px-3">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 size={24} className="animate-spin text-violet-600" /></div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No sessions found</p>
              </div>
            ) : sessions.map(s => (
              <button key={s.session_id} onClick={() => openSession(s.session_id)}
                className={clsx(
                  'w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800 transition hover:bg-gray-50 dark:hover:bg-gray-800',
                  selectedSession === s.session_id && 'bg-violet-50 dark:bg-violet-950'
                )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {s.customer_name || 'Anonymous Customer'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {s.message_count} messages · {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 mt-1 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          {total > PAGE_SIZE && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1) }}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">← Prev</button>
              <span className="text-xs text-gray-500">{page} / {Math.ceil(total / PAGE_SIZE)}</span>
              <button disabled={page >= Math.ceil(total / PAGE_SIZE)} onClick={() => { setPage(p => p + 1); load(page + 1) }}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>

        {/* Right panel — messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Select a conversation to view messages</p>
              </div>
            </div>
          ) : msgLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-violet-600" />
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Session: <span className="font-mono text-violet-600">{selectedSession.slice(0, 16)}...</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{messages.length} messages</p>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={clsx('flex items-start gap-3', m.role === 'user' && 'flex-row-reverse')}>
                    <div className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      m.role === 'user' ? 'bg-violet-600' : 'bg-gray-100 dark:bg-gray-800'
                    )}>
                      {m.role === 'user'
                        ? <User size={13} className="text-white" />
                        : <Bot size={13} className="text-gray-500 dark:text-gray-400" />
                      }
                    </div>
                    <div className={clsx('max-w-[70%] flex flex-col gap-1', m.role === 'user' ? 'items-end' : 'items-start')}>
                      <div className={clsx(
                        'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                        m.role === 'user'
                          ? 'bg-violet-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                      )}>
                        {m.content}
                      </div>
                      <div className="flex items-center gap-2 px-1">
                        {m.sentiment && (
                          <span className={clsx('badge text-[10px]', SENTIMENT_COLORS[m.sentiment] || 'bg-gray-100 text-gray-600')}>
                            {m.sentiment}
                          </span>
                        )}
                        {m.category && m.role === 'user' && (
                          <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px]">
                            {m.category}
                          </span>
                        )}
                        {m.feedback && (
                          <span className={clsx('badge text-[10px]', m.feedback === 'helpful' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>
                            {m.feedback === 'helpful' ? '👍' : '👎'}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">{new Date(m.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
