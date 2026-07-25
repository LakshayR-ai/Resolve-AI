import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import {
  MessageSquare, FileText, TrendingUp, ArrowRight, Zap,
  CalendarDays, Calendar, Smile, Database, AlertTriangle,
  ExternalLink, Users, BarChart3, Clock, CheckCircle2, Activity
} from 'lucide-react'
import Layout from '../components/Layout'

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:.07 } } }
const up = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0 } }

const METRICS = [
  { key:'total_chats',          label:'Total Chats',    sub:'All time',           icon:MessageSquare, grad:'linear-gradient(135deg,#6C63FF,#7C3AED)', tc:'#6C63FF' },
  { key:'today_chats',          label:"Today's Chats",  sub:'Since midnight',     icon:CalendarDays,  grad:'linear-gradient(135deg,#2563EB,#3B82F6)', tc:'#2563EB' },
  { key:'monthly_chats',        label:'This Month',     sub:'Current month',      icon:Calendar,      grad:'linear-gradient(135deg,#0891B2,#06B6D4)', tc:'#0891B2' },
  { key:'total_sessions',       label:'Sessions',       sub:'Unique convos',      icon:Users,         grad:'linear-gradient(135deg,#7C3AED,#8B5CF6)', tc:'#7C3AED' },
  { key:'total_documents',      label:'Documents',      sub:d=>`${d?.knowledge_coverage??0}% indexed`, icon:FileText, grad:'linear-gradient(135deg,#059669,#10B981)', tc:'#059669' },
  { key:'avg_response_time_ms', label:'Avg Response',   sub:'AI latency',         icon:Clock,         grad:'linear-gradient(135deg,#D97706,#F59E0B)', tc:'#D97706', fmt:v=>`${v}ms` },
  { key:'positive_pct',         label:'Positive',       sub:'Sentiment',          icon:Smile,         grad:'linear-gradient(135deg,#059669,#10B981)', tc:'#059669', fmt:v=>`${v}%` },
  { key:'helpful_feedback_pct', label:'Helpful Rate',   sub:'Feedback',           icon:TrendingUp,    grad:'linear-gradient(135deg,#6C63FF,#2563EB)', tc:'#6C63FF', fmt:v=>`${v}%` },
]

function MetricCard({ m, s, loading }) {
  const val = m.fmt ? m.fmt(s?.[m.key]??0) : (s?.[m.key]??0)
  const sub = typeof m.sub==='function' ? m.sub(s) : m.sub
  return (
    <motion.div variants={up} whileHover={{ y:-4, transition:{ duration:.18 } }}
      style={{ background:'white', borderRadius:16, border:'1px solid rgba(108,99,255,0.09)',
        boxShadow:'0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(108,99,255,0.06)',
        padding:20, position:'relative', overflow:'hidden', cursor:'default',
        transition:'border-color .2s, box-shadow .2s' }}>
      {/* top colour bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3,
        background:m.grad, borderRadius:'16px 16px 0 0' }} />
      {/* glow */}
      <div style={{ position:'absolute', bottom:-20, right:-20, width:80, height:80,
        borderRadius:'50%', background:m.grad, opacity:.06, pointerEvents:'none' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:m.grad,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:`0 4px 12px ${m.tc}44` }}>
          <m.icon size={17} color="white" />
        </div>
        <Activity size={12} color="#CBD5E1" />
      </div>
      {loading ? (
        <div>
          <div style={{ height:32, width:80, borderRadius:8, background:'linear-gradient(90deg,#F1F5F9 25%,#E8EDF5 50%,#F1F5F9 75%)', backgroundSize:'400% 100%', animation:'skeleton-wave 1.6s ease infinite', marginBottom:6 }} />
          <div style={{ height:12, width:60, borderRadius:6, background:'linear-gradient(90deg,#F1F5F9 25%,#E8EDF5 50%,#F1F5F9 75%)', backgroundSize:'400% 100%', animation:'skeleton-wave 1.6s ease infinite' }} />
        </div>
      ) : (
        <>
          <p style={{ fontSize:28, fontWeight:800, color:m.tc, lineHeight:1, marginBottom:5,
            fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.03em' }}>{val}</p>
          <p style={{ fontSize:12, color:'#94A3B8', marginBottom:2 }}>{sub}</p>
          <p style={{ fontSize:11, fontWeight:600, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.07em' }}>{m.label}</p>
        </>
      )}
    </motion.div>
  )
}

const ACTIONS = [
  { to:'/chat',      label:'Start a conversation',   sub:'Ask the AI anything',    icon:MessageSquare, c:'#6C63FF', bg:'rgba(108,99,255,0.08)' },
  { to:'/documents', label:'Upload documents',         sub:'Add to knowledge base',  icon:FileText,      c:'#10B981', bg:'rgba(16,185,129,0.08)' },
  { to:'/analytics', label:'View analytics',           sub:'Performance insights',   icon:BarChart3,     c:'#2563EB', bg:'rgba(37,99,235,0.08)' },
  { to:'/history',   label:'Browse conversations',     sub:'Search chat history',    icon:Users,         c:'#F59E0B', bg:'rgba(245,158,11,0.08)' },
  { to:'/settings',  label:'Get embed code',           sub:'Deploy on your website', icon:Database,      c:'#7C3AED', bg:'rgba(124,58,237,0.08)' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ api.get('/analytics/').then(r=>setAnalytics(r.data)).catch(()=>{}).finally(()=>setLoading(false)) },[])
  const s = analytics?.summary
  const h = new Date().getHours()
  const gr = h<5?'Good evening':h<12?'Good morning':h<17?'Good afternoon':'Good evening'
  const em = h<12?'🌅':h<17?'☀️':'🌙'

  return (
    <Layout>
      <style>{`@keyframes skeleton-wave{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Topbar */}
      <div style={{ background:'rgba(255,255,255,0.96)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(99,102,241,0.1)',
        boxShadow:'0 1px 16px rgba(99,102,241,0.07)', padding:'18px 28px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <span style={{ fontSize:20 }}>{em}</span>
              <h1 style={{ fontSize:20, fontWeight:700, color:'#0F172A', margin:0,
                fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.02em' }}>
                {gr}, {user?.full_name?.split(' ')[0]}
              </h1>
            </div>
            <p style={{ fontSize:13, color:'#64748B', margin:0 }}>
              AI workspace for{' '}
              <strong style={{ color:'#6C63FF' }}>{user?.company_name}</strong>
              {' · '}
              <span style={{ color:'#94A3B8' }}>resolveai.app/{user?.company_slug}</span>
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <a href={`/chat/${user?.company_slug}`} target="_blank" rel="noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px',
                background:'white', border:'1px solid #E5E7EB', borderRadius:10,
                textDecoration:'none', fontSize:13, fontWeight:500, color:'#374151',
                boxShadow:'0 1px 3px rgba(0,0,0,0.06)', transition:'all .2s' }}>
              <ExternalLink size={13}/> Live Widget
            </a>
            <Link to="/chat" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
              background:'linear-gradient(135deg,#6C63FF,#7C3AED)', color:'white', borderRadius:10,
              textDecoration:'none', fontSize:13, fontWeight:600,
              boxShadow:'0 4px 12px rgba(108,99,255,0.35)' }}>
              <Zap size={13}/> New Chat
            </Link>
          </div>
        </div>
      </div>

      <div style={{ padding:'24px 28px', maxWidth:1280, margin:'0 auto', background:'var(--bg-page)' }}>
        {/* Metrics */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
          {METRICS.map(m => <MetricCard key={m.key} m={m} s={s} loading={loading} />)}
        </motion.div>

        {/* Bottom 3-col */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {/* Quick actions */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.22 }}
            style={{ background:'white', borderRadius:16, border:'1px solid rgba(108,99,255,0.09)',
              boxShadow:'0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(108,99,255,0.06)', padding:20 }}>
            <p style={{ fontSize:14, fontWeight:700, color:'#0F172A', marginBottom:14,
              fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Quick Actions</p>
            {ACTIONS.map(({ to, label, sub, icon:Icon, c, bg }) => (
              <Link key={to} to={to} style={{ textDecoration:'none', display:'block' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'10px 10px', borderRadius:10, transition:'all .15s ease', marginBottom:2, cursor:'pointer' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(108,99,255,0.04)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:32, height:32, borderRadius:9, flexShrink:0,
                      background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon size={15} color={c} />
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:500, color:'#1E293B', margin:'0 0 1px' }}>{label}</p>
                      <p style={{ fontSize:11, color:'#94A3B8', margin:0 }}>{sub}</p>
                    </div>
                  </div>
                  <ArrowRight size={13} color="#CBD5E1" />
                </div>
              </Link>
            ))}
          </motion.div>

          {/* Sentiment */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.28 }}
            style={{ background:'white', borderRadius:16, border:'1px solid rgba(108,99,255,0.09)',
              boxShadow:'0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(108,99,255,0.06)', padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <p style={{ fontSize:14, fontWeight:700, color:'#0F172A', margin:0,
                fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Customer Sentiment</p>
              <span style={{ fontSize:12, color:'#94A3B8' }}>Last 30 days</span>
            </div>
            {loading ? [1,2,3].map(i=>(
              <div key={i} style={{ height:52, borderRadius:10, marginBottom:10,
                background:'linear-gradient(90deg,#F1F5F9 25%,#E8EDF5 50%,#F1F5F9 75%)',
                backgroundSize:'400% 100%', animation:'skeleton-wave 1.6s ease infinite' }} />
            )) : analytics?.sentiment_breakdown?.length>0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {analytics.sentiment_breakdown.map(item => {
                  const cfg={
                    Positive:{c:'#10B981',bg:'rgba(16,185,129,0.08)',bar:'#10B981',e:'😊'},
                    Negative:{c:'#EF4444',bg:'rgba(239,68,68,0.08)',bar:'#EF4444',e:'😞'},
                    Neutral:{c:'#6C63FF',bg:'rgba(108,99,255,0.08)',bar:'#6C63FF',e:'😐'},
                  }[item.sentiment]||{c:'#94A3B8',bg:'rgba(148,163,184,0.08)',bar:'#94A3B8',e:'😶'}
                  return (
                    <div key={item.sentiment} style={{ padding:'11px 13px', borderRadius:10, background:cfg.bg }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:cfg.c, display:'flex', alignItems:'center', gap:6 }}>
                          {cfg.e} {item.sentiment}
                        </span>
                        <span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>{item.percentage}%</span>
                      </div>
                      <div style={{ height:5, borderRadius:99, background:'rgba(0,0,0,0.08)', overflow:'hidden' }}>
                        <motion.div style={{ height:'100%', borderRadius:99, background:cfg.bar }}
                          initial={{ width:0 }} animate={{ width:`${item.percentage}%` }}
                          transition={{ duration:1.2, delay:.4 }} />
                      </div>
                    </div>
                  )
                })}
                <div style={{ paddingTop:10, borderTop:'1px solid rgba(108,99,255,0.08)',
                  display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, color:'#64748B', display:'flex', alignItems:'center', gap:5 }}>
                    <CheckCircle2 size={11} color="#10B981" /> Helpful rate
                  </span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#10B981' }}>{s?.helpful_feedback_pct??0}%</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ width:44, height:44, borderRadius:14, margin:'0 auto 12px',
                  background:'rgba(108,99,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <MessageSquare size={20} color="#6C63FF" style={{ opacity:.5 }} />
                </div>
                <p style={{ fontSize:13, fontWeight:500, color:'#64748B', marginBottom:4 }}>No data yet</p>
                <p style={{ fontSize:12, color:'#94A3B8', marginBottom:14 }}>Start chatting to see insights</p>
                <Link to="/chat" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px',
                  background:'linear-gradient(135deg,#6C63FF,#7C3AED)', color:'white', borderRadius:9,
                  textDecoration:'none', fontSize:13, fontWeight:600 }}>Try Live Chat</Link>
              </div>
            )}
          </motion.div>

          {/* Top Questions */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.34 }}
            style={{ background:'white', borderRadius:16, border:'1px solid rgba(108,99,255,0.09)',
              boxShadow:'0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(108,99,255,0.06)', padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <p style={{ fontSize:14, fontWeight:700, color:'#0F172A', margin:0,
                fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Top Questions</p>
              <Link to="/analytics" style={{ fontSize:12, fontWeight:600, color:'#6C63FF', textDecoration:'none' }}>All →</Link>
            </div>
            {loading ? [1,2,3,4].map(i=>(
              <div key={i} style={{ height:38, borderRadius:9, marginBottom:8,
                background:'linear-gradient(90deg,#F1F5F9 25%,#E8EDF5 50%,#F1F5F9 75%)',
                backgroundSize:'400% 100%', animation:'skeleton-wave 1.6s ease infinite' }} />
            )) : analytics?.top_questions?.length>0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {analytics.top_questions.slice(0,5).map((q,i)=>(
                  <motion.div key={i} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay:.5+i*.05 }}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:9, transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(108,99,255,0.04)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ width:22, height:22, borderRadius:6, flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background:i<3?'rgba(108,99,255,0.1)':'rgba(0,0,0,0.04)',
                      fontSize:11, fontWeight:700, color:i<3?'#6C63FF':'#94A3B8' }}>{i+1}</div>
                    <p style={{ fontSize:12, color:'#374151', flex:1,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>{q.question}</p>
                    <span style={{ fontSize:11, fontFamily:'monospace', color:'#94A3B8', flexShrink:0 }}>{q.count}×</span>
                  </motion.div>
                ))}
                {analytics?.top_failed_queries?.length>0 && (
                  <div style={{ marginTop:8, padding:'10px 12px', borderRadius:10,
                    background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.18)',
                    display:'flex', alignItems:'flex-start', gap:8 }}>
                    <AlertTriangle size={13} color="#F59E0B" style={{ marginTop:1, flexShrink:0 }} />
                    <div>
                      <p style={{ fontSize:12, fontWeight:600, color:'#92400E', margin:'0 0 2px' }}>
                        {analytics.top_failed_queries.length} unanswered questions
                      </p>
                      <p style={{ fontSize:11, color:'#B45309', margin:0 }}>Upload more docs to improve coverage</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <BarChart3 size={28} color="#CBD5E1" style={{ marginBottom:8 }} />
                <p style={{ fontSize:13, color:'#94A3B8' }}>Questions appear after first chat</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
