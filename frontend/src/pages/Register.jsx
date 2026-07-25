import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Bot, User, Mail, Lock, Building2, ArrowRight, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const fade = { hidden:{ opacity:0, y:18 }, show:{ opacity:1, y:0 } }
const stag = { hidden:{}, show:{ transition:{ staggerChildren:.06 } } }

const LABEL_STYLE = {
  display:'block', fontSize:11, fontWeight:600, color:'#374151',
  textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7
}
const INPUT_BASE = {
  width:'100%', padding:'11px 14px 11px 42px', fontSize:14,
  background:'#F9FAFB', border:'1.5px solid #E5E7EB',
  borderRadius:11, color:'#0F172A', outline:'none', transition:'all .2s', fontFamily:'inherit'
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

  const onFocus = e => {
    e.target.style.borderColor='#6366F1'
    e.target.style.background='white'
    e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)'
  }
  const onBlur = e => {
    e.target.style.borderColor='#E5E7EB'
    e.target.style.background='#F9FAFB'
    e.target.style.boxShadow='none'
  }

  const fields = [
    { name:'full_name',    icon:User,      label:'Full Name',    type:'text',     placeholder:'Jane Smith'       },
    { name:'email',        icon:Mail,      label:'Work Email',   type:'email',    placeholder:'jane@company.com' },
    { name:'password',     icon:Lock,      label:'Password',     type:'password', placeholder:'Min 8 characters' },
    { name:'company_name', icon:Building2, label:'Company Name', type:'text',     placeholder:'Acme Corp'        },
  ]

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#F5F7FB', padding:'24px', position:'relative', overflow:'hidden' }}>

      {/* Subtle bg blobs */}
      <div style={{ position:'absolute', top:'-10%', left:'-8%', width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)',
        filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-8%', right:'-6%', width:400, height:400, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 65%)',
        filter:'blur(60px)', pointerEvents:'none' }} />

      <motion.div variants={stag} initial="hidden" animate="show"
        style={{ width:'100%', maxWidth:460, position:'relative' }}>

        {/* Logo */}
        <motion.div variants={fade}
          style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'center', marginBottom:28 }}>
          <div style={{ width:38, height:38, borderRadius:11,
            background:'linear-gradient(135deg,#6366F1,#7C3AED)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 14px rgba(99,102,241,0.35)' }}>
            <Bot size={19} color="white" />
          </div>
          <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:20,
            color:'#0F172A', letterSpacing:'-0.03em' }}>
            Resolve<span style={{ color:'#6366F1' }}>AI</span>
          </span>
        </motion.div>

        {/* White card */}
        <motion.div variants={fade}
          style={{ background:'white', borderRadius:20, padding:'38px 36px',
            border:'1px solid rgba(99,102,241,0.12)',
            boxShadow:'0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(99,102,241,0.1)' }}>

          <div style={{ marginBottom:26 }}>
            <h2 style={{ fontSize:25, fontWeight:800, color:'#0F172A', marginBottom:6,
              fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.03em' }}>
              Create your workspace
            </h2>
            <p style={{ fontSize:14, color:'#6B7280' }}>Set up your AI support platform in minutes</p>
          </div>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {fields.map(({ name, icon:Icon, label, type, placeholder }) => (
              <motion.div key={name} variants={fade}>
                <label style={LABEL_STYLE}>{label}</label>
                <div style={{ position:'relative' }}>
                  <Icon size={14} color="#9CA3AF"
                    style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
                  <input name={name} type={type} value={form[name]} onChange={set}
                    placeholder={placeholder} required
                    style={INPUT_BASE}
                    onFocus={onFocus} onBlur={onBlur} />
                </div>
              </motion.div>
            ))}

            {/* Slug */}
            <motion.div variants={fade}>
              <label style={LABEL_STYLE}>Workspace URL</label>
              <div style={{ display:'flex', borderRadius:11, overflow:'hidden',
                border:'1.5px solid #E5E7EB', background:'#F9FAFB',
                transition:'all .2s' }}
                onFocusCapture={e=>{ e.currentTarget.style.borderColor='#6366F1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)' }}
                onBlurCapture={e=>{ e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.boxShadow='none' }}>
                <span style={{ padding:'11px 13px', fontSize:13, color:'#6B7280',
                  background:'#F3F4F6', borderRight:'1px solid #E5E7EB',
                  whiteSpace:'nowrap', display:'flex', alignItems:'center', fontFamily:'monospace' }}>
                  resolveai.app/
                </span>
                <input name="company_slug" value={form.company_slug} onChange={set}
                  placeholder="acme-corp" required pattern="[a-z0-9-]+"
                  style={{ flex:1, padding:'11px 14px', fontSize:14, background:'transparent',
                    border:'none', color:'#0F172A', outline:'none', fontFamily:'inherit' }} />
              </div>
              <p style={{ fontSize:11, color:'#9CA3AF', marginTop:5 }}>Lowercase letters, numbers, and hyphens only</p>
            </motion.div>

            {/* Submit */}
            <motion.button variants={fade} type="submit" disabled={loading}
              style={{ width:'100%', padding:'13px', fontSize:15, fontWeight:700, color:'white',
                border:'none', background:'linear-gradient(135deg,#6366F1,#7C3AED)', borderRadius:12,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow:'0 4px 14px rgba(99,102,241,0.38)',
                opacity: loading ? 0.6 : 1,
                marginTop:4, transition:'all .2s', fontFamily:'inherit' }}
              onMouseEnter={e=>{ if(!loading) e.currentTarget.style.boxShadow='0 8px 24px rgba(99,102,241,0.5)' }}
              onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 4px 14px rgba(99,102,241,0.38)' }}>
              {loading
                ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 1s linear infinite' }}/> Creating…</>
                : <><span>Create Workspace</span><ArrowRight size={16}/></>}
            </motion.button>
          </form>

          <div style={{ marginTop:22, paddingTop:20, borderTop:'1px solid #F3F4F6',
            textAlign:'center', fontSize:14, color:'#6B7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#6366F1', fontWeight:600, textDecoration:'none' }}>Sign in →</Link>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div variants={fade}
          style={{ marginTop:18, display:'flex', justifyContent:'center', gap:22 }}>
          {['Secure · JWT Auth','No credit card','Free to use'].map(t => (
            <span key={t} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#9CA3AF' }}>
              <CheckCircle2 size={11} color="#10B981" /> {t}
            </span>
          ))}
        </motion.div>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
