import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import {
  Send, ThumbsUp, ThumbsDown, Bot, User, Plus,
  FileText, ExternalLink, Sparkles, Copy, Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(124,58,237,0.15))' }}>
        <Bot size={15} style={{ color: '#6C63FF' }} />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 typing-dot" />
        </div>
      </div>
    </motion.div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="p-1 rounded transition-colors text-gray-400 hover:text-gray-600">
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  )
}

function Message({ msg, onFeedback }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={clsx('flex items-end gap-3', isUser && 'flex-row-reverse')}>
      <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',)}
        style={isUser
          ? { background: 'linear-gradient(135deg, #6C63FF, #7C3AED)' }
          : { background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(124,58,237,0.08))' }}>
        {isUser
          ? <User size={14} className="text-white" />
          : <Bot size={14} style={{ color: '#6C63FF' }} />
        }
      </div>

      <div className={clsx('max-w-[76%] flex flex-col gap-1.5', isUser ? 'items-end' : 'items-start')}>
        <div className={clsx('relative px-4 py-3 rounded-2xl text-sm leading-relaxed group')}
          style={isUser
            ? { background: 'linear-gradient(135deg, #6C63FF, #7C3AED)', color: 'white', borderRadius: '18px 18px 4px 18px', boxShadow: '0 4px 12px rgba(108,99,255,0.25)' }
            : { background: 'white', color: '#111827', borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
          }>
          <p className="whitespace-pre-wrap">{msg.content}</p>
          {!isUser && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={msg.content} />
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && msg.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {msg.sources.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: 'rgba(108,99,255,0.08)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.15)' }}>
                <FileText size={9} />
                {s.split('/').pop() || `Source ${i+1}`}
              </span>
            ))}
          </div>
        )}

        {/* Feedback */}
        {!isUser && msg.id && (
          <div className="flex items-center gap-1 px-1">
            {msg.category && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: 'rgba(108,99,255,0.06)', color: '#6C63FF' }}>
                {msg.category}
              </span>
            )}
            <button onClick={() => onFeedback(msg.id, 'helpful')}
              className={clsx('p-1.5 rounded-lg transition-all', msg.feedback === 'helpful'
                ? 'bg-emerald-50 text-emerald-500' : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50')}>
              <ThumbsUp size={12} />
            </button>
            <button onClick={() => onFeedback(msg.id, 'not_helpful')}
              className={clsx('p-1.5 rounded-lg transition-all', msg.feedback === 'not_helpful'
                ? 'bg-red-50 text-red-500' : 'text-gray-300 hover:text-red-500 hover:bg-red-50')}>
              <ThumbsDown size={12} />
            </button>
            {msg.response_time_ms && (
              <span className="text-[10px] text-gray-300 ml-1">{msg.response_time_ms}ms</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

const SUGGESTIONS = [
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
  const inputRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const newSession = () => {
    setMessages([])
    setSessionId(null)
    toast('New session started', { icon: '💬' })
    inputRef.current?.focus()
  }

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const { data } = await api.post('/chat/', { message: msg, session_id: sessionId })
      setSessionId(data.session_id)
      setMessages(m => [...m, {
        id: data.message_id, role: 'assistant', content: data.answer,
        category: data.category, sources: data.sources || [],
        response_time_ms: data.response_time_ms, feedback: null,
      }])
    } catch {
      toast.error('Failed to send. Please try again.')
      setMessages(m => m.slice(0, -1))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleFeedback = async (id, feedback) => {
    try {
      await api.post('/chat/feedback', { message_id: id, feedback })
      setMessages(m => m.map(msg => msg.id === id ? { ...msg, feedback } : msg))
      toast.success(feedback === 'helpful' ? '👍 Thanks!' : '👎 Got it!')
    } catch { toast.error('Feedback failed') }
  }

  return (
    <Layout>
      <div className="flex flex-col h-screen">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(124,58,237,0.08))' }}>
              <Sparkles size={16} style={{ color: '#6C63FF' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 font-display">{user?.company_name} AI</p>
              <p className="text-[11px] text-gray-400">
                {sessionId ? `Session · ${sessionId.slice(0,8)}…` : 'Ready to help'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/chat/${user?.company_slug}`} target="_blank" rel="noreferrer"
              className="btn-ghost text-xs flex items-center gap-1.5">
              <ExternalLink size={13} /> Customer view
            </a>
            <button onClick={newSession} className="btn-secondary text-xs flex items-center gap-1.5">
              <Plus size={13} /> New chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
          style={{ background: '#F8FAFC' }}>

          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center pt-16">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(124,58,237,0.08))' }}>
                  <Sparkles size={28} style={{ color: '#6C63FF' }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">How can I help?</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                  I answer from your knowledge base. Ask anything about {user?.company_name}.
                </p>
                <div className="flex flex-wrap justify-center gap-2 max-w-md">
                  {SUGGESTIONS.map(q => (
                    <motion.button key={q} onClick={() => send(q)}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="text-xs px-4 py-2 rounded-full transition-all font-medium"
                      style={{ background: 'white', border: '1px solid rgba(108,99,255,0.2)', color: '#6C63FF', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} onFeedback={handleFeedback} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 flex-shrink-0"
          style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <form onSubmit={e => { e.preventDefault(); send() }}
            className="flex gap-3 p-1 rounded-2xl"
            style={{ background: '#F8FAFC', border: '1.5px solid rgba(108,99,255,0.2)', boxShadow: '0 0 0 3px rgba(108,99,255,0.04)' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Ask anything about your company…"
              disabled={loading}
            />
            <motion.button type="submit" disabled={loading || !input.trim()}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #7C3AED)' }}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Send size={15} className="text-white" />
              }
            </motion.button>
          </form>
          <p className="text-center text-[11px] text-gray-400 mt-2">
            Powered by Gemini 2.5 Flash · RAG · Only answers from your documents
          </p>
        </div>
      </div>
    </Layout>
  )
}
