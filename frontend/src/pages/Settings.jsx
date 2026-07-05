import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'
import { User, Building2, Key, Save, Loader2, Copy, Check, Code2, Globe, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const st = { hidden:{}, show:{ transition:{ staggerChildren:.08 } } }
const it = { hidden:{ opacity:0, y:16 }, show:{ opacity:1, y:0 } }

function Section({ icon:Icon, iconColor, title, children }) {
  return (
    <motion.div variants={it}
      style={{ background:'white', borderRadius:16, border:'1px solid rgba(108,99,255,.09)',
        boxShadow:'0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(108,99,255,.06)', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'18px 24px',
        borderBottom:'1px solid rgba(108,99,255,.07)' }}>
        <div style={{ width:34, height:34, borderRadius:9, flexShrink:0,
          background:`${iconColor}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={16} color={iconColor}/>
        </div>
        <h3 style={{ fontSize:14, fontWeight:700, color:'#0F172A', margin:0,
          fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{title}</h3>
      </div>
      <div style={{ padding:'20px 24px' }}>{children}</div>
    </motion.div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#64748B',
        textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>{label}</label>
      {children}
    </div>
  )
}

const IS = {
  width:'100%', padding:'10px 14px', fontSize:14, background:'#F8FAFC',
  border:'1.5px solid #E5E7EB', borderRadius:10, color:'#0F172A',
  outline:'none', transition:'all .2s', fontFamily:'inherit'
}

export default function Settings() {
  const { user } = useAuth()
  const [saving,setSaving]=useState(false);const [savingCo,setSavingCo]=useState(false)
  const [savingPwd,setSavingPwd]=useState(false);const [copied,setCopied]=useState(false)
  const [embedConfig,setEmbedConfig]=useState(null)
  const [profile,setProfile]=useState({ full_name:user?.full_name||'' })
  const [company,setCompany]=useState({ name:'',description:'',website:'',logo_url:'' })
  const [pwd,setPwd]=useState({ current:'',newPass:'' })

  useEffect(()=>{
    api.get('/company/profile').then(r=>setCompany({ name:r.data.name||'',description:r.data.description||'',website:r.data.website||'',logo_url:r.data.logo_url||'' })).catch(()=>{})
    api.get('/company/embed-config').then(r=>setEmbedConfig(r.data)).catch(()=>{})
  },[])

  const saveProfile=async e=>{ e.preventDefault();setSaving(true)
    try{ await api.patch('/auth/me',{ full_name:profile.full_name });toast.success('Profile updated') }
    catch{ toast.error('Failed') } finally{ setSaving(false) } }

  const saveCo=async e=>{ e.preventDefault();setSavingCo(true)
    try{ await api.patch('/company/profile',company);toast.success('Company updated') }
    catch{ toast.error('Failed') } finally{ setSavingCo(false) } }

  const changePwd=async e=>{ e.preventDefault()
    if(!pwd.current||!pwd.newPass){ toast.error('Fill both fields');return }
    setSavingPwd(true)
    try{ await api.post('/auth/change-password',{ current_password:pwd.current,new_password:pwd.newPass });toast.success('Password updated');setPwd({ current:'',newPass:'' }) }
    catch(err){ toast.error(err.response?.data?.detail||'Failed') } finally{ setSavingPwd(false) } }

  const copyText=t=>{ navigator.clipboard.writeText(t);setCopied(true);setTimeout(()=>setCopied(false),2000);toast.success('Copied!') }

  const focusStyle=e=>{ e.target.style.borderColor='#6C63FF';e.target.style.background='white';e.target.style.boxShadow='0 0 0 3px rgba(108,99,255,.12)' }
  const blurStyle=e=>{ e.target.style.borderColor='#E5E7EB';e.target.style.background='#F8FAFC';e.target.style.boxShadow='none' }

  return (
    <Layout>
      {/* Topbar */}
      <div style={{ background:'rgba(255,255,255,.92)',backdropFilter:'blur(16px)',
        borderBottom:'1px solid rgba(108,99,255,.08)',boxShadow:'0 1px 8px rgba(108,99,255,.05)',
        padding:'18px 28px' }}>
        <div style={{ maxWidth:800,margin:'0 auto' }}>
          <h1 style={{ fontSize:20,fontWeight:700,color:'#0F172A',margin:'0 0 3px',
            fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'-0.02em' }}>Settings</h1>
          <p style={{ fontSize:13,color:'#64748B',margin:0 }}>Manage your account and workspace</p>
        </div>
      </div>

      <div style={{ padding:'24px 28px',maxWidth:800,margin:'0 auto' }}>
        <motion.div variants={st} initial="hidden" animate="show"
          style={{ display:'flex',flexDirection:'column',gap:16 }}>

          {/* Profile */}
          <Section icon={User} iconColor="#6C63FF" title="Profile">
            <div style={{ display:'flex',alignItems:'center',gap:14,marginBottom:20,padding:'14px 16px',
              borderRadius:12,background:'rgba(108,99,255,.04)',border:'1px solid rgba(108,99,255,.1)' }}>
              <div style={{ width:44,height:44,borderRadius:'50%',flexShrink:0,
                background:'linear-gradient(135deg,#6C63FF,#7C3AED)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:18,fontWeight:700,color:'white' }}>
                {user?.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize:14,fontWeight:600,color:'#0F172A',margin:'0 0 2px' }}>{user?.full_name}</p>
                <p style={{ fontSize:12,color:'#64748B',margin:0,textTransform:'capitalize' }}>{user?.role?.replace('_',' ')} · {user?.email}</p>
              </div>
            </div>
            <form onSubmit={saveProfile}>
              <Field label="Full Name">
                <input style={IS} value={profile.full_name} onChange={e=>setProfile(p=>({...p,full_name:e.target.value}))}
                  onFocus={focusStyle} onBlur={blurStyle}/>
              </Field>
              <Field label="Email">
                <input style={{ ...IS,opacity:.6,cursor:'not-allowed' }} value={user?.email} disabled/>
                <p style={{ fontSize:11,color:'#94A3B8',marginTop:5 }}>Email cannot be changed</p>
              </Field>
              <button type="submit" disabled={saving}
                style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',
                  background:'linear-gradient(135deg,#6C63FF,#7C3AED)',color:'white',border:'none',
                  borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',
                  boxShadow:'0 4px 12px rgba(108,99,255,.3)',opacity:saving?.6:1 }}>
                {saving?<Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>:<Save size={15}/>}
                {saving?'Saving…':'Save Profile'}
              </button>
            </form>
          </Section>

          {/* Company */}
          <Section icon={Building2} iconColor="#2563EB" title="Company Profile">
            <form onSubmit={saveCo} style={{ display:'flex',flexDirection:'column',gap:0 }}>
              <Field label="Company Name">
                <input style={IS} value={company.name} onChange={e=>setCompany(c=>({...c,name:e.target.value}))} onFocus={focusStyle} onBlur={blurStyle}/>
              </Field>
              <Field label="Description">
                <textarea style={{ ...IS,resize:'none',height:80 }} value={company.description}
                  onChange={e=>setCompany(c=>({...c,description:e.target.value}))}
                  onFocus={focusStyle} onBlur={blurStyle} placeholder="What does your company do?"/>
              </Field>
              <Field label="Website">
                <div style={{ position:'relative' }}>
                  <Globe size={14} color="#94A3B8" style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)' }}/>
                  <input style={{ ...IS,paddingLeft:34 }} value={company.website}
                    onChange={e=>setCompany(c=>({...c,website:e.target.value}))}
                    onFocus={focusStyle} onBlur={blurStyle} placeholder="https://yourcompany.com"/>
                </div>
              </Field>
              <div style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',
                borderRadius:10,background:'rgba(108,99,255,.05)',border:'1px solid rgba(108,99,255,.1)',
                marginBottom:16 }}>
                <span style={{ fontSize:12,color:'#64748B' }}>Workspace:</span>
                <span style={{ fontSize:12,fontFamily:'monospace',fontWeight:600,color:'#6C63FF' }}>
                  resolveai.app/{user?.company_slug}
                </span>
              </div>
              <button type="submit" disabled={savingCo}
                style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',
                  background:'linear-gradient(135deg,#2563EB,#3B82F6)',color:'white',border:'none',
                  borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',
                  boxShadow:'0 4px 12px rgba(37,99,235,.3)',opacity:savingCo?.6:1,width:'fit-content' }}>
                {savingCo?<Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>:<Save size={15}/>}
                {savingCo?'Saving…':'Save Company'}
              </button>
            </form>
          </Section>

          {/* Embed Code */}
          {embedConfig&&(
            <Section icon={Code2} iconColor="#10B981" title="Chatbot Embed Code">
              <p style={{ fontSize:13,color:'#64748B',marginBottom:16,lineHeight:1.65 }}>
                Add this snippet to any website to embed your AI chatbot. Customers chat without logging in.
              </p>
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:11,fontWeight:600,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8 }}>Script Tag</p>
                <div style={{ position:'relative',background:'#0F172A',borderRadius:12,padding:'14px 16px' }}>
                  <code style={{ fontSize:12,color:'#A78BFA',wordBreak:'break-all',lineHeight:1.65,display:'block',paddingRight:36 }}>
                    {embedConfig.script_tag}
                  </code>
                  <button onClick={()=>copyText(embedConfig.script_tag)}
                    style={{ position:'absolute',top:10,right:10,padding:'5px 8px',borderRadius:7,
                      border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.05)',
                      cursor:'pointer',color:copied?'#10B981':'#94A3B8',display:'flex',transition:'color .15s' }}>
                    {copied?<Check size={13}/>:<Copy size={13}/>}
                  </button>
                </div>
              </div>
              <div>
                <p style={{ fontSize:11,fontWeight:600,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8 }}>Direct Chat URL</p>
                <div style={{ display:'flex',gap:8 }}>
                  <input value={`http://localhost:3000/chat/${embedConfig.slug}`} readOnly
                    style={{ ...IS,fontFamily:'monospace',fontSize:13,flex:1 }}/>
                  <button onClick={()=>copyText(`http://localhost:3000/chat/${embedConfig.slug}`)}
                    style={{ padding:'10px 14px',borderRadius:10,border:'1px solid #E5E7EB',
                      background:'white',cursor:'pointer',display:'flex',alignItems:'center',
                      color:'#64748B',transition:'all .15s',fontFamily:'inherit' }}>
                    <Copy size={14}/>
                  </button>
                  <a href={`/chat/${embedConfig.slug}`} target="_blank" rel="noreferrer"
                    style={{ padding:'10px 14px',borderRadius:10,border:'1px solid #E5E7EB',
                      background:'white',display:'flex',alignItems:'center',textDecoration:'none',color:'#64748B' }}>
                    <ExternalLink size={14}/>
                  </a>
                </div>
              </div>
            </Section>
          )}

          {/* Security */}
          <Section icon={Key} iconColor="#F59E0B" title="Security">
            <form onSubmit={changePwd}>
              <Field label="Current Password">
                <input type="password" style={IS} value={pwd.current}
                  onChange={e=>setPwd(p=>({...p,current:e.target.value}))}
                  onFocus={focusStyle} onBlur={blurStyle} placeholder="••••••••"/>
              </Field>
              <Field label="New Password">
                <input type="password" style={IS} value={pwd.newPass}
                  onChange={e=>setPwd(p=>({...p,newPass:e.target.value}))}
                  onFocus={focusStyle} onBlur={blurStyle} placeholder="Min 8 characters"/>
              </Field>
              <button type="submit" disabled={savingPwd}
                style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',
                  background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'white',border:'none',
                  borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',
                  boxShadow:'0 4px 12px rgba(245,158,11,.3)',opacity:savingPwd?.6:1 }}>
                {savingPwd?<Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>:<Key size={15}/>}
                {savingPwd?'Updating…':'Update Password'}
              </button>
            </form>
          </Section>

        </motion.div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Layout>
  )
}
