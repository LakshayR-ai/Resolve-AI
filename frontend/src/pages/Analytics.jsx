import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'
import Layout from '../components/Layout'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  MessageSquare, Users, Clock, ThumbsUp, Download, Loader2,
  CalendarDays, Calendar, Smile, Database, AlertTriangle, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

const PAL = ['#6C63FF','#2563EB','#10B981','#F59E0B','#EF4444','#7C3AED','#0891B2']
const st  = { hidden:{}, show:{ transition:{ staggerChildren:.06 } } }
const it  = { hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0 } }
const SKL = 'linear-gradient(90deg,#F1F5F9 25%,#E8EDF5 50%,#F1F5F9 75%)'

const Tip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'white', border:'1px solid rgba(108,99,255,.15)', borderRadius:12,
      padding:'10px 14px', boxShadow:'0 8px 24px rgba(108,99,255,.15)', fontSize:13 }}>
      <p style={{ color:'#94A3B8', marginBottom:4, fontSize:11 }}>{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{ color:p.color, fontWeight:700, margin:0 }}>{p.value} {p.name}</p>
      ))}
    </div>
  )
}

const KPIS = [
  { k:'total_chats',          l:'Total Chats',      g:'linear-gradient(135deg,#6C63FF,#7C3AED)', icon:MessageSquare },
  { k:'today_chats',          l:'Today',            g:'linear-gradient(135deg,#2563EB,#3B82F6)', icon:CalendarDays  },
  { k:'monthly_chats',        l:'This Month',       g:'linear-gradient(135deg,#0891B2,#06B6D4)', icon:Calendar      },
  { k:'total_sessions',       l:'Sessions',         g:'linear-gradient(135deg,#7C3AED,#8B5CF6)', icon:Users         },
  { k:'avg_response_time_ms', l:'Avg Response',     g:'linear-gradient(135deg,#D97706,#F59E0B)', icon:Clock,   fmt:v=>`${v}ms` },
  { k:'helpful_feedback_pct', l:'Helpful Rate',     g:'linear-gradient(135deg,#059669,#10B981)', icon:ThumbsUp,fmt:v=>`${v}%`  },
  { k:'positive_pct',         l:'Positive Mood',    g:'linear-gradient(135deg,#0891B2,#10B981)', icon:Smile,   fmt:v=>`${v}%`  },
  { k:'knowledge_coverage',   l:'KB Coverage',      g:'linear-gradient(135deg,#6C63FF,#2563EB)', icon:Database,fmt:v=>`${v}%`,
    sub:s=>`${s?.total_documents??0} docs` },
]

export default function Analytics() {
  const [data,setData]=useState(null);const [tab,setTab]=useState('daily');const [loading,setLoading]=useState(true)
  useEffect(()=>{ api.get('/analytics/').then(r=>setData(r.data)).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)) },[])

  const chart = { hourly:data?.hourly_stats, daily:data?.daily_stats, weekly:data?.weekly_stats, monthly:data?.monthly_stats }[tab]
  const s = data?.summary

  if (loading) return (
    <Layout>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',gap:12 }}>
        <Loader2 size={22} color="#6C63FF" style={{ animation:'spin 1s linear infinite' }}/>
        <span style={{ fontSize:14,color:'#64748B' }}>Loading analytics…</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes skeleton-wave{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Topbar */}
      <div style={{ background:'rgba(255,255,255,.92)',backdropFilter:'blur(16px)',
        borderBottom:'1px solid rgba(108,99,255,.08)',boxShadow:'0 1px 8px rgba(108,99,255,.05)',
        padding:'18px 28px' }}>
        <div style={{ maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div>
            <h1 style={{ fontSize:20,fontWeight:700,color:'#0F172A',margin:'0 0 3px',
              fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'-0.02em' }}>Analytics</h1>
            <p style={{ fontSize:13,color:'#64748B',margin:0 }}>Performance insights for your AI support</p>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            {[['CSV','/api/v1/analytics/export/csv'],['JSON','/api/v1/analytics/export/json']].map(([l,u])=>(
              <button key={l} onClick={()=>window.open(u,'_blank')}
                style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'8px 14px',
                  background:'white',border:'1px solid #E5E7EB',borderRadius:9,fontSize:13,
                  color:'#374151',cursor:'pointer',fontFamily:'inherit',fontWeight:500,
                  boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
                <Download size={13}/> {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:'24px 28px',maxWidth:1280,margin:'0 auto' }}>

        {/* KPI grid */}
        <motion.div variants={st} initial="hidden" animate="show"
          style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20 }}>
          {KPIS.map(k=>{
            const val = k.fmt ? k.fmt(s?.[k.k]??0) : (s?.[k.k]??0)
            const sub = typeof k.sub==='function' ? k.sub(s) : undefined
            return (
              <motion.div key={k.k} variants={it} whileHover={{ y:-3,transition:{ duration:.18 } }}
                style={{ background:'white',borderRadius:14,border:'1px solid rgba(108,99,255,.09)',
                  boxShadow:'0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(108,99,255,.06)',
                  padding:18,position:'relative',overflow:'hidden' }}>
                <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:k.g,borderRadius:'14px 14px 0 0' }}/>
                <div style={{ width:34,height:34,borderRadius:9,marginBottom:12,background:k.g,
                  display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <k.icon size={15} color="white"/>
                </div>
                <p style={{ fontSize:26,fontWeight:800,color:'#0F172A',margin:'0 0 3px',lineHeight:1,
                  fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'-0.03em' }}>{val}</p>
                <p style={{ fontSize:12,color:'#64748B',margin:0 }}>{k.l}</p>
                {sub&&<p style={{ fontSize:11,color:'#94A3B8',margin:'2px 0 0' }}>{sub}</p>}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Volume chart */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.2 }}
          style={{ background:'white',borderRadius:16,border:'1px solid rgba(108,99,255,.09)',
            boxShadow:'0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(108,99,255,.06)',
            padding:24,marginBottom:18 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
            <div>
              <p style={{ fontSize:15,fontWeight:700,color:'#0F172A',margin:'0 0 3px',
                fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Chat Volume</p>
              <p style={{ fontSize:12,color:'#94A3B8',margin:0 }}>Conversations over time</p>
            </div>
            <div style={{ display:'flex',gap:3,padding:3,borderRadius:10,background:'#F1F5F9' }}>
              {['hourly','daily','weekly','monthly'].map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  style={{ padding:'6px 12px',borderRadius:8,border:'none',cursor:'pointer',
                    fontSize:12,fontWeight:500,transition:'all .15s',textTransform:'capitalize',
                    background:tab===t?'white':'transparent',
                    color:tab===t?'#6C63FF':'#94A3B8',
                    boxShadow:tab===t?'0 1px 4px rgba(0,0,0,.08)':'none',
                    fontFamily:'inherit' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={chart||[]}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6C63FF" stopOpacity={.12}/>
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="date" tick={{ fontSize:11,fill:'#94A3B8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11,fill:'#94A3B8' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="chat_count" stroke="#6C63FF" strokeWidth={2.5}
                fill="url(#ag)" dot={false} name="Chats"/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Charts row */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16 }}>
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.28 }}
            style={{ background:'white',borderRadius:16,border:'1px solid rgba(108,99,255,.09)',
              boxShadow:'0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(108,99,255,.06)',padding:22 }}>
            <p style={{ fontSize:14,fontWeight:700,color:'#0F172A',margin:'0 0 4px',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Issue Categories</p>
            <p style={{ fontSize:12,color:'#94A3B8',marginBottom:16 }}>What customers ask most</p>
            {data?.category_breakdown?.length>0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.category_breakdown} layout="vertical" barCategoryGap="22%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false}/>
                  <XAxis type="number" tick={{ fontSize:11,fill:'#94A3B8' }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="category" tick={{ fontSize:11,fill:'#64748B' }} width={76} axisLine={false} tickLine={false}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="count" radius={[0,6,6,0]} name="Questions">
                    {data.category_breakdown.map((_,i)=><Cell key={i} fill={PAL[i%PAL.length]} fillOpacity={.85}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ fontSize:13,color:'#94A3B8',textAlign:'center',padding:'28px 0' }}>No data yet</p>}
          </motion.div>

          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.33 }}
            style={{ background:'white',borderRadius:16,border:'1px solid rgba(108,99,255,.09)',
              boxShadow:'0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(108,99,255,.06)',padding:22 }}>
            <p style={{ fontSize:14,fontWeight:700,color:'#0F172A',margin:'0 0 4px',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Sentiment</p>
            <p style={{ fontSize:12,color:'#94A3B8',marginBottom:12 }}>Customer mood analysis</p>
            {data?.sentiment_breakdown?.length>0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={data.sentiment_breakdown} dataKey="count" nameKey="sentiment"
                      cx="50%" cy="50%" outerRadius={68} innerRadius={38} paddingAngle={3}>
                      {data.sentiment_breakdown.map((_,i)=><Cell key={i} fill={PAL[i%PAL.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius:12,border:'1px solid rgba(108,99,255,.15)',boxShadow:'0 8px 24px rgba(108,99,255,.12)',fontSize:13 }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:'flex',justifyContent:'center',flexWrap:'wrap',gap:14,marginTop:10 }}>
                  {data.sentiment_breakdown.map((it,i)=>(
                    <div key={it.sentiment} style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#374151' }}>
                      <span style={{ width:10,height:10,borderRadius:'50%',background:PAL[i%PAL.length],flexShrink:0 }}/>
                      {it.sentiment} <strong>{it.percentage}%</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : <p style={{ fontSize:13,color:'#94A3B8',textAlign:'center',padding:'28px 0' }}>No data yet</p>}
          </motion.div>
        </div>

        {/* Satisfaction + Top questions */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.38 }}
            style={{ background:'white',borderRadius:16,border:'1px solid rgba(108,99,255,.09)',
              boxShadow:'0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(108,99,255,.06)',padding:22 }}>
            <p style={{ fontSize:14,fontWeight:700,color:'#0F172A',marginBottom:20,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Customer Satisfaction</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
                <p style={{ fontSize:48,fontWeight:900,color:'#6C63FF',lineHeight:1,margin:'0 0 6px',
                  fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'-0.04em' }}>
                  {data?.feedback_rating ? `${(data.feedback_rating*100).toFixed(0)}%` : '—'}
                </p>
                <p style={{ fontSize:12,color:'#64748B',marginBottom:8 }}>Satisfaction score</p>
                <div style={{ display:'flex',gap:2 }}>
                  {[1,2,3,4,5].map(i=>(
                    <span key={i} style={{ fontSize:18,color:i<=Math.round((data?.feedback_rating||0)*5)?'#F59E0B':'#E5E7EB' }}>★</span>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
                {[
                  { l:'👍 Helpful',     p:s?.helpful_feedback_pct??0,     c:'#10B981' },
                  { l:'👎 Not helpful', p:s?.not_helpful_feedback_pct??0, c:'#EF4444' },
                  { l:'😊 Positive',   p:s?.positive_pct??0,             c:'#0891B2' },
                ].map(({ l,p,c })=>(
                  <div key={l}>
                    <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5 }}>
                      <span style={{ color:'#374151' }}>{l}</span>
                      <strong style={{ color:c }}>{p}%</strong>
                    </div>
                    <div style={{ height:5,borderRadius:99,background:'#F1F5F9',overflow:'hidden' }}>
                      <motion.div style={{ height:'100%',borderRadius:99,background:c }}
                        initial={{ width:0 }} animate={{ width:`${p}%` }}
                        transition={{ duration:1,ease:'easeOut',delay:.5 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.43 }}
            style={{ background:'white',borderRadius:16,border:'1px solid rgba(108,99,255,.09)',
              boxShadow:'0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(108,99,255,.06)',padding:22 }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
              <p style={{ fontSize:14,fontWeight:700,color:'#0F172A',margin:0,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Top Questions</p>
              {data?.top_failed_queries?.length>0&&(
                <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,
                  padding:'3px 10px',borderRadius:99,background:'rgba(245,158,11,.1)',color:'#D97706' }}>
                  <AlertTriangle size={11}/> {data.top_failed_queries.length} gaps
                </span>
              )}
            </div>
            {data?.top_questions?.length>0 ? (
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                {data.top_questions.slice(0,6).map((q,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <span style={{ fontSize:12,fontWeight:700,width:20,textAlign:'center',flexShrink:0,
                      color:i<3?'#6C63FF':'#CBD5E1' }}>#{i+1}</span>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontSize:12,color:'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',margin:'0 0 4px' }}>{q.question}</p>
                      <div style={{ height:3,borderRadius:99,background:'#F1F5F9' }}>
                        <div style={{ height:'100%',borderRadius:99,
                          width:`${(q.count/(data.top_questions[0]?.count||1))*100}%`,
                          background:'linear-gradient(90deg,#6C63FF,#7C3AED)' }}/>
                      </div>
                    </div>
                    <span style={{ fontSize:11,fontFamily:'monospace',color:'#94A3B8',flexShrink:0 }}>{q.count}×</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center',padding:'24px 0' }}>
                <TrendingUp size={24} color="#CBD5E1" style={{ marginBottom:8 }}/>
                <p style={{ fontSize:13,color:'#94A3B8' }}>No questions yet</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
