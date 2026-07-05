import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { Building2, Users, MessageSquare, FileText, ToggleLeft, ToggleRight, Loader2, Search, Shield, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const st = { hidden:{}, show:{ transition:{ staggerChildren:.05 } } }
const it = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0 } }

export default function Admin() {
  const [stats,setStats]=useState(null);const [companies,setCompanies]=useState([])
  const [filtered,setFiltered]=useState([]);const [loading,setLoading]=useState(true)
  const [search,setSearch]=useState('')

  const load=()=>{ setLoading(true)
    Promise.all([
      api.get('/admin/stats').then(r=>setStats(r.data)),
      api.get('/admin/companies').then(r=>{ setCompanies(r.data.companies);setFiltered(r.data.companies) })
    ]).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)) }
  useEffect(()=>{load()},[])
  useEffect(()=>{
    if(!search.trim()){setFiltered(companies);return}
    const q=search.toLowerCase(); setFiltered(companies.filter(c=>c.name.toLowerCase().includes(q)||c.slug.includes(q)))
  },[search,companies])

  const toggle=async id=>{
    try{ const { data }=await api.patch(`/admin/companies/${id}/toggle`)
      setCompanies(cs=>cs.map(c=>c.id===id?{...c,is_active:data.is_active}:c))
      toast.success(`Company ${data.is_active?'activated':'deactivated'}`)
    }catch{ toast.error('Failed') } }

  if(loading) return (
    <Layout>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',gap:10 }}>
        <Loader2 size={22} color="#6C63FF" style={{ animation:'spin 1s linear infinite' }}/>
        <span style={{ fontSize:14,color:'#64748B' }}>Loading admin data…</span>
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
        <div style={{ maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,
              background:'linear-gradient(135deg,rgba(245,158,11,.15),rgba(217,119,6,.1))',
              display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Shield size={18} color="#D97706"/>
            </div>
            <div>
              <h1 style={{ fontSize:20,fontWeight:700,color:'#0F172A',margin:'0 0 2px',
                fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'-0.02em' }}>Super Admin</h1>
              <p style={{ fontSize:13,color:'#64748B',margin:0 }}>Platform-wide management and oversight</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'24px 28px',maxWidth:1200,margin:'0 auto' }}>

        {/* Stats */}
        <motion.div variants={st} initial="hidden" animate="show"
          style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:22 }}>
          {[
            { l:'Companies',c:stats?.total_companies, icon:Building2,   g:'linear-gradient(135deg,#6C63FF,#7C3AED)' },
            { l:'Users',     c:stats?.total_users,     icon:Users,        g:'linear-gradient(135deg,#2563EB,#3B82F6)' },
            { l:'Documents', c:stats?.total_documents, icon:FileText,     g:'linear-gradient(135deg,#059669,#10B981)' },
            { l:'Sessions',  c:stats?.total_sessions,  icon:MessageSquare,g:'linear-gradient(135deg,#D97706,#F59E0B)' },
            { l:'Messages',  c:stats?.total_messages,  icon:MessageSquare,g:'linear-gradient(135deg,#DC2626,#EF4444)' },
          ].map(({ l,c,icon:Icon,g })=>(
            <motion.div key={l} variants={it}
              style={{ background:'white',borderRadius:14,border:'1px solid rgba(108,99,255,.09)',
                boxShadow:'0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(108,99,255,.06)',
                padding:'16px 18px',position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:g,borderRadius:'14px 14px 0 0' }}/>
              <div style={{ width:32,height:32,borderRadius:9,marginBottom:10,background:g,
                display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Icon size={14} color="white"/>
              </div>
              <p style={{ fontSize:24,fontWeight:800,color:'#0F172A',margin:'0 0 3px',lineHeight:1,
                fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:'-0.03em' }}>{c??0}</p>
              <p style={{ fontSize:12,color:'#64748B',margin:0 }}>{l}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Companies table */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:.2 }}
          style={{ background:'white',borderRadius:16,border:'1px solid rgba(108,99,255,.09)',
            boxShadow:'0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(108,99,255,.06)',overflow:'hidden' }}>

          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'16px 20px',borderBottom:'1px solid rgba(108,99,255,.07)' }}>
            <p style={{ fontSize:14,fontWeight:700,color:'#0F172A',margin:0,
              fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              All Companies <span style={{ fontWeight:400,color:'#94A3B8' }}>({filtered.length})</span>
            </p>
            <div style={{ position:'relative' }}>
              <Search size={13} color="#94A3B8" style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)' }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search companies…"
                style={{ paddingLeft:32,paddingRight:12,paddingTop:7,paddingBottom:7,
                  fontSize:13,background:'#F8FAFC',border:'1px solid #E5E7EB',borderRadius:9,
                  outline:'none',width:220,color:'#0F172A',transition:'all .2s',fontFamily:'inherit' }}
                onFocus={e=>{e.target.style.borderColor='#6C63FF';e.target.style.boxShadow='0 0 0 3px rgba(108,99,255,.1)'}}
                onBlur={e=>{e.target.style.borderColor='#E5E7EB';e.target.style.boxShadow='none'}}/>
            </div>
          </div>

          {filtered.length===0 ? (
            <div style={{ padding:48,textAlign:'center' }}>
              <Building2 size={28} color="#CBD5E1" style={{ marginBottom:10 }}/>
              <p style={{ fontSize:13,color:'#94A3B8' }}>No companies found</p>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#F8FAFC' }}>
                    {['Company','Slug','Users','Docs','Sessions','Status','Chatbot','Actions'].map(h=>(
                      <th key={h} style={{ padding:'11px 18px',textAlign:'left',fontSize:11,fontWeight:700,
                        color:'#64748B',textTransform:'uppercase',letterSpacing:'0.07em',whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c,i)=>(
                    <tr key={c.id}
                      style={{ borderTop:'1px solid rgba(108,99,255,.06)',
                        background:i%2===0?'white':'#FAFBFF',transition:'background .15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(108,99,255,.04)'}
                      onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'white':'#FAFBFF'}>
                      <td style={{ padding:'13px 18px' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                          <div style={{ width:30,height:30,borderRadius:9,flexShrink:0,
                            background:`linear-gradient(135deg,#6C63FF22,#7C3AED11)`,
                            border:'1px solid rgba(108,99,255,.2)',
                            display:'flex',alignItems:'center',justifyContent:'center',
                            fontSize:13,fontWeight:700,color:'#6C63FF' }}>
                            {c.name[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontSize:13,fontWeight:600,color:'#0F172A' }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:'13px 18px' }}><span style={{ fontSize:12,fontFamily:'monospace',color:'#64748B' }}>{c.slug}</span></td>
                      <td style={{ padding:'13px 18px',fontSize:13,color:'#374151' }}>{c.user_count}</td>
                      <td style={{ padding:'13px 18px',fontSize:13,color:'#374151' }}>{c.document_count}</td>
                      <td style={{ padding:'13px 18px',fontSize:13,color:'#374151' }}>{c.chat_count}</td>
                      <td style={{ padding:'13px 18px' }}>
                        <span style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',
                          borderRadius:99,fontSize:11,fontWeight:600,
                          background:c.is_active?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)',
                          color:c.is_active?'#059669':'#DC2626' }}>
                          <div style={{ width:5,height:5,borderRadius:'50%',background:c.is_active?'#10B981':'#EF4444' }}/>
                          {c.is_active?'Active':'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding:'13px 18px' }}>
                        <a href={`/chat/${c.slug}`} target="_blank" rel="noreferrer"
                          style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:12,
                            color:'#6C63FF',textDecoration:'none',fontWeight:500 }}>
                          View <ExternalLink size={11}/>
                        </a>
                      </td>
                      <td style={{ padding:'13px 18px' }}>
                        <button onClick={()=>toggle(c.id)} title={c.is_active?'Deactivate':'Activate'}
                          style={{ background:'none',border:'none',cursor:'pointer',
                            display:'flex',alignItems:'center',color:'#94A3B8',padding:0,transition:'color .15s' }}
                          onMouseEnter={e=>e.currentTarget.style.color='#6C63FF'}
                          onMouseLeave={e=>e.currentTarget.style.color='#94A3B8'}>
                          {c.is_active ? <ToggleRight size={24} color="#6C63FF"/> : <ToggleLeft size={24}/>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Security note */}
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:.35 }}
          style={{ marginTop:16,padding:'14px 18px',borderRadius:12,
            background:'rgba(245,158,11,.06)',border:'1px solid rgba(245,158,11,.2)',
            display:'flex',alignItems:'flex-start',gap:12 }}>
          <Shield size={16} color="#D97706" style={{ marginTop:1,flexShrink:0 }}/>
          <div>
            <p style={{ fontSize:13,fontWeight:600,color:'#92400E',margin:'0 0 3px' }}>Platform Security</p>
            <p style={{ fontSize:12,color:'#B45309',margin:0,lineHeight:1.6 }}>
              Each company has fully isolated vector stores and document storage. Deactivating a company immediately blocks access to their chatbot and all API endpoints.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
