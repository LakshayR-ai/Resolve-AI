import { useState, useRef, useEffect } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import { Send, ThumbsUp, ThumbsDown, Bot, User, Loader2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 message-enter">
      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center flex-shrink-0">
        <Bot size={16} className="text-violet-600 dark:text-violet-300" />
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
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
          ? <User size={16} className="text-white" />
          : <Bot size={16} className="text-violet-600 dark:text-violet-300" />
        }
      </div>
      <div className={clsx('max-w-[75%]', isUser ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
        <div className={clsx(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-violet-600 text-white rounded-br-sm'
            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
        )}>
          {msg.content}
        </div>
        {!isUser && msg.id && (
          <div className="flex items-center gap-2 px-1">
            {msg.category && (
              <span className="badge bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400">{msg.category}</span>
            )}
            <button onClick={() => onFeedback(msg.id, 'helpful')}
              className={clsx('p-1 rounded transition', msg.feedback === 'helpful' ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-500')}>
              <ThumbsUp size={13} />
            </button>
            <button onClick={() => onFeedback(msg.id, 'not_helpful')}
              className={clsx('p-1 rounded transition', msg.feedback === 'not_helpful' ? 'text-red-500' : 'text-gray-300 hover:text-red-500')}>
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const newSession = () => {
    setMessages([])
    setSessionId(null)
    toast('New chat started', { icon: '💬' })
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/chat/', {
        message: userMsg.content,
        session_id: sessionId,
      })
      setSessionId(data.session_id)
      setMessages(m => [...m, {
        id: data.message_id,
        role: 'assistant',
        content: data.answer,
        category: data.category,
        feedback: null,
      }])
    } catch (err) {
      toast.error('Failed to send message. Try again.')
      setMessages(m => m.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (messageId, feedback) => {
    try {
      await api.post('/chat/feedback', { message_id: messageId, feedback })
      setMessages(m => m.map(msg => msg.id === messageId ? { ...msg, feedback } : msg))
      toast.success(feedback === 'helpful' ? '👍 Thanks for the feedback!' : '👎 We\'ll improve!')
    } catch {
      toast.error('Failed to submit feedback')
    }
  }

  return (
    <Layout>
      <div className="flex flex-col h-screen max-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">AI Chat</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {sessionId ? `Session: ${sessionId.slice(0, 8)}...` : 'No active session'}
            </p>
          </div>
          <button onClick={newSession} className="btn-secondary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center mb-4">
                <Bot size={32} className="text-violet-600 dark:text-violet-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">How can I help you?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                Ask me anything about your company. I&apos;ll answer from your uploaded knowledge base.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} onFeedback={handleFeedback} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-8 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="input flex-1"
              placeholder="Type your message..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="btn-primary flex items-center gap-2 px-5">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
