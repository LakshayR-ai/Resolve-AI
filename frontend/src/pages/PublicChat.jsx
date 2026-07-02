import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Bot, User, Send, ThumbsUp, ThumbsDown, Loader2, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

// Standalone axios instance — no auth header needed
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
  return (
    <div className={clsx('flex items-end gap-3 message-enter', isUser && 'flex-row-reverse')}>
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-violet-600' : 'bg-violet-100'
      )}>
        {isUser ? <User size={15} className="text-white" /> : <Bot size={15} className="text-violet-600" />}
      </div>
      <div className={clsx('max-w-[78%] flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        <div className={clsx(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
          isUser
            ? 'bg-violet-600 text-white rounded-br-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
        )}>
          {msg.content}
        </div>
        {!isUser && msg.id && (
          <div className="flex items-center gap-1 px-1">
            <button onClick={() => onFeedback(msg.id, 'helpful')}
              className={clsx('p-1.5 rounded-lg transition text-xs', msg.feedback === 'helpful' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50')}>
              <ThumbsUp size={12} />
            </button>
            <button onClick={() => onFeedback(msg.id, 'not_helpful')}
              className={clsx('p-1.5 rounded-lg transition text-xs', msg.feedback === 'not_helpful' ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-500 hover:bg-red-50')}>
              <ThumbsDown size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PublicChat() {
  const { slug } = useParams()
  const [info, setInfo] = useState(null)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [infoLoading, setInfoLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    publicApi.get(`/widget/${slug}/info`)
      .then(r => {
        setInfo(r.data)
        setMessages([{ role: 'assistant', content: r.data.welcome_message }])
      })
      .catch(() => setError('This chatbot could not be found or is inactive.'))
      .finally(() => setInfoLoading(false))
  }, [slug])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await publicApi.post(`/widget/${slug}/chat`, {
        message: userMsg.content,
        session_id: sessionId,
      })
      setSessionId(data.session_id)
      setMessages(m => [...m, {
        id: data.message_id,
        role: 'assistant',
        content: data.answer,
        feedback: null,
      }])
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        content: "I'm having trouble responding right now. Please try again.",
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (messageId, feedback) => {
    try {
      await publicApi.post(`/widget/${slug}/feedback`, null, {
        params: { message_id: messageId, feedback }
      })
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
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-violet-100 overflow-hidden flex flex-col" style={{ height: '85vh', maxHeight: '700px' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            {info?.logo_url
              ? <img src={info.logo_url} alt={info.company_name} className="w-8 h-8 rounded-lg object-cover" />
              : <Bot size={20} className="text-white" />
            }
          </div>
          <div>
            <p className="font-semibold text-white">{info?.company_name} AI Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/80">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} onFeedback={handleFeedback} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions (shown when no messages sent yet) */}
        {messages.length === 1 && (
          <div className="px-6 pb-2 flex flex-wrap gap-2">
            {['What are your services?', 'How do I get started?', 'What is your pricing?'].map(q => (
              <button key={q} onClick={() => setInput(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <form onSubmit={send} className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              placeholder="Type your question..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="w-11 h-11 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-2">
            Powered by <span className="text-violet-500 font-medium">Resolve AI</span>
          </p>
        </div>
      </div>
    </div>
  )
}
