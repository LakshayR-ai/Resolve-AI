import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Bot, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const fade = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:.45 } } }
const stag = { hidden:{}, show:{ transition:{ staggerChildren:.07 } } }

const FEATURES = [
  'Zero hallucinations — answers from your documents only',
  'Deploy as embeddable widget in minutes',
  'Real-time analytics and sentiment analysis',
]

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [show, setShow] = useState(false)
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    const r = await login(form.email, form.password)
    if (r.success) { toast.success('Welcome back!'); navigate('/dashboard') }
    else toast.error(r.error)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#F5F7FB', position:'relative', overflow:'hidden' }}>

      {/* Subtle background shapes */}
      <div style={{ position:'absolute', top:'-8%', left:'-4%', width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)',
        filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-8%', right:'-4%', width:420, height:420, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)',
        filter:'blur(60px)', pointerEvents:'none' }} />

      {/* ── LEFT PANEL ── gradient brand panel */}
      <div className="hidden lg:flex" style={{ width:'46%', flexDirection:'column', justifyContent:'space-between',
        padding:'52px 56px', position:'relative', overflow:'hidden',
        background:'linear-gradient(145deg, #4F46E5 0%, #6366F1 40%, #7C3AED 100%)' }}>

        {/* Pattern overlay */}
        <div style={{ position:'absolute', inset:0, opacity:0.06, pointerEvents:'none',
          backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize:'28px 28px' }} />
        <div style={{ position:'absolute', bottom:'-60px', right:'-60px', width:280, height:280, borderRadius:'50%',
          background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'30%', left:'-40px', width:180, height:180, borderRadius:'50%',
          background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none', position:'relative' }}>
          <div style={{ width:38, height:38, borderRadius:11,
            background:'rgba(255,255,255,0.2)', backdropFilter:'blur(10px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            border:'1px solid rgba(255,255,255,0.25)' }}>
            <Bot size={19} color="white" />
          </div>
          <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:20,
            color:'white', letterSpacing:'-0.03em' }}>
            ResolveAI
          </span>
        </Link>

        {/* Hero text */}
        <motion.div initial={{ opacity:0, x:-28 }} animate={{ opacity:1, x:0 }}
          transition={{ delay:.25, duration:.6 }} style={{ position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 14px',
            borderRadius:99, background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.28)',
            fontSize:12, fontWeight:600, color:'white', marginBottom:26 }}>
            <Sparkles size={12} /> AI-Powered Support Platform
          </div>
          <h1 style={{ fontSize:'clamp(30px,3.2vw,48px)', fontFamily:"'Plus Jakarta Sans',sans-serif",
            fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.1, color:'white', marginBottom:18 }}>
            Build AI Customer<br />Support in Minutes
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.72)', lineHeight:1.7, maxWidth:360, marginBottom:36 }}>
            Upload documents, configure your AI, deploy on your website — no coding required.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
            {FEATURES.map((t,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:11, fontSize:14, color:'rgba(255,255,255,0.85)' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0,
                  background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <CheckCircle2 size={13} color="white" />
                </div>
                {t}
              </div>
            ))}
          </div>
        </motion.div>

        <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', position:'relative' }}>© 2025 ResolveAI</p>
      </div>

      {/* ── RIGHT PANEL ── clean white form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px' }}>
        <motion.div variants={stag} initial="hidden" animate="show" style={{ width:'100%', maxWidth:430 }}>

          {/* Mobile logo */}
          <motion.div variants={fade} className="flex lg:hidden"
            style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32, justifyContent:'center' }}>
            <div style={{ width:36, height:36, borderRadius:10,
              background:'linear-gradient(135deg,#6366F1,#7C3AED)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Bot size={18} color="white" />
            </div>
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18, color:'#0F172A' }}>
              ResolveAI
            </span>
          </motion.div>

          {/* Form card */}
          <motion.div variants={fade}
            style={{ background:'white', borderRadius:20, padding:'40px 38px',
              border:'1px solid rgba(99,102,241,0.12)',
              boxShadow:'0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(99,102,241,0.1)' }}>

            <div style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:26, fontWeight:800, color:'#0F172A', marginBottom:6,
                fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.03em' }}>Welcome back</h2>
              <p style={{ fontSize:14, color:'#6B7280' }}>Sign in to your ResolveAI workspace</p>
            </div>

            <form onSubmit={submit}>
              {/* Email */}
              <div style={{ marginBottom:18 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151',
                  textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Email</label>
                <div style={{ position:'relative' }}>
                  <Mail size={15} color="#9CA3AF"
                    style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
                  <input name="email" type="email" value={form.email} onChange={set} required
                    placeholder="you@company.com"
                    style={{ width:'100%', padding:'11px 14px 11px 42px', fontSize:14,
                      background:'#F9FAFB', border:'1.5px solid #E5E7EB',
                      borderRadius:11, color:'#0F172A', outline:'none', transition:'all .2s',
                      fontFamily:'inherit' }}
                    onFocus={e=>{ e.target.style.borderColor='#6366F1'; e.target.style.background='white'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)' }}
                    onBlur={e=>{ e.target.style.borderColor='#E5E7EB'; e.target.style.background='#F9FAFB'; e.target.style.boxShadow='none' }} />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom:26 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151',
                  textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Password</label>
                <div style={{ position:'relative' }}>
                  <Lock size={15} color="#9CA3AF"
                    style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
                  <input name="password" type={show?'text':'password'} value={form.password} onChange={set} required
                    placeholder="••••••••"
                    style={{ width:'100%', padding:'11px 44px 11px 42px', fontSize:14,
                      background:'#F9FAFB', border:'1.5px solid #E5E7EB',
                      borderRadius:11, color:'#0F172A', outline:'none', transition:'all .2s',
                      fontFamily:'inherit' }}
                    onFocus={e=>{ e.target.style.borderColor='#6366F1'; e.target.style.background='white'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)' }}
                    onBlur={e=>{ e.target.style.borderColor='#E5E7EB'; e.target.style.background='#F9FAFB'; e.target.style.boxShadow='none' }} />
                  <button type="button" onClick={()=>setShow(s=>!s)}
                    style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', display:'flex', padding:0 }}>
                    {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ width:'100%', padding:'13px', fontSize:15, fontWeight:700, color:'white', border:'none',
                  background:'linear-gradient(135deg,#6366F1,#7C3AED)', borderRadius:12, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow:'0 4px 14px rgba(99,102,241,0.38)',
                  opacity: loading ? 0.6 : 1,
                  transition:'all .2s ease', fontFamily:'inherit' }}
                onMouseEnter={e=>{ if(!loading) e.currentTarget.style.boxShadow='0 8px 24px rgba(99,102,241,0.5)' }}
                onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 4px 14px rgba(99,102,241,0.38)' }}>
                {loading
                  ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 1s linear infinite' }}/> Signing in…</>
                  : <><span>Sign In</span><ArrowRight size={16}/></>}
              </button>
            </form>

            <div style={{ marginTop:24, paddingTop:22, borderTop:'1px solid #F3F4F6',
              textAlign:'center', fontSize:14, color:'#6B7280' }}>
              No account?{' '}
              <Link to="/register" style={{ color:'#6366F1', fontWeight:600, textDecoration:'none' }}>
                Create workspace →
              </Link>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fade}
            style={{ marginTop:20, display:'flex', justifyContent:'center', gap:24 }}>
            {['Secure · JWT Auth', 'No credit card', 'Free to use'].map(t => (
              <span key={t} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#9CA3AF' }}>
                <CheckCircle2 size={11} color="#10B981" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
