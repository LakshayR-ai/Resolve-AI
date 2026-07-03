import { useState, useRef, useEffect } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import { Send, ThumbsUp, ThumbsDown, Bot, User, Loader2, Plus, FileText, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 message-enter">
      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center flex-shrink-0">
        <Bot size={16} className="text-violet-600 dark:text-violet-300" />
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
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
        isUser ? 'bg-violet-600' : 'bg-violet-100 dark:bg-violet-900'
      )}>
        {isUser
          ? <User size={15} className="text-white" />
          : <Bot size={15} className="text-violet-600 dark:text-violet-300" />
        }
      </div>

      <div className={clsx('max-w-[75%] flex flex-col gap-1.5', isUser ? 'items-end' : 'items-start')}>
        <div className={clsx(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
          isUser
            ? 'bg-violet-600 text-white rounded-br-sm'
            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
        )}>
          {msg.content}
        </div>

        {/* Sources / citations */}
        {!isUser && msg.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {msg.sources.map((src, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 rounded-full text-[11px] border border-violet-100 dark:border-violet-900">
                <FileText size={10} />
                {src.split('/').pop() || `Source ${i+1}`}
              </span>
            ))}
          </div>
        )}

        {/* Feedback + category */}
        {!isUser && msg.id && (
          <div className="flex items-center gap-2 px-1">
            {msg.category && (
              <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[11px]">
                {msg.category}
              </span>
            )}
            <button onClick={() => onFeedback(msg.id, 'helpful')}
              className={clsx('p-1.5 rounded-lg transition', msg.feedback === 'helpful'
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950')}>
              <ThumbsUp size={13} />
            </button>
            <button onClick={() => onFeedback(msg.id, 'not_helpful')}
              className={clsx('p-1.5 rounded-lg transition', msg.feedback === 'not_helpful'
                ? 'text-red-500 bg-red-50 dark:bg-red-950'
                : 'text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950')}>
              <ThumbsDown size={13} />
            </button>
            {msg.response_time_ms && (
              <span className="text-[11px] text-gray-300 dark:text-gray-600">{msg.response_time_ms}ms</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const SUGGESTED = [
  'What services do you offer?',
  'How do I get started?',
  'What is your pricing?',
  'How do I contact support?',
]

export default function Chat() {
  const { user } = useAuth()
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [loading,   setLoading]   = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const newSession = () => {
    setMessages([])
    setSessionId(null)
    toast('New chat started', { icon: '💬' })
  }

  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    setMessages(m => [...m, userMsg])
    setLoading(true)

    try {
      const { data } = await api.post('/chat/', {
        message: msg,
        session_id: sessionId,
      })
      setSessionId(data.session_id)
      setMessages(m => [...m, {
        id: data.message_id,
        role: 'assistant',
        content: data.answer,
        category: data.category,
        sources: data.sources || [],
        response_time_ms: data.response_time_ms,
        feedback: null,
      }])
    } catch (err) {
      toast.error('Failed to send. Please try again.')
      setMessages(m => m.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (messageId, feedback) => {
    try {
      await api.post('/chat/feedback', { message_id: messageId, feedback })
      setMessages(m => m.map(msg => msg.id === messageId ? { ...msg, feedback } : msg))
      toast.success(feedback === 'helpful' ? '👍 Thanks!' : '👎 Got it, we\'ll improve!')
    } catch { toast.error('Failed to submit feedback') }
  }

  return (
    <Layout>
      <div className="flex flex-col h-screen max-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
              {user?.company_name} AI Assistant
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {sessionId ? `Session: ${sessionId.slice(0,8)}…` : 'No active session'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/chat/${user?.company_slug}`} target="_blank" rel="noreferrer"
              className="btn-secondary flex items-center gap-1.5 text-xs">
              <ExternalLink size={13} /> Customer View
            </a>
            <button onClick={newSession} className="btn-secondary flex items-center gap-1.5 text-xs">
              <Plus size={14} /> New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-gray-50/30 dark:bg-gray-950/30">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Bot size={30} className="text-violet-600 dark:text-violet-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How can I help you?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                I answer from your uploaded knowledge base. Ask me anything about your company.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {SUGGESTED.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900 transition">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} onFeedback={handleFeedback} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="input flex-1"
              placeholder="Ask anything…"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="btn-primary flex items-center gap-2 px-5 min-w-[90px] justify-center">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? '' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
