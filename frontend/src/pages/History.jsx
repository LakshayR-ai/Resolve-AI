import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import Layout from '../components/Layout'
import {
  Search, MessageSquare, ChevronRight, User, Bot,
  Loader2, Filter, X, Download, Clock
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const SENTIMENTS  = ['', 'Positive', 'Neutral', 'Negative']
const CATEGORIES  = ['', 'Billing', 'Shipping', 'Technical', 'Account', 'Product', 'Cancellation', 'General']

const SENT_COLORS = {
  Positive: { bg: 'rgba(16,185,129,0.1)',   color: '#10B981' },
  Negative: { bg: 'rgba(239,68,68,0.1)',    color: '#EF4444' },
  Neutral:  { bg: 'rgba(108,99,255,0.1)',   color: '#6C63FF' },
}

export default function History() {
  const [sessions, setSessions]           = useState([])
  const [selected, setSelected]           = useState(null)
  const [messages, setMessages]           = useState([])
  const [loading,  setLoading]            = useState(true)
  const [msgLoad,  setMsgLoad]            = useState(false)
  const [search,   setSearch]             = useState('')
  const [sentiment, setSentiment]         = useState('')
  const [category,  setCategory]          = useState('')
  const [total,    setTotal]              = useState(0)
  const [page,     setPage]               = useState(1)
  const PAGE = 20

  const load = (p = 1) => {
    setLoading(true)
    api.get('/chat/history/sessions', { params: { page: p, page_size: PAGE } })
      .then(r => { setSessions(r.data.sessions); setTotal(r.data.total) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openSession = id => {
    setSelected(id)
    setMsgLoad(true)
    api.get(`/chat/history/sessions/${id}`)
      .then(r => setMessages(r.data.messages))
      .catch(() => toast.error('Failed to load conversation'))
      .finally(() => setMsgLoad(false))
  }

  const doSearch = () => {
    setLoading(true)
    api.get('/chat/history/search', { params: { query: search, sentiment, category, page: 1, page_size: PAGE } })
      .then(r => { setSessions([]); setTotal(r.data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const clear = () => { setSearch(''); setSentiment(''); setCategory(''); load() }

  return (
    <Layout>
      <div className="flex h-screen overflow-hidden">

        {/* Left panel */}
        <div className="w-[340px] flex-shrink-0 flex flex-col"
          style={{ borderRight: '1px solid rgba(0,0,0,0.06)', background: 'white' }}>

          {/* Header */}
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <h2 className="text-base font-bold font-display text-gray-900 mb-3">Chat History</h2>

            {/* Search */}
            <div className="relative mb-2">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl outline-none"
                style={{ background: '#F8FAFC', border: '1px solid #E5E7EB' }}
                placeholder="Search conversations…" />
            </div>

            {/* Filters */}
            <div className="flex gap-1.5 mb-2">
              <select value={sentiment} onChange={e => setSentiment(e.target.value)}
                className="flex-1 py-1.5 px-2 text-xs rounded-lg outline-none"
                style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', color: '#374151' }}>
                {SENTIMENTS.map(s => <option key={s} value={s}>{s || 'All Sentiments'}</option>)}
              </select>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="flex-1 py-1.5 px-2 text-xs rounded-lg outline-none"
                style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', color: '#374151' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Types'}</option>)}
              </select>
            </div>

            <div className="flex gap-1.5">
              <button onClick={doSearch}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-lg font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #6C63FF, #7C3AED)' }}>
                <Filter size={11} /> Filter
              </button>
              <button onClick={clear}
                className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', color: '#6B7280' }}>
                <X size={13} />
              </button>
              <button onClick={() => window.open('/api/v1/analytics/export/csv', '_blank')}
                className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', color: '#6B7280' }}>
                <Download size={13} />
              </button>
            </div>
          </div>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare size={32} className="mb-3" style={{ color: '#E2E8F0' }} />
                <p className="text-sm text-gray-400">No sessions found</p>
              </div>
            ) : sessions.map(s => (
              <motion.button key={s.session_id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => openSession(s.session_id)}
                className={clsx('w-full text-left px-4 py-3.5 transition-all border-b',
                  selected === s.session_id
                    ? 'border-b-transparent'
                    : 'border-gray-50')}
                style={selected === s.session_id
                  ? { background: 'rgba(108,99,255,0.06)', borderLeft: '3px solid #6C63FF' }
                  : { background: 'transparent', borderLeft: '3px solid transparent' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {s.customer_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <MessageSquare size={10} />
                      {s.message_count} messages
                      <span className="opacity-50">·</span>
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight size={13} className="text-gray-300 flex-shrink-0 mt-0.5" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Pagination */}
          {total > PAGE && (
            <div className="px-4 py-3 flex items-center justify-between text-xs"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <button disabled={page <= 1} onClick={() => { setPage(p => p-1); load(page-1) }}
                className="px-3 py-1.5 rounded-lg disabled:opacity-40"
                style={{ background: '#F8FAFC', border: '1px solid #E5E7EB' }}>← Prev</button>
              <span className="text-gray-400">{page} / {Math.ceil(total/PAGE)}</span>
              <button disabled={page >= Math.ceil(total/PAGE)} onClick={() => { setPage(p => p+1); load(page+1) }}
                className="px-3 py-1.5 rounded-lg disabled:opacity-40"
                style={{ background: '#F8FAFC', border: '1px solid #E5E7EB' }}>Next →</button>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F8FAFC' }}>
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(108,99,255,0.06)' }}>
                  <MessageSquare size={28} style={{ color: '#6C63FF', opacity: 0.5 }} />
                </div>
                <p className="font-semibold text-gray-600 mb-1">Select a conversation</p>
                <p className="text-sm text-gray-400">Choose a session from the left to view messages</p>
              </motion.div>
            ) : msgLoad ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin" style={{ color: '#6C63FF' }} />
              </motion.div>
            ) : (
              <motion.div key={selected} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                className="flex flex-col flex-1 overflow-hidden">
                {/* Session header */}
                <div className="px-6 py-4 flex-shrink-0"
                  style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <p className="text-sm font-semibold text-gray-900">
                    Session <span className="font-mono text-violet-600 text-xs">{selected.slice(0,16)}…</span>
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <Clock size={11} /> {messages.length} messages
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                  {messages.filter(m => m.role !== 'system').map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={clsx('flex items-end gap-3', m.role === 'user' && 'flex-row-reverse')}>
                      <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0')}
                        style={m.role === 'user'
                          ? { background: 'linear-gradient(135deg, #6C63FF, #7C3AED)' }
                          : { background: 'rgba(108,99,255,0.1)' }}>
                        {m.role === 'user'
                          ? <User size={12} className="text-white" />
                          : <Bot size={12} style={{ color: '#6C63FF' }} />}
                      </div>
                      <div className={clsx('max-w-[70%] flex flex-col gap-1.5', m.role === 'user' ? 'items-end' : 'items-start')}>
                        <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                          style={m.role === 'user'
                            ? { background: 'linear-gradient(135deg, #6C63FF, #7C3AED)', color: 'white', borderRadius: '18px 18px 4px 18px' }
                            : { background: 'white', color: '#111827', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '18px 18px 18px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                          {m.content}
                        </div>
                        <div className="flex items-center gap-1.5 px-1">
                          {m.sentiment && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ background: SENT_COLORS[m.sentiment]?.bg || 'rgba(108,99,255,0.08)', color: SENT_COLORS[m.sentiment]?.color || '#6C63FF' }}>
                              {m.sentiment}
                            </span>
                          )}
                          {m.category && m.role === 'user' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px]"
                              style={{ background: 'rgba(0,0,0,0.04)', color: '#6B7280' }}>
                              {m.category}
                            </span>
                          )}
                          {m.feedback && (
                            <span className="text-[10px]">{m.feedback === 'helpful' ? '👍' : '👎'}</span>
                          )}
                          <span className="text-[10px] text-gray-300">
                            {new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  )
}
