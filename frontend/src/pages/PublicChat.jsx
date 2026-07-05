import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  Bot, User, Send, ThumbsUp, ThumbsDown, Loader2,
  AlertCircle, PhoneCall, X, FileText, MessageSquare
} from 'lucide-react'
import clsx from 'clsx'

const pub = axios.create({ baseURL: '/api/v1' })

function TypingDots() {
  return (
    <div style={{ display:'flex',alignItems:'flex-end',gap:10 }}>
      <div style={{ width:30,height:30,borderRadius:'50%',flexShrink:0,
        background:'rgba(108,99,255,.1)',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <Bot size={14} color="#6C63FF"/>
      </div>
      <div style={{ padding:'10px 14px',borderRadius:'14px 14px 14px 4px',
        background:'white',border:'1px solid rgba(108,99,255,.1)',
        boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
        <div style={{ display:'flex',gap:4,alignItems:'center',height:14 }}>
          {[0,1,2].map(i=>(
            <div key={i} style={{ width:6,height:6,borderRadius:'50%',background:'#94A3B8',
              animationName:'typing-bounce',animationDuration:'1.4s',
              animationTimingFunction:'ease-in-out',animationIterationCount:'infinite',
              animationDelay:`${i*.18}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function EscalateModal({ slug, sessionId, onClose }) {
  const [form, setForm] = useState({ name:'', email:'', reason:'' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await pub.post(`/widget/${slug}/escalate`, { session_id:sessionId, customer_name:form.name, customer_email:form.email, reason:form.reason })
      setDone(true)
    } catch { setDone(true) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',
      alignItems:'center',justifyContent:'center',zIndex:200,padding:16 }}>
      <motion.div initial={{ scale:.92,opacity:0 }} animate={{ scale:1,opacity:1 }}
        style={{ background:'white',borderRadius:18,padding:28,width:'100%',maxWidth:380,
          boxShadow:'0 24px 64px rgba(0,0,0,.2)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:32,height:32,borderRadius:9,background:'rgba(108,99,255,.1)',
              display:'flex',alignItems:'center',justifyContent:'center' }}>
              <PhoneCall size={15} color="#6C63FF"/>
            </div>
            <h3 style={{ fontSize:15,fontWeight:700,color:'#0F172A',margin:0,
              fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Talk to a Human</h3>
          </div>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'#94A3B8',display:'flex' }}>
            <X size={18}/>
          </button>
        </div>

        {done ? (
          <div style={{ textAlign:'center',padding:'12px 0' }}>
            <div style={{ width:48,height:48,borderRadius:'50%',background:'rgba(16,185,129,.1)',
              margin:'0 auto 14px',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <PhoneCall size={20} color="#10B981"/>
            </div>
            <p style={{ fontSize:14,fontWeight:600,color:'#0F172A',marginBottom:6 }}>Request received!</p>
            <p style={{ fontSize:13,color:'#64748B',marginBottom:18 }}>A support agent will contact you shortly.</p>
            <button onClick={onClose} style={{ padding:'10px 24px',background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
              color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:12 }}>
            {[{ key:'name',label:'Your Name',type:'text',ph:'John Smith' },
              { key:'email',label:'Email',type:'email',ph:'john@email.com' }].map(({ key,label,type,ph })=>(
              <div key={key}>
                <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#64748B',
                  textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6 }}>{label}</label>
                <input type={type} required={key==='email'} placeholder={ph} value={form[key]}
                  onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  style={{ width:'100%',padding:'9px 12px',fontSize:13,background:'#F8FAFC',
                    border:'1.5px solid #E5E7EB',borderRadius:9,outline:'none',fontFamily:'inherit',color:'#0F172A' }}
                  onFocus={e=>{e.target.style.borderColor='#6C63FF';e.target.style.background='white'}}
                  onBlur={e=>{e.target.style.borderColor='#E5E7EB';e.target.style.background='#F8FAFC'}}/>
              </div>
            ))}
            <div>
              <label style={{ display:'block',fontSize:11,fontWeight:600,color:'#64748B',
                textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6 }}>What do you need help with?</label>
              <textarea rows={3} value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}
                placeholder="Describe your issue…"
                style={{ width:'100%',padding:'9px 12px',fontSize:13,background:'#F8FAFC',
                  border:'1.5px solid #E5E7EB',borderRadius:9,outline:'none',
                  fontFamily:'inherit',color:'#0F172A',resize:'none' }}
                onFocus={e=>{e.target.style.borderColor='#6C63FF';e.target.style.background='white'}}
                onBlur={e=>{e.target.style.borderColor='#E5E7EB';e.target.style.background='#F8FAFC'}}/>
            </div>
            <button type="submit" disabled={loading||!form.email}
              style={{ padding:'11px',background:'linear-gradient(135deg,#6C63FF,#7C3AED)',color:'white',
                border:'none',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                fontFamily:'inherit',opacity:(loading||!form.email)?.5:1,
                boxShadow:'0 4px 12px rgba(108,99,255,.3)' }}>
              {loading ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> : <PhoneCall size={15}/>}
              {loading ? 'Sending…' : 'Request Human Support'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default function PublicChat() {
  const { slug } = useParams()
  const [info,setInfo]=useState(null);const [error,setError]=useState(null)
  const [messages,setMessages]=useState([]);const [input,setInput]=useState('')
  const [sessionId,setSessionId]=useState(null);const [loading,setLoading]=useState(false)
  const [infoLoading,setInfoLoading]=useState(true);const [showEscalate,setShowEscalate]=useState(false)
  const bottomRef=useRef(null)

  useEffect(()=>{
    pub.get(`/widget/${slug}/info`).then(r=>{ setInfo(r.data); setMessages([{ role:'assistant',content:r.data.welcome_message }]) })
      .catch(()=>setError('Chatbot not found or currently inactive.')).finally(()=>setInfoLoading(false))
  },[slug])

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:'smooth' }) },[messages,loading])

  const send=async text=>{
    const msg=(text||input).trim(); if(!msg||loading)return
    setInput(''); setMessages(m=>[...m,{ role:'user',content:msg }]); setLoading(true)
    try{
      const { data }=await pub.post(`/widget/${slug}/chat`,{ message:msg,session_id:sessionId })
      setSessionId(data.session_id)
      setMessages(m=>[...m,{ id:data.message_id,role:'assistant',content:data.answer,feedback:null }])
    }catch{ setMessages(m=>[...m,{ role:'assistant',content:"I'm having trouble right now. Please try again." }]) }
    finally{ setLoading(false) }
  }

  const feedback=async(id,fb)=>{
    try{ await pub.post(`/widget/${slug}/feedback`,null,{ params:{ message_id:id,feedback:fb } })
      setMessages(m=>m.map(msg=>msg.id===id?{...msg,feedback:fb}:msg)) }catch{}
  }

  if(infoLoading) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'linear-gradient(135deg,#F0F4FF,#EEF2FF)' }}>
      <Loader2 size={28} color="#6C63FF" style={{ animation:'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if(error) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'linear-gradient(135deg,#F0F4FF,#EEF2FF)',padding:24 }}>
      <div style={{ textAlign:'center',maxWidth:360 }}>
        <div style={{ width:60,height:60,borderRadius:16,background:'rgba(239,68,68,.1)',
          margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <AlertCircle size={26} color="#DC2626"/>
        </div>
        <h2 style={{ fontSize:20,fontWeight:700,color:'#0F172A',marginBottom:8,
          fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Chatbot Not Found</h2>
        <p style={{ fontSize:14,color:'#64748B' }}>{error}</p>
      </div>
    </div>
  )

  const SUGGESTIONS = ['What are your services?','How do I get started?','What is your pricing?','Contact support']

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#F0F4FF,#EEF2FF)',
      display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes typing-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
      `}</style>

      {showEscalate&&sessionId&&(
        <EscalateModal slug={slug} sessionId={sessionId} onClose={()=>setShowEscalate(false)}/>
      )}

      <div style={{ width:'100%',maxWidth:680,background:'white',borderRadius:24,
        boxShadow:'0 24px 64px rgba(108,99,255,.15)',overflow:'hidden',
        display:'flex',flexDirection:'column',height:'88vh',maxHeight:720 }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
          padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:38,height:38,borderRadius:11,background:'rgba(255,255,255,.2)',
              display:'flex',alignItems:'center',justifyContent:'center' }}>
              {info?.logo_url
                ? <img src={info.logo_url} alt="" style={{ width:30,height:30,borderRadius:8,objectFit:'cover' }}/>
                : <Bot size={19} color="white"/>}
            </div>
            <div>
              <p style={{ fontSize:14,fontWeight:700,color:'white',margin:'0 0 2px' }}>{info?.company_name} AI</p>
              <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                <div style={{ width:7,height:7,borderRadius:'50%',background:'#34D399',
                  animation:'pulse-green 2s infinite' }}/>
                <span style={{ fontSize:11,color:'rgba(255,255,255,.8)' }}>Online · Powered by ResolveAI</span>
              </div>
            </div>
          </div>
          {sessionId&&(
            <button onClick={()=>setShowEscalate(true)}
              style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',
                background:'rgba(255,255,255,.2)',border:'1px solid rgba(255,255,255,.25)',
                borderRadius:9,color:'white',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'inherit' }}>
              <PhoneCall size={13}/> Human Support
            </button>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:14,
          background:'#FAFBFF' }}>
          {messages.map((m,i)=>(
            <motion.div key={i} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
              style={{ display:'flex',alignItems:'flex-end',gap:10,
                flexDirection:m.role==='user'?'row-reverse':'row' }}>
              <div style={{ width:30,height:30,borderRadius:'50%',flexShrink:0,
                background:m.role==='user'?'linear-gradient(135deg,#6C63FF,#7C3AED)':'rgba(108,99,255,.1)',
                display:'flex',alignItems:'center',justifyContent:'center' }}>
                {m.role==='user'?<User size={13} color="white"/>:<Bot size={13} color="#6C63FF"/>}
              </div>
              <div style={{ maxWidth:'76%',display:'flex',flexDirection:'column',gap:5,
                alignItems:m.role==='user'?'flex-end':'flex-start' }}>
                <div style={{ padding:'11px 14px',fontSize:14,lineHeight:1.65,
                  borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                  background:m.role==='user'?'linear-gradient(135deg,#6C63FF,#7C3AED)':'white',
                  color:m.role==='user'?'white':'#111827',
                  boxShadow:m.role==='user'?'0 4px 12px rgba(108,99,255,.25)':'0 2px 8px rgba(0,0,0,.06)',
                  border:m.role==='user'?'none':'1px solid rgba(108,99,255,.09)' }}>
                  {m.content}
                </div>
                {m.role==='assistant'&&m.id&&(
                  <div style={{ display:'flex',gap:4 }}>
                    {[{ k:'helpful',Icon:ThumbsUp },{ k:'not_helpful',Icon:ThumbsDown }].map(({ k,Icon })=>(
                      <button key={k} onClick={()=>feedback(m.id,k)}
                        style={{ padding:5,borderRadius:7,border:'none',cursor:'pointer',display:'flex',
                          background:m.feedback===k?(k==='helpful'?'rgba(16,185,129,.12)':'rgba(239,68,68,.12)'):'none',
                          color:m.feedback===k?(k==='helpful'?'#10B981':'#EF4444'):'#CBD5E1',transition:'all .15s' }}>
                        <Icon size={13}/>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading&&<TypingDots/>}
          <div ref={bottomRef}/>
        </div>

        {/* Suggestions */}
        {messages.length===1&&(
          <div style={{ padding:'0 16px 12px',display:'flex',flexWrap:'wrap',gap:7,background:'#FAFBFF' }}>
            {SUGGESTIONS.map(q=>(
              <button key={q} onClick={()=>send(q)}
                style={{ padding:'7px 13px',borderRadius:99,fontSize:12,fontWeight:500,
                  background:'white',border:'1px solid rgba(108,99,255,.2)',color:'#6C63FF',
                  cursor:'pointer',transition:'all .15s',boxShadow:'0 1px 4px rgba(0,0,0,.04)',fontFamily:'inherit' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(108,99,255,.07)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='white'}}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding:'12px 16px',borderTop:'1px solid rgba(108,99,255,.08)',background:'white' }}>
          <form onSubmit={e=>{e.preventDefault();send()}}
            style={{ display:'flex',gap:9,padding:'8px 10px',borderRadius:14,
              background:'#F8FAFC',border:'1.5px solid rgba(108,99,255,.16)',
              boxShadow:'0 2px 10px rgba(108,99,255,.07)' }}>
            <input value={input} onChange={e=>setInput(e.target.value)} disabled={loading}
              placeholder="Type your question…"
              style={{ flex:1,padding:'5px 6px',fontSize:14,background:'transparent',
                border:'none',outline:'none',color:'#0F172A',fontFamily:'inherit' }}/>
            <button type="submit" disabled={loading||!input.trim()}
              style={{ width:34,height:34,borderRadius:9,border:'none',cursor:'pointer',
                background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                boxShadow:'0 3px 10px rgba(108,99,255,.35)',
                opacity:(loading||!input.trim())?.4:1,transition:'opacity .15s' }}>
              {loading ? <Loader2 size={14} color="white" style={{ animation:'spin 1s linear infinite' }}/> : <Send size={14} color="white"/>}
            </button>
          </form>
          <p style={{ textAlign:'center',fontSize:11,color:'#94A3B8',marginTop:7 }}>
            Powered by <span style={{ color:'#6C63FF',fontWeight:600 }}>ResolveAI</span> · AI answers from company documents only
          </p>
        </div>
      </div>
      <style>{`@keyframes pulse-green{0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.4)}50%{box-shadow:0 0 0 5px rgba(52,211,153,0)}}`}</style>
    </div>
  )
}
