import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, MessageSquare, FileText, BarChart3, Settings,
  LogOut, Sun, Moon, Bot, Shield, History, Sparkles,
  ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react'

const NAV = [
  { to:'/dashboard',  label:'Dashboard',     icon:LayoutDashboard },
  { to:'/chat',       label:'Live Chat',      icon:MessageSquare,  badge:null },
  { to:'/history',    label:'Chat History',   icon:History         },
  { to:'/documents',  label:'Knowledge Base', icon:FileText        },
  { to:'/analytics',  label:'Analytics',      icon:BarChart3       },
  { to:'/settings',   label:'Settings',       icon:Settings        },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const W = collapsed ? 68 : 240

  const initial = user?.full_name?.[0]?.toUpperCase() || 'U'

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration:.25, ease:[.4,0,.2,1] }}
      style={{ width:W, flexShrink:0, background:'var(--bg-sidebar)',
        borderRight:'1px solid rgba(255,255,255,0.07)',
        display:'flex', flexDirection:'column', height:'100vh',
        position:'sticky', top:0, zIndex:50, overflow:'hidden' }}>

      <div style={{ position:'absolute', top:0, left:0, right:0, height:200, pointerEvents:'none',
        background:'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />

      {/* BRAND */}
      <div style={{ padding:'20px 14px 16px', position:'relative', flexShrink:0,
        borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:collapsed?'center':'flex-start' }}>
          <motion.div whileHover={{ scale:1.05 }} style={{ position:'relative', flexShrink:0 }}>
            <div style={{ width:34, height:34, borderRadius:9,
              background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 14px rgba(108,99,255,0.4)' }}>
              <Bot size={17} color="white" />
            </div>
            <span style={{ position:'absolute', bottom:-1, right:-1, width:9, height:9, borderRadius:'50%',
              background:'#10B981', border:'2px solid #0B0F1A',
              boxShadow:'0 0 0 0 rgba(16,185,129,0.4)', animation:'pulse-green 2s infinite' }} />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }}
                transition={{ duration:.2 }}>
                <p style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:16,
                  color:'white', letterSpacing:'-0.03em', lineHeight:1 }}>
                  Resolve<span style={{ background:'linear-gradient(135deg,#A78BFA,#818CF8)',
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                    backgroundClip:'text' }}>AI</span>
                </p>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>AI Support Platform</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c=>!c)}
          style={{ position:'absolute', right:-1, top:'50%', transform:'translateY(-50%)',
            width:20, height:20, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.12)',
            background:'#1a1f32', display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', color:'rgba(255,255,255,0.5)', zIndex:10, padding:0,
            transition:'background .15s, color .15s' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.3)'; e.currentTarget.style.color='white' }}
          onMouseLeave={e=>{ e.currentTarget.style.background='#1a1f32'; e.currentTarget.style.color='rgba(255,255,255,0.5)' }}>
          {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
        </button>
      </div>

      {/* Workspace pill */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ margin:'12px 12px 4px', padding:'10px 12px', borderRadius:10,
              background:'rgba(108,99,255,0.12)', border:'1px solid rgba(108,99,255,0.2)',
              display:'flex', alignItems:'center', gap:9, cursor:'pointer' }}>
            <div style={{ width:26, height:26, borderRadius:8, flexShrink:0,
              background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:700, color:'white' }}>{initial}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:12, fontWeight:600, color:'white',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>
                {user?.company_name}
              </p>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.35)', margin:0, textTransform:'capitalize' }}>
                {user?.role?.replace('_',' ')}
              </p>
            </div>
            <ExternalLink size={12} color="rgba(255,255,255,0.3)" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAV */}
      <nav style={{ flex:1, padding:'8px 10px', overflowY:'auto', overflowX:'hidden' }}>
        {!collapsed && (
          <p style={{ padding:'6px 10px 8px', fontSize:10, fontWeight:700,
            color:'rgba(255,255,255,0.2)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Menu
          </p>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map(({ to, label, icon:Icon }) => (
            <NavLink key={to} to={to} style={{ textDecoration:'none', display:'block' }}>
              {({ isActive }) => (
                <div style={{ display:'flex', alignItems:'center', gap:collapsed?0:10,
                  padding:collapsed?'10px':'9px 10px', borderRadius:10,
                  justifyContent:collapsed?'center':'flex-start',
                  background:isActive?'rgba(108,99,255,0.2)':'transparent',
                  color:isActive?'#C4B5FD':'rgba(255,255,255,0.45)',
                  cursor:'pointer', transition:'all .15s ease', position:'relative',
                  boxShadow:isActive?'inset 0 0 0 1px rgba(108,99,255,0.25)':'none' }}
                  onMouseEnter={e=>{ if(!isActive){e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.85)'} }}
                  onMouseLeave={e=>{ if(!isActive){e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.45)'} }}>
                  <div style={{ width:28, height:28, borderRadius:7, display:'flex',
                    alignItems:'center', justifyContent:'center', flexShrink:0,
                    background:isActive?'rgba(108,99,255,0.3)':'transparent' }}>
                    <Icon size={15} />
                  </div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        style={{ fontSize:13.5, fontWeight:500, flex:1 }}>{label}</motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <div style={{ width:5, height:5, borderRadius:'50%', background:'#A78BFA', flexShrink:0 }} />
                  )}
                </div>
              )}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink to="/admin" style={{ textDecoration:'none', display:'block' }}>
              {({ isActive }) => (
                <div style={{ display:'flex', alignItems:'center', gap:collapsed?0:10,
                  padding:collapsed?'10px':'9px 10px', borderRadius:10,
                  justifyContent:collapsed?'center':'flex-start',
                  background:isActive?'rgba(245,158,11,0.15)':'transparent',
                  color:isActive?'#FCD34D':'rgba(255,255,255,0.4)',
                  cursor:'pointer', transition:'all .15s ease' }}
                  onMouseEnter={e=>{ if(!isActive){e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'} }}
                  onMouseLeave={e=>{ if(!isActive){e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.4)'} }}>
                  <div style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Shield size={15} />
                  </div>
                  <AnimatePresence>
                    {!collapsed && <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ fontSize:13.5, fontWeight:500 }}>Admin Panel</motion.span>}
                  </AnimatePresence>
                </div>
              )}
            </NavLink>
          )}
        </div>

        {/* AI badge */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ margin:'16px 2px 0', padding:'12px', borderRadius:10,
                background:'rgba(108,99,255,0.08)', border:'1px solid rgba(108,99,255,0.18)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
                <Sparkles size={12} color="#A78BFA" />
                <span style={{ fontSize:12, fontWeight:600, color:'#C4B5FD' }}>AI Powered</span>
              </div>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.28)', lineHeight:1.5, margin:0 }}>
                Gemini 2.5 Flash · RAG · ChromaDB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* FOOTER */}
      <div style={{ padding:'10px', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
        {!collapsed && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', marginBottom:8 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:700, color:'white' }}>{initial}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:12, fontWeight:600, color:'white',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>{user?.full_name}</p>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.28)', margin:0,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
            </div>
          </div>
        )}
        <div style={{ display:'flex', gap:6, justifyContent:collapsed?'center':'stretch' }}>
          <button onClick={toggle}
            style={{ flex:collapsed?'none':1, padding:'7px', borderRadius:9, border:'none', cursor:'pointer',
              background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.5)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:5,
              fontSize:12, fontWeight:500, transition:'all .15s', fontFamily:'inherit' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.85)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.5)'}}>
            {dark ? <Sun size={14}/> : <Moon size={14}/>}
            {!collapsed && (dark?'Light':'Dark')}
          </button>
          <button onClick={()=>{ logout(); navigate('/login') }}
            style={{ flex:collapsed?'none':1, padding:'7px', borderRadius:9, border:'none', cursor:'pointer',
              background:'rgba(239,68,68,0.1)', color:'rgba(252,165,165,0.7)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:5,
              fontSize:12, fontWeight:500, transition:'all .15s', fontFamily:'inherit' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.2)'; e.currentTarget.style.color='#FCA5A5'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.color='rgba(252,165,165,0.7)'}}>
            <LogOut size={14}/> {!collapsed && 'Logout'}
          </button>
        </div>
      </div>
      <style>{`@keyframes pulse-green{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4)}50%{box-shadow:0 0 0 5px rgba(16,185,129,0)}}`}</style>
    </motion.aside>
  )
}
