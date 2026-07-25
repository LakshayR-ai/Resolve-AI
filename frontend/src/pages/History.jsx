import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import Layout from '../components/Layout'
import { Search, MessageSquare, ChevronRight, User, Bot, Loader2, X, Download, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const SENTIMENTS = ['','Positive','Neutral','Negative']
const CATEGORIES = ['','Billing','Shipping','Technical','Account','Product','Cancellation','General']
const SC = { Positive:{ bg:'rgba(16,185,129,.1)',c:'#059669' }, Negative:{ bg:'rgba(239,68,68,.1)',c:'#DC2626' }, Neutral:{ bg:'rgba(108,99,255,.1)',c:'#6C63FF' } }

export default function History() {
  const [sessions,setSessions]=useState([]);const [selected,setSelected]=useState(null);const [messages,setMessages]=useState([])
  const [loading,setLoading]=useState(true);const [msgLoad,setMsgLoad]=useState(false)
  const [search,setSearch]=useState('');const [sentiment,setSentiment]=useState('');const [category,setCategory]=useState('')
  const [total,setTotal]=useState(0);const [page,setPage]=useState(1);const PAGE=20

  const load=(p=1)=>{ setLoading(true); api.get('/chat/history/sessions',{ params:{ page:p,page_size:PAGE } }).then(r=>{ setSessions(r.data.sessions);setTotal(r.data.total) }).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)) }
  useEffect(()=>{load()},[])

  const open=id=>{ setSelected(id);setMsgLoad(true); api.get(`/chat/history/sessions/${id}`).then(r=>setMessages(r.data.messages)).catch(()=>toast.error('Failed')).finally(()=>setMsgLoad(false)) }
  const doSearch = () => {
    setLoading(true)
    api.get('/chat/history/search', { params:{ query:search, sentiment, category, page:1, page_size:PAGE } })
      .then(r => {
        setSessions(r.data.messages?.map(m => ({
          session_id: m.session_id,
          customer_name: m.customer_name || 'Anonymous',
          message_count: 1,
          created_at: m.created_at
        })) || [])
        setTotal(r.data.total)
        setPage(1)
      })
      .catch(() => toast.error('Search failed'))
      .finally(() => setLoading(false))
  }

  const prevPage = () => {
    const p = page - 1
    setPage(p)
    load(p)
  }

  const nextPage = () => {
    const p = page + 1
    setPage(p)
    load(p)
  }

  const clear = () => { setSearch(''); setSentiment(''); setCategory(''); setPage(1); load(1) }

  const selInfo = sessions.find(s=>s.session_id===selected)

  return (
    <Layout>
      <style>{`@keyframes skeleton-wave{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display:'flex',height:'100vh',overflow:'hidden' }}>

        {/* Left panel */}
        <div style={{ width:340,flexShrink:0,display:'flex',flexDirection:'column',
          background:'white',borderRight:'1px solid rgba(108,99,255,.08)' }}>

          <div style={{ padding:'18px 16px 12px',borderBottom:'1px solid rgba(108,99,255,.07)' }}>
            <h2 style={{ fontSize:16,fontWeight:700,color:'#0F172A',margin:'0 0 14px',
              fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Chat History</h2>
            <div style={{ position:'relative',marginBottom:10 }}>
              <Search size={13} color="#94A3B8" style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)' }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()}
                placeholder="Search conversations…"
                style={{ width:'100%',paddingLeft:30,paddingRight:10,paddingTop:8,paddingBottom:8,
                  fontSize:13,background:'#F8FAFC',border:'1px solid #E5E7EB',borderRadius:9,
                  outline:'none',color:'#0F172A',fontFamily:'inherit' }}
                onFocus={e=>{e.target.style.borderColor='#6C63FF';e.target.style.boxShadow='0 0 0 3px rgba(108,99,255,.1)'}}
                onBlur={e=>{e.target.style.borderColor='#E5E7EB';e.target.style.boxShadow='none'}}/>
            </div>
            <div style={{ display:'flex',gap:6,marginBottom:8 }}>
              {[{ val:sentiment,set:setSentiment,opts:SENTIMENTS,ph:'Sentiment' },
                { val:category, set:setCategory, opts:CATEGORIES, ph:'Category'  }].map(({ val,set,opts,ph })=>(
                <select key={ph} value={val} onChange={e=>set(e.target.value)}
                  style={{ flex:1,padding:'6px 8px',fontSize:12,background:'#F8FAFC',
                    border:'1px solid #E5E7EB',borderRadius:8,outline:'none',color:'#374151',fontFamily:'inherit' }}>
                  {opts.map(o=><option key={o} value={o}>{o||ph}</option>)}
                </select>
              ))}
            </div>
            <div style={{ display:'flex',gap:6 }}>
              <button onClick={doSearch}
                style={{ flex:1,padding:'7px',borderRadius:8,border:'none',cursor:'pointer',
                  background:'linear-gradient(135deg,#6C63FF,#7C3AED)',color:'white',
                  fontSize:12,fontWeight:600,fontFamily:'inherit' }}>Search</button>
              <button onClick={clear}
                style={{ padding:'7px 10px',borderRadius:8,border:'1px solid #E5E7EB',cursor:'pointer',
                  background:'white',color:'#64748B',display:'flex',alignItems:'center',fontFamily:'inherit' }}>
                <X size={13}/>
              </button>
              <button onClick={()=>window.open('/api/v1/analytics/export/csv','_blank')}
                style={{ padding:'7px 10px',borderRadius:8,border:'1px solid #E5E7EB',cursor:'pointer',
                  background:'white',color:'#64748B',display:'flex',alignItems:'center',fontFamily:'inherit' }}>
                <Download size={13}/>
              </button>
            </div>
          </div>

          <div style={{ flex:1,overflowY:'auto' }}>
            {loading ? (
              <div style={{ padding:12,display:'flex',flexDirection:'column',gap:8 }}>
                {[1,2,3,4,5].map(i=><div key={i} style={{ height:60,borderRadius:10,background:'linear-gradient(90deg,#F1F5F9 25%,#E8EDF5 50%,#F1F5F9 75%)',backgroundSize:'400% 100%',animation:'skeleton-wave 1.6s ease infinite' }}/>)}
              </div>
            ) : sessions.length===0 ? (
              <div style={{ padding:40,textAlign:'center' }}>
                <MessageSquare size={28} color="#CBD5E1" style={{ marginBottom:10 }}/>
                <p style={{ fontSize:13,color:'#94A3B8' }}>No sessions found</p>
              </div>
            ) : sessions.map(s=>(
              <button key={s.session_id} onClick={()=>open(s.session_id)}
                style={{ width:'100%',textAlign:'left',padding:'13px 16px',
                  background:selected===s.session_id?'rgba(108,99,255,.07)':'transparent',
                  borderLeft:`3px solid ${selected===s.session_id?'#6C63FF':'transparent'}`,
                  border:'none',borderBottom:'1px solid rgba(108,99,255,.06)',cursor:'pointer',
                  borderLeft:selected===s.session_id?'3px solid #6C63FF':'3px solid transparent',
                  transition:'all .15s ease', fontFamily:'inherit' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:13,fontWeight:600,color:'#0F172A',margin:'0 0 3px',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                      {s.customer_name||'Anonymous'}
                    </p>
                    <p style={{ fontSize:11,color:'#94A3B8',margin:0,display:'flex',alignItems:'center',gap:5 }}>
                      <MessageSquare size={10}/> {s.message_count} messages
                      {' · '}{new Date(s.created_at).toLocaleDateString('en-US',{ month:'short',day:'numeric' })}
                    </p>
                  </div>
                  <ChevronRight size={13} color="#CBD5E1" style={{ marginLeft:6,flexShrink:0 }}/>
                </div>
              </button>
            ))}
          </div>

          {total>PAGE&&(
            <div style={{ padding:'10px 14px',borderTop:'1px solid rgba(108,99,255,.07)',
              display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <button disabled={page<=1} onClick={prevPage}
                style={{ padding:'5px 10px',borderRadius:7,border:'1px solid #E5E7EB',cursor:'pointer',
                  background:'white',fontSize:12,color:'#374151',fontFamily:'inherit',opacity:page<=1?.4:1 }}>← Prev</button>
              <span style={{ fontSize:12,color:'#94A3B8' }}>{page}/{Math.ceil(total/PAGE)}</span>
              <button disabled={page>=Math.ceil(total/PAGE)} onClick={nextPage}
                style={{ padding:'5px 10px',borderRadius:7,border:'1px solid #E5E7EB',cursor:'pointer',
                  background:'white',fontSize:12,color:'#374151',fontFamily:'inherit',opacity:page>=Math.ceil(total/PAGE)?.4:1 }}>Next →</button>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden',
          background:'linear-gradient(180deg,#F8FAFC 0%,#F1F5FF 100%)' }}>
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',
                  justifyContent:'center',textAlign:'center' }}>
                <div style={{ width:56,height:56,borderRadius:16,marginBottom:16,
                  background:'rgba(108,99,255,.07)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <MessageSquare size={24} color="#6C63FF" style={{ opacity:.5 }}/>
                </div>
                <p style={{ fontSize:15,fontWeight:600,color:'#374151',marginBottom:6 }}>Select a conversation</p>
                <p style={{ fontSize:13,color:'#94A3B8' }}>Choose a session from the left to view messages</p>
              </motion.div>
            ) : msgLoad ? (
              <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
                <Loader2 size={20} color="#6C63FF" style={{ animation:'spin 1s linear infinite' }}/>
                <span style={{ fontSize:13,color:'#64748B' }}>Loading messages…</span>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </motion.div>
            ) : (
              <motion.div key={selected} initial={{ opacity:0,x:12 }} animate={{ opacity:1,x:0 }}
                style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
                <div style={{ padding:'14px 20px',background:'rgba(255,255,255,.92)',
                  backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(108,99,255,.08)',
                  boxShadow:'0 1px 8px rgba(108,99,255,.05)' }}>
                  <p style={{ fontSize:14,fontWeight:600,color:'#0F172A',margin:'0 0 2px' }}>
                    {selInfo?.customer_name||'Anonymous'} <span style={{ fontFamily:'monospace',fontSize:11,color:'#94A3B8',fontWeight:400 }}>· {selected.slice(0,16)}…</span>
                  </p>
                  <p style={{ fontSize:11,color:'#94A3B8',margin:0,display:'flex',alignItems:'center',gap:5 }}>
                    <Clock size={11}/> {messages.length} messages
                    {selInfo&&' · '}{selInfo&&new Date(selInfo.created_at).toLocaleDateString('en-US',{ weekday:'short',month:'short',day:'numeric' })}
                  </p>
                </div>
                <div style={{ flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:14 }}>
                  {messages.filter(m=>m.role!=='system').map((m,i)=>(
                    <motion.div key={i} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
                      transition={{ delay:i*.03 }}
                      style={{ display:'flex',alignItems:'flex-end',gap:10,
                        flexDirection:m.role==='user'?'row-reverse':'row' }}>
                      <div style={{ width:28,height:28,borderRadius:'50%',flexShrink:0,
                        background:m.role==='user'?'linear-gradient(135deg,#6C63FF,#7C3AED)':'rgba(108,99,255,.1)',
                        display:'flex',alignItems:'center',justifyContent:'center' }}>
                        {m.role==='user'?<User size={12} color="white"/>:<Bot size={12} color="#6C63FF"/>}
                      </div>
                      <div style={{ maxWidth:'70%',display:'flex',flexDirection:'column',gap:5,
                        alignItems:m.role==='user'?'flex-end':'flex-start' }}>
                        <div style={{ padding:'10px 14px',fontSize:13,lineHeight:1.65,
                          borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                          background:m.role==='user'?'linear-gradient(135deg,#6C63FF,#7C3AED)':'white',
                          color:m.role==='user'?'white':'#111827',
                          boxShadow:m.role==='user'?'0 4px 12px rgba(108,99,255,.25)':'0 2px 8px rgba(0,0,0,.06)',
                          border:m.role==='user'?'none':'1px solid rgba(108,99,255,.09)' }}>
                          {m.content}
                        </div>
                        <div style={{ display:'flex',alignItems:'center',gap:6,paddingLeft:m.role==='user'?0:2,paddingRight:m.role==='user'?2:0 }}>
                          {m.sentiment&&SC[m.sentiment]&&(
                            <span style={{ padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:600,
                              background:SC[m.sentiment].bg,color:SC[m.sentiment].c }}>{m.sentiment}</span>
                          )}
                          {m.category&&m.role==='user'&&(
                            <span style={{ padding:'2px 8px',borderRadius:99,fontSize:10,fontWeight:600,
                              background:'rgba(0,0,0,.06)',color:'#64748B' }}>{m.category}</span>
                          )}
                          {m.feedback&&(
                            <span style={{ fontSize:12 }}>{m.feedback==='helpful'?'👍':'👎'}</span>
                          )}
                          <span style={{ fontSize:10,color:'#CBD5E1' }}>
                            {new Date(m.created_at).toLocaleTimeString('en-US',{ hour:'2-digit',minute:'2-digit' })}
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
