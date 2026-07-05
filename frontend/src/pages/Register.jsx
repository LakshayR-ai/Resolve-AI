import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Bot, User, Mail, Lock, Building2, ArrowRight, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const fade = { hidden:{ opacity:0, y:18 }, show:{ opacity:1, y:0 } }
const stag = { hidden:{}, show:{ transition:{ staggerChildren:.07 } } }

const inputStyle = {
  width:'100%', padding:'11px 14px 11px 42px', fontSize:14,
  background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
  borderRadius:10, color:'white', outline:'none', transition:'all .2s', fontFamily:'inherit'
}

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name:'', email:'', password:'', company_name:'', company_slug:'' })

  const set = e => {
    const { name, value } = e.target
    setForm(f => {
      const u = { ...f, [name]: value }
      if (name === 'company_name')
        u.company_slug = value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
      return u
    })
  }

  const submit = async e => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    const r = await register(form)
    if (r.success) { toast.success('Workspace created!'); navigate('/dashboard') }
    else toast.error(r.error)
  }

  const fields = [
    { name:'full_name',    icon:User,      label:'Full Name',    type:'text',  placeholder:'Jane Smith' },
    { name:'email',        icon:Mail,      label:'Work Email',   type:'email', placeholder:'jane@company.com' },
    { name:'password',     icon:Lock,      label:'Password',     type:'password', placeholder:'Min 8 characters' },
    { name:'company_name', icon:Building2, label:'Company Name', type:'text',  placeholder:'Acme Corp' },
  ]

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#080B14', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-15%', left:'-10%', width:700, height:700, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(108,99,255,0.13) 0%, transparent 65%)',
        filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)',
        filter:'blur(60px)', pointerEvents:'none' }} />

      <motion.div variants={stag} initial="hidden" animate="show" style={{ width:'100%', maxWidth:460 }}>
        <motion.div variants={fade}
          style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center', marginBottom:32 }}>
          <div style={{ width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Bot size={18} color="white" />
          </div>
          <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18,
            color:'white', letterSpacing:'-0.03em' }}>
            Resolve<span style={{ color:'#A78BFA' }}>AI</span>
          </span>
        </motion.div>

        <motion.div variants={fade}
          style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(24px)',
            WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:20, padding:'36px 34px',
            boxShadow:'0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)' }}>

          <motion.div variants={fade} style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:24, fontWeight:800, color:'white', marginBottom:6,
              fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.03em' }}>Create your workspace</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)' }}>Set up your AI support platform in minutes</p>
          </motion.div>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {fields.map(({ name, icon:Icon, label, type, placeholder }) => (
              <motion.div key={name} variants={fade}>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.5)',
                  textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>{label}</label>
                <div style={{ position:'relative' }}>
                  <Icon size={14} color="rgba(255,255,255,0.3)"
                    style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
                  <input name={name} type={type} value={form[name]} onChange={set}
                    placeholder={placeholder} required style={inputStyle}
                    onFocus={e=>{ e.target.style.borderColor='rgba(108,99,255,0.6)'; e.target.style.background='rgba(108,99,255,0.08)' }}
                    onBlur={e=>{ e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.background='rgba(255,255,255,0.06)' }} />
                </div>
              </motion.div>
            ))}

            {/* Slug field */}
            <motion.div variants={fade}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.5)',
                textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>Workspace URL</label>
              <div style={{ display:'flex', borderRadius:10, overflow:'hidden',
                border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)' }}>
                <span style={{ padding:'11px 12px', fontSize:13, color:'rgba(255,255,255,0.3)',
                  background:'rgba(255,255,255,0.04)', borderRight:'1px solid rgba(255,255,255,0.08)',
                  whiteSpace:'nowrap', display:'flex', alignItems:'center' }}>resolveai.app/</span>
                <input name="company_slug" value={form.company_slug} onChange={set}
                  placeholder="acme-corp" required pattern="[a-z0-9-]+"
                  style={{ flex:1, padding:'11px 14px', fontSize:14, background:'transparent',
                    border:'none', color:'white', outline:'none', fontFamily:'inherit' }} />
              </div>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:5 }}>Lowercase letters, numbers, hyphens</p>
            </motion.div>

            <motion.button variants={fade} type="submit" disabled={loading}
              style={{ width:'100%', padding:'12px', fontSize:15, fontWeight:700, color:'white',
                border:'none', background:'linear-gradient(135deg,#6C63FF,#7C3AED)', borderRadius:12,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow:'0 8px 24px rgba(108,99,255,0.4)', opacity:loading?.5:1,
                marginTop:4, transition:'all .2s', fontFamily:'inherit' }}>
              {loading ? 'Creating workspace…' : <><span>Create Workspace</span><ArrowRight size={16}/></>}
            </motion.button>
          </form>

          <motion.div variants={fade}
            style={{ marginTop:22, paddingTop:22, borderTop:'1px solid rgba(255,255,255,0.08)',
              textAlign:'center', fontSize:14, color:'rgba(255,255,255,0.4)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#A78BFA', fontWeight:600, textDecoration:'none' }}>Sign in →</Link>
          </motion.div>
        </motion.div>

        <motion.div variants={fade}
          style={{ marginTop:18, display:'flex', justifyContent:'center', gap:20 }}>
          {['Free 14 days','No credit card','Cancel anytime'].map(t => (
            <span key={t} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'rgba(255,255,255,0.28)' }}>
              <CheckCircle2 size={11} color="#10B981" /> {t}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
