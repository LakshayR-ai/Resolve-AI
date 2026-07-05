import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import {
  Send, ThumbsUp, ThumbsDown, Bot, User, Plus, FileText,
  ExternalLink, Sparkles, Copy, Check, RotateCcw, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const SKL = 'linear-gradient(90deg,#F1F5F9 25%,#E8EDF5 50%,#F1F5F9 75%)'

function TypingDots() {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:10 }}>
      <div style={{ width:32,height:32,borderRadius:'50%',flexShrink:0,
        background:'linear-gradient(135deg,rgba(108,99,255,.15),rgba(124,58,237,.1))',
        display:'flex',alignItems:'center',justifyContent:'center' }}>
        <Bot size={15} color="#6C63FF" />
      </div>
      <div style={{ padding:'12px 16px', borderRadius:'18px 18px 18px 4px',
        background:'white', border:'1px solid rgba(108,99,255,.1)',
        boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
        <div style={{ display:'flex', gap:5, alignItems:'center', height:16 }}>
          {[0,1,2].map(i => (
            <div key={i} className="typing-dot" style={{ width:7,height:7,borderRadius:'50%',
              background:'#94A3B8', animationDelay:`${i*.18}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function CopyBtn({ text }) {
  const [c, setC] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setC(true); setTimeout(()=>setC(false),2000) }}
      style={{ padding:5, borderRadius:6, border:'none', background:'none', cursor:'pointer',
        color: c ? '#10B981' : '#94A3B8', transition:'color .15s', display:'flex' }}>
      {c ? <Check size={13}/> : <Copy size={13}/>}
    </button>
  )
}

function Msg({ msg, onFeedback }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      style={{ display:'flex', alignItems:'flex-end', gap:10,
        flexDirection: isUser ? 'row-reverse' : 'row' }}>
      <div style={{ width:32,height:32,borderRadius:'50%',flexShrink:0,
        background: isUser
          ? 'linear-gradient(135deg,#6C63FF,#7C3AED)'
          : 'linear-gradient(135deg,rgba(108,99,255,.15),rgba(124,58,237,.1))',
        display:'flex',alignItems:'center',justifyContent:'center',
        boxShadow: isUser ? '0 2px 8px rgba(108,99,255,.3)' : 'none' }}>
        {isUser ? <User size={14} color="white"/> : <Bot size={14} color="#6C63FF"/>}
      </div>

      <div style={{ maxWidth:'74%', display:'flex', flexDirection:'column',
        gap:5, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{ position:'relative',
          padding:'11px 16px', fontSize:14, lineHeight:1.65,
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser
            ? 'linear-gradient(135deg,#6C63FF,#7C3AED)'
            : 'white',
          color: isUser ? 'white' : '#111827',
          boxShadow: isUser
            ? '0 4px 14px rgba(108,99,255,.3)'
            : '0 2px 8px rgba(0,0,0,.06)',
          border: isUser ? 'none' : '1px solid rgba(108,99,255,.09)',
          whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
          {msg.content}
          {!isUser && (
            <div style={{ position:'absolute', top:6, right:8, opacity:0, transition:'opacity .15s' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='1'}
              onMouseLeave={e=>e.currentTarget.style.opacity='0'}
              className="copy-reveal">
              <CopyBtn text={msg.content} />
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && msg.sources?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {msg.sources.map((src,i) => (
              <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:4,
                padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:500,
                background:'rgba(108,99,255,.07)', color:'#6C63FF',
                border:'1px solid rgba(108,99,255,.15)' }}>
                <FileText size={9}/> {src.split('/').pop() || `Source ${i+1}`}
              </span>
            ))}
          </div>
        )}

        {/* Feedback */}
        {!isUser && msg.id && (
          <div style={{ display:'flex', alignItems:'center', gap:6, paddingLeft:2 }}>
            {msg.category && (
              <span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:500,
                background:'rgba(108,99,255,.07)', color:'#6C63FF' }}>{msg.category}</span>
            )}
            {[{k:'helpful',Icon:ThumbsUp,c:'#10B981'},{k:'not_helpful',Icon:ThumbsDown,c:'#EF4444'}].map(({k,Icon,c})=>(
              <button key={k} onClick={()=>onFeedback(msg.id,k)}
                style={{ padding:5, borderRadius:7, border:'none', cursor:'pointer',
                  background: msg.feedback===k ? `${c}18` : 'none',
                  color: msg.feedback===k ? c : '#CBD5E1',
                  display:'flex', transition:'all .15s' }}>
                <Icon size={12}/>
              </button>
            ))}
            {msg.response_time_ms && (
              <span style={{ fontSize:10, color:'#CBD5E1', fontFamily:'monospace' }}>
                {msg.response_time_ms}ms
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

const SUGGESTIONS = [
  'What services do you offer?','How do I get started?',
  'What is your pricing?','How do I contact support?'
]

export default function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:'smooth' }) },[messages,loading])

  const newSession = () => { setMessages([]); setSessionId(null); toast('New session', { icon:'💬' }); inputRef.current?.focus() }

  const send = async (text) => {
    const msg = (text||input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role:'user', content:msg }])
    setLoading(true)
    try {
      const { data } = await api.post('/chat/', { message:msg, session_id:sessionId })
      setSessionId(data.session_id)
      setMessages(m => [...m, {
        id:data.message_id, role:'assistant', content:data.answer,
        category:data.category, sources:data.sources||[], response_time_ms:data.response_time_ms, feedback:null
      }])
    } catch { toast.error('Failed to send'); setMessages(m=>m.slice(0,-1)) }
    finally { setLoading(false); inputRef.current?.focus() }
  }

  const handleFeedback = async (id,feedback) => {
    try {
      await api.post('/chat/feedback', { message_id:id, feedback })
      setMessages(m=>m.map(msg=>msg.id===id?{...msg,feedback}:msg))
      toast.success(feedback==='helpful'?'👍 Thanks!':'👎 Got it!')
    } catch { toast.error('Feedback failed') }
  }

  return (
    <Layout>
      <style>{`
        .copy-reveal:hover { opacity:1!important; }
        div:hover > .copy-reveal { opacity:1; }
        @keyframes skeleton-wave{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
      <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>

        {/* Header */}
        <div style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(16px)',
          borderBottom:'1px solid rgba(108,99,255,0.08)',
          boxShadow:'0 1px 8px rgba(108,99,255,0.05)',
          padding:'14px 24px', flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,
              background:'linear-gradient(135deg,rgba(108,99,255,.1),rgba(124,58,237,.07))',
              display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Sparkles size={16} color="#6C63FF"/>
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:'#0F172A', margin:0 }}>{user?.company_name} AI</p>
              <p style={{ fontSize:11, color:'#94A3B8', margin:0 }}>
                {sessionId ? `Session · ${sessionId.slice(0,8)}…` : 'Ready to help'}
              </p>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <a href={`/chat/${user?.company_slug}`} target="_blank" rel="noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'7px 12px',
                background:'transparent', border:'1px solid #E5E7EB', borderRadius:9,
                textDecoration:'none', fontSize:12, color:'#64748B', cursor:'pointer', fontWeight:500 }}>
              <ExternalLink size={12}/> Customer view
            </a>
            <button onClick={newSession}
              style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'7px 12px',
                background:'white', border:'1px solid #E5E7EB', borderRadius:9,
                fontSize:12, color:'#374151', cursor:'pointer', fontWeight:500 }}>
              <Plus size={12}/> New chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px',
          background:'linear-gradient(180deg,#F8FAFC 0%,#F1F5FF 100%)' }}>
          <AnimatePresence>
            {messages.length===0 && (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                style={{ display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'center', height:'100%', textAlign:'center', paddingTop:60 }}>
                <motion.div whileHover={{ scale:1.05 }}
                  style={{ width:64,height:64,borderRadius:18,marginBottom:20,
                    background:'linear-gradient(135deg,rgba(108,99,255,.1),rgba(124,58,237,.07))',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    boxShadow:'0 8px 24px rgba(108,99,255,.15)' }}>
                  <Sparkles size={28} color="#6C63FF"/>
                </motion.div>
                <h3 style={{ fontSize:20,fontWeight:700,color:'#0F172A',marginBottom:8,
                  fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'-0.02em' }}>
                  How can I help?
                </h3>
                <p style={{ fontSize:14,color:'#64748B',maxWidth:380,lineHeight:1.65,marginBottom:28 }}>
                  I answer from your knowledge base. Ask anything about {user?.company_name}.
                </p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:9, justifyContent:'center', maxWidth:480 }}>
                  {SUGGESTIONS.map(q=>(
                    <motion.button key={q} onClick={()=>send(q)}
                      whileHover={{ scale:1.02 }} whileTap={{ scale:.98 }}
                      style={{ padding:'8px 16px', borderRadius:99, border:'1px solid rgba(108,99,255,.2)',
                        background:'white', color:'#6C63FF', fontSize:13, fontWeight:500,
                        cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,.04)',
                        fontFamily:'inherit', transition:'all .15s' }}>
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:760, margin:'0 auto' }}>
            {messages.map((m,i) => <Msg key={i} msg={m} onFeedback={handleFeedback}/>)}
            {loading && <TypingDots/>}
            <div ref={bottomRef}/>
          </div>
        </div>

        {/* Input */}
        <div style={{ padding:'16px 24px', background:'white',
          borderTop:'1px solid rgba(108,99,255,.08)',
          boxShadow:'0 -4px 20px rgba(108,99,255,.06)', flexShrink:0 }}>
          <div style={{ maxWidth:760, margin:'0 auto' }}>
            <form onSubmit={e=>{ e.preventDefault(); send() }}
              style={{ display:'flex', gap:10, padding:'10px 12px', borderRadius:16,
                background:'#F8FAFC', border:'1.5px solid rgba(108,99,255,.18)',
                boxShadow:'0 2px 12px rgba(108,99,255,.08)' }}>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                disabled={loading} placeholder="Ask anything about your company…"
                style={{ flex:1, padding:'6px 8px', fontSize:14, background:'transparent',
                  border:'none', outline:'none', color:'#0F172A', fontFamily:'inherit' }} />
              <motion.button type="submit" disabled={loading||!input.trim()}
                whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }}
                style={{ width:38,height:38,borderRadius:10,border:'none',cursor:'pointer',
                  background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  boxShadow:'0 4px 12px rgba(108,99,255,.35)',
                  opacity:(loading||!input.trim())?.4:1, flexShrink:0 }}>
                {loading
                  ? <div style={{ width:14,height:14,borderRadius:'50%',
                      border:'2px solid rgba(255,255,255,.4)',borderTopColor:'white',
                      animation:'spin 1s linear infinite' }}/>
                  : <Send size={15} color="white"/>}
              </motion.button>
            </form>
            <p style={{ textAlign:'center', fontSize:11, color:'#94A3B8', marginTop:8 }}>
              Powered by Gemini 2.5 Flash · RAG · Answers only from your documents
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  )
}
