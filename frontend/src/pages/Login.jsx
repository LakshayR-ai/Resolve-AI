import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Bot, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const fade = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0 } }
const stag = { hidden:{}, show:{ transition:{ staggerChildren:.08 } } }

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
    <div style={{ minHeight:'100vh', display:'flex', background:'#080B14', position:'relative', overflow:'hidden' }}>
      {/* bg orbs */}
      <div style={{ position:'absolute', top:'-10%', left:'-5%', width:600, height:600, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 65%)',
        filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)',
        filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'40%', right:'20%', width:300, height:300, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 65%)',
        filter:'blur(40px)', pointerEvents:'none' }} />

      {/* LEFT PANEL */}
      <div className="hidden lg:flex" style={{ width:'48%', flexDirection:'column', justifyContent:'space-between',
        padding:'48px', position:'relative' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Bot size={18} color="white" />
          </div>
          <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18,
            color:'white', letterSpacing:'-0.03em' }}>
            Resolve<span style={{ color:'#A78BFA' }}>AI</span>
          </span>
        </Link>

        <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }} transition={{ delay:.2, duration:.6 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px',
            borderRadius:99, background:'rgba(108,99,255,0.15)', border:'1px solid rgba(108,99,255,0.3)',
            fontSize:12, fontWeight:500, color:'#A78BFA', marginBottom:28 }}>
            ✨ AI-Powered Support Platform
          </div>
          <h1 style={{ fontSize:'clamp(32px,3.5vw,52px)', fontFamily:"'Plus Jakarta Sans',sans-serif",
            fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.1, color:'white', marginBottom:18 }}>
            Build AI Customer<br />Support in Minutes
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.5)', lineHeight:1.7, maxWidth:380, marginBottom:36 }}>
            Upload documents, configure AI, deploy on your website — no coding required.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {['Zero hallucinations — answers from your documents only',
              'Deploy as embeddable widget in minutes',
              'Real-time analytics and sentiment analysis'].map((t,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'rgba(255,255,255,0.65)' }}>
                <CheckCircle2 size={16} color="#10B981" style={{ flexShrink:0 }} /> {t}
              </div>
            ))}
          </div>
        </motion.div>

        <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)' }}>© 2025 ResolveAI</p>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <motion.div variants={stag} initial="hidden" animate="show" style={{ width:'100%', maxWidth:440 }}>
          {/* Mobile logo */}
          <motion.div variants={fade} className="flex lg:hidden"
            style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32, justifyContent:'center' }}>
            <div style={{ width:36, height:36, borderRadius:10,
              background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Bot size={18} color="white" />
            </div>
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18, color:'white' }}>
              Resolve<span style={{ color:'#A78BFA' }}>AI</span>
            </span>
          </motion.div>

          {/* Glass card */}
          <motion.div variants={fade}
            style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(24px)',
              WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:20, padding:'40px 36px',
              boxShadow:'0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)' }}>

            <motion.div variants={fade} style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:24, fontWeight:800, color:'white', marginBottom:6,
                fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.03em' }}>Welcome back</h2>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)' }}>Sign in to your workspace</p>
            </motion.div>

            <form onSubmit={submit}>
              <motion.div variants={fade} style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)',
                  textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Email</label>
                <div style={{ position:'relative' }}>
                  <Mail size={15} color="rgba(255,255,255,0.35)"
                    style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
                  <input name="email" type="email" value={form.email} onChange={set} required
                    placeholder="you@company.com"
                    style={{ width:'100%', padding:'11px 14px 11px 42px', fontSize:14,
                      background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
                      borderRadius:10, color:'white', outline:'none', transition:'all .2s' }}
                    onFocus={e=>{ e.target.style.borderColor='rgba(108,99,255,0.6)'; e.target.style.background='rgba(108,99,255,0.08)' }}
                    onBlur={e=>{ e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.background='rgba(255,255,255,0.06)' }} />
                </div>
              </motion.div>

              <motion.div variants={fade} style={{ marginBottom:24 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.6)',
                  textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Password</label>
                <div style={{ position:'relative' }}>
                  <Lock size={15} color="rgba(255,255,255,0.35)"
                    style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
                  <input name="password" type={show?'text':'password'} value={form.password} onChange={set} required
                    placeholder="••••••••"
                    style={{ width:'100%', padding:'11px 42px 11px 42px', fontSize:14,
                      background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
                      borderRadius:10, color:'white', outline:'none', transition:'all .2s' }}
                    onFocus={e=>{ e.target.style.borderColor='rgba(108,99,255,0.6)'; e.target.style.background='rgba(108,99,255,0.08)' }}
                    onBlur={e=>{ e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.background='rgba(255,255,255,0.06)' }} />
                  <button type="button" onClick={()=>setShow(s=>!s)}
                    style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)',
                      display:'flex', padding:0 }}>
                    {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </motion.div>

              <motion.button variants={fade} type="submit" disabled={loading}
                style={{ width:'100%', padding:'12px', fontSize:15, fontWeight:700, color:'white', border:'none',
                  background:'linear-gradient(135deg,#6C63FF,#7C3AED)', borderRadius:12, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow:'0 8px 24px rgba(108,99,255,0.4)', opacity:loading?.5:1,
                  transition:'all .2s ease', fontFamily:'inherit' }}>
                {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16}/></>}
              </motion.button>
            </form>

            <motion.div variants={fade}
              style={{ marginTop:24, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.08)',
                textAlign:'center', fontSize:14, color:'rgba(255,255,255,0.4)' }}>
              No account?{' '}
              <Link to="/register" style={{ color:'#A78BFA', fontWeight:600, textDecoration:'none' }}>
                Create workspace →
              </Link>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
