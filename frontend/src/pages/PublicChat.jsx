import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Bot, User, Send, ThumbsUp, ThumbsDown, Loader2, AlertCircle, PhoneCall, X, FileText } from 'lucide-react'
import clsx from 'clsx'

const publicApi = axios.create({ baseURL: '/api/v1' })

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
        <Bot size={16} className="text-violet-600" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
          <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
          <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
        </div>
      </div>
    </div>
  )
}

function Message({ msg, onFeedback }) {
  const isUser = msg.role === 'user'
  if (msg.role === 'system') return null
  return (
    <div className={clsx('flex items-end gap-3 message-enter', isUser && 'flex-row-reverse')}>
      <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-violet-600' : 'bg-violet-100')}>
        {isUser ? <User size={15} className="text-white" /> : <Bot size={15} className="text-violet-600" />}
      </div>
      <div className={clsx('max-w-[78%] flex flex-col gap-1.5', isUser ? 'items-end' : 'items-start')}>
        <div className={clsx('px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
          isUser
            ? 'bg-violet-600 text-white rounded-br-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm')}>
          {msg.content}
        </div>
        {msg.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {msg.sources.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full text-[10px] border border-violet-100">
                <FileText size={9} />{s.split('/').pop() || `Source ${i+1}`}
              </span>
            ))}
          </div>
        )}
        {!isUser && msg.id && (
          <div className="flex items-center gap-1 px-1">
            <button onClick={() => onFeedback(msg.id, 'helpful')}
              className={clsx('p-1.5 rounded-lg transition', msg.feedback === 'helpful' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50')}>
              <ThumbsUp size={12} />
            </button>
            <button onClick={() => onFeedback(msg.id, 'not_helpful')}
              className={clsx('p-1.5 rounded-lg transition', msg.feedback === 'not_helpful' ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-500 hover:bg-red-50')}>
              <ThumbsDown size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EscalateModal({ slug, sessionId, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', reason: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await publicApi.post(`/widget/${slug}/escalate`, {
        session_id: sessionId,
        customer_name: form.name,
        customer_email: form.email,
        reason: form.reason,
      })
      setDone(true)
    } catch {
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Talk to a Human</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <PhoneCall size={20} className="text-emerald-600" />
            </div>
            <p className="font-medium text-gray-900 mb-1">Request received!</p>
            <p className="text-sm text-gray-500">A support agent will contact you shortly.</p>
            <button onClick={onClose} className="mt-4 btn-primary w-full">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Your Name</label>
              <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="John Smith" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@email.com" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">What do you need help with?</label>
              <textarea className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                rows={3} value={form.reason} onChange={e => setForm(f => ({...f, reason: e.target.value}))} placeholder="Describe your issue..." />
            </div>
            <button type="submit" disabled={loading || !form.email}
              className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <PhoneCall size={15} />}
              {loading ? 'Sending...' : 'Request Human Support'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function PublicChat() {
  const { slug } = useParams()
  const [info,        setInfo]        = useState(null)
  const [error,       setError]       = useState(null)
  const [messages,    setMessages]    = useState([])
  const [input,       setInput]       = useState('')
  const [sessionId,   setSessionId]   = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [infoLoading, setInfoLoading] = useState(true)
  const [showEscalate, setShowEscalate] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    publicApi.get(`/widget/${slug}/info`)
      .then(r => { setInfo(r.data); setMessages([{ role: 'assistant', content: r.data.welcome_message }]) })
      .catch(() => setError('This chatbot could not be found or is currently inactive.'))
      .finally(() => setInfoLoading(false))
  }, [slug])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const { data } = await publicApi.post(`/widget/${slug}/chat`, { message: msg, session_id: sessionId })
      setSessionId(data.session_id)
      setMessages(m => [...m, { id: data.message_id, role: 'assistant', content: data.answer, feedback: null }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "I'm having trouble right now. Please try again." }])
    } finally {
      setLoading(false) }
  }

  const handleFeedback = async (messageId, feedback) => {
    try {
      await publicApi.post(`/widget/${slug}/feedback`, null, { params: { message_id: messageId, feedback } })
      setMessages(m => m.map(msg => msg.id === messageId ? { ...msg, feedback } : msg))
    } catch {}
  }

  if (infoLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
      <Loader2 size={32} className="animate-spin text-violet-600" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Chatbot Not Found</h2>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {showEscalate && sessionId && (
        <EscalateModal slug={slug} sessionId={sessionId} onClose={() => setShowEscalate(false)} />
      )}

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-violet-100 overflow-hidden flex flex-col"
        style={{ height: '88vh', maxHeight: '720px' }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              {info?.logo_url
                ? <img src={info.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                : <Bot size={20} className="text-white" />}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{info?.company_name} AI Assistant</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-white/80">Online · Powered by Resolve AI</span>
              </div>
            </div>
          </div>
          {sessionId && (
            <button onClick={() => setShowEscalate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition">
              <PhoneCall size={13} /> Talk to Human
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50/40">
          {messages.map((msg, i) => <Message key={i} msg={msg} onFeedback={handleFeedback} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length === 1 && (
          <div className="px-6 pb-2 flex flex-wrap gap-2">
            {['What are your services?', 'How do I get started?', 'What is your pricing?', 'How do I contact support?'].map(q => (
              <button key={q} onClick={() => send(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="Type your question…" disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()}
              className="w-11 h-11 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition flex-shrink-0">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
          <p className="text-center text-[11px] text-gray-400 mt-2">
            Powered by <span className="text-violet-500 font-medium">Resolve AI</span> · AI can make mistakes
          </p>
        </div>
      </div>
    </div>
  )
}
