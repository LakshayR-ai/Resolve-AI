import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import Layout from '../components/Layout'
import {
  Upload, Trash2, FileText, CheckCircle, AlertCircle,
  Loader2, RotateCcw, Search, X, Database, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 2500   // poll every 2.5 s while any doc is processing

const FILE_COLORS = {
  pdf:  { bg:'rgba(239,68,68,.08)',   c:'#DC2626', l:'PDF'  },
  docx: { bg:'rgba(37,99,235,.08)',   c:'#1D4ED8', l:'DOCX' },
  doc:  { bg:'rgba(37,99,235,.08)',   c:'#1D4ED8', l:'DOC'  },
  txt:  { bg:'rgba(107,114,128,.08)', c:'#4B5563', l:'TXT'  },
  md:   { bg:'rgba(124,58,237,.08)',  c:'#6D28D9', l:'MD'   },
  csv:  { bg:'rgba(16,185,129,.08)',  c:'#047857', l:'CSV'  },
  xlsx: { bg:'rgba(5,150,105,.08)',   c:'#065F46', l:'XLSX' },
  xls:  { bg:'rgba(5,150,105,.08)',   c:'#065F46', l:'XLS'  },
}

// ─── Elapsed timer hook ───────────────────────────────────────────────────────
function useElapsed(active) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!active) { setSecs(0); return }
    setSecs(0)
    const id = setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [active])
  return secs
}

function fmtSecs(s) {
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

// ─── Animated progress shimmer bar ───────────────────────────────────────────
function ProcessingBar({ secs }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{
        height: 4, borderRadius: 99, overflow: 'hidden',
        background: 'rgba(245,158,11,.15)', width: '100%',
      }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg,#F59E0B 0%,#FBBF24 40%,#F59E0B 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.6s ease-in-out infinite',
          width: '60%',
        }}/>
      </div>
      <p style={{ fontSize: 11, color: '#D97706', margin: '4px 0 0', display:'flex', alignItems:'center', gap:4 }}>
        <Clock size={10}/> Processing… {fmtSecs(secs)}
      </p>
    </div>
  )
}

// ─── Single document row ──────────────────────────────────────────────────────
function DocRow({ doc, onDelete, onReindex }) {
  const [hover, setHover] = useState(false)
  const isProcessing = doc.status === 'processing'
  const elapsed = useElapsed(isProcessing)
  const ft = FILE_COLORS[doc.file_type] || FILE_COLORS.txt

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 0,
        padding: '13px 16px', borderRadius: 12, background: 'white',
        border: `1px solid ${isProcessing ? 'rgba(245,158,11,.25)' : hover ? 'rgba(108,99,255,.2)' : 'rgba(108,99,255,.08)'}`,
        boxShadow: hover ? '0 4px 16px rgba(108,99,255,.1)' : '0 1px 3px rgba(0,0,0,.04)',
        transition: 'all .2s ease',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* File icon */}
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: ft.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileText size={18} color={ft.c}/>
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: 600, color: '#0F172A', margin: '0 0 3px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{doc.original_name}</p>
          <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>
            {(doc.file_size / 1024).toFixed(1)} KB
            {doc.chunk_count > 0 && ` · ${doc.chunk_count} chunks`}
            {' · '}{new Date(doc.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
          </p>
        </div>

        {/* Status badge */}
        <StatusBadge status={doc.status}/>

        {/* File type pill */}
        <span style={{
          padding: '2px 8px', borderRadius: 7, fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', background: ft.bg, color: ft.c, flexShrink: 0,
        }}>{ft.l}</span>

        {/* Actions */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          opacity: hover ? 1 : 0, transition: 'opacity .15s', flexShrink: 0,
        }}>
          <ActionBtn icon={RotateCcw} title="Rebuild embeddings" onClick={() => onReindex(doc.id)}
            hoverColor="#6C63FF" hoverBg="rgba(108,99,255,.1)"/>
          <ActionBtn icon={Trash2}    title="Delete"             onClick={() => onDelete(doc.id)}
            hoverColor="#DC2626" hoverBg="rgba(239,68,68,.1)"/>
        </div>
      </div>

      {/* Processing bar — only shown while status === processing */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <ProcessingBar secs={elapsed}/>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function StatusBadge({ status }) {
  const cfg = {
    ready:      { bg:'rgba(16,185,129,.1)',  c:'#059669', dot:'#10B981', l:'Ready'      },
    processing: { bg:'rgba(245,158,11,.1)',  c:'#D97706', dot:'#F59E0B', l:'Processing' },
    failed:     { bg:'rgba(239,68,68,.1)',   c:'#DC2626', dot:'#EF4444', l:'Failed'     },
  }
  const s = cfg[status] || cfg.processing
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.c,
      display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: s.dot,
        ...(status === 'processing' ? { animation: 'pulse-dot 1.5s ease-in-out infinite' } : {}),
      }}/>
      {s.l}
    </span>
  )
}

function ActionBtn({ icon: Icon, title, onClick, hoverColor, hoverBg }) {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: h ? hoverBg : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: h ? hoverColor : '#94A3B8', transition: 'all .15s',
      }}>
      <Icon size={14}/>
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Documents() {
  const [docs,     setDocs]     = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [uploading,setUploading]= useState(false)
  const [dragging, setDragging] = useState(false)
  const [search,   setSearch]   = useState('')
  const [progress, setProgress] = useState(0)
  const fileRef   = useRef()
  const pollRef   = useRef(null)   // interval id
  const prevDocs  = useRef({})     // id → status, to detect transitions

  // ── fetch full list ─────────────────────────────────────────────────────────
  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    api.get('/documents/')
      .then(r => {
        const incoming = r.data.documents
        // detect newly-ready / newly-failed docs → toast
        incoming.forEach(doc => {
          const was = prevDocs.current[doc.id]
          if (was === 'processing' && doc.status === 'ready') {
            toast.success(`"${doc.original_name}" is ready! (${doc.chunk_count} chunks)`)
          }
          if (was === 'processing' && doc.status === 'failed') {
            toast.error(`"${doc.original_name}" failed to process.`)
          }
          prevDocs.current[doc.id] = doc.status
        })
        setDocs(incoming)
        setFiltered(incoming)
      })
      .catch(() => { if (!silent) toast.error('Failed to load documents') })
      .finally(() => { if (!silent) setLoading(false) })
  }, [])

  // ── auto-poll while any doc is processing ──────────────────────────────────
  useEffect(() => {
    const hasProcessing = docs.some(d => d.status === 'processing')
    if (hasProcessing && !pollRef.current) {
      pollRef.current = setInterval(() => load(true), POLL_INTERVAL_MS)
    }
    if (!hasProcessing && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    return () => {}
  }, [docs, load])

  // cleanup on unmount
  useEffect(() => {
    load()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [load])

  // ── search filter ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) { setFiltered(docs); return }
    const q = search.toLowerCase()
    setFiltered(docs.filter(d =>
      d.original_name.toLowerCase().includes(q) || d.file_type.includes(q)
    ))
  }, [search, docs])

  // ── upload ──────────────────────────────────────────────────────────────────
  const upload = async files => {
    const ok = ['pdf','txt','docx','doc','md','csv','xlsx','xls']
    const valid = Array.from(files).filter(f => {
      const e = f.name.split('.').pop().toLowerCase()
      if (!ok.includes(e)) { toast.error(`${f.name}: unsupported file type`); return false }
      if (f.size > 50 * 1024 * 1024) { toast.error(`${f.name}: exceeds 50 MB`); return false }
      return true
    })
    if (!valid.length) return
    setUploading(true)
    let done = 0
    for (const f of valid) {
      const fd = new FormData()
      fd.append('file', f)
      try {
        await api.post('/documents/upload', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
        done++
        setProgress(Math.round(done / valid.length * 100))
        toast.success(`"${f.name}" uploaded — processing started`)
      } catch (e) {
        toast.error(e.response?.data?.detail || `Failed: ${f.name}`)
      }
    }
    setUploading(false)
    setProgress(0)
    load()   // refresh list; auto-poll will kick in automatically
  }

  const del = async id => {
    if (!window.confirm('Delete document and its embeddings?')) return
    try {
      await api.delete(`/documents/${id}`)
      toast.success('Document deleted')
      setDocs(d => d.filter(x => x.id !== id))
    } catch { toast.error('Delete failed') }
  }

  const reindex = async id => {
    try {
      await api.post(`/documents/${id}/reindex`)
      toast.success('Re-indexing started')
      setDocs(d => d.map(x => x.id === id ? { ...x, status:'processing', chunk_count:0 } : x))
    } catch { toast.error('Re-index failed') }
  }

  const ready  = docs.filter(d => d.status === 'ready').length
  const chunks = docs.reduce((s, d) => s + (d.chunk_count || 0), 0)
  const processingCount = docs.filter(d => d.status === 'processing').length

  return (
    <Layout>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1) }
          50%      { opacity:.5; transform:scale(1.4) }
        }
        @keyframes skeleton-wave {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>

      {/* ── Topbar ── */}
      <div style={{
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        boxShadow: '0 1px 16px rgba(99,102,241,0.07)', padding: '18px 28px',
      }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{
              fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 3px',
              fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '-0.02em',
            }}>Knowledge Base</h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
              Your AI learns from these documents
              {processingCount > 0 && (
                <span style={{
                  marginLeft: 10, padding: '2px 8px', borderRadius: 99,
                  background: 'rgba(245,158,11,.12)', color: '#D97706',
                  fontSize: 11, fontWeight: 600,
                }}>
                  <Loader2 size={10} style={{ display:'inline', marginRight:4, animation:'spin 1s linear infinite', verticalAlign:'middle' }}/>
                  {processingCount} processing…
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:'24px 28px', maxWidth:1100, margin:'0 auto' }}>

        {/* ── Stats ── */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
          style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
          {[
            { l:'Total Documents', v:docs.length,        icon:FileText,    c:'#6C63FF', bg:'rgba(108,99,255,.08)' },
            { l:'Ready',           v:ready,              icon:CheckCircle,  c:'#10B981', bg:'rgba(16,185,129,.08)' },
            { l:'Total Chunks',    v:chunks,             icon:Database,    c:'#2563EB', bg:'rgba(37,99,235,.08)'  },
          ].map(({ l,v,icon:Icon,c,bg }) => (
            <div key={l} style={{
              background:'white', borderRadius:14, border:'1px solid rgba(108,99,255,.09)',
              boxShadow:'0 1px 3px rgba(0,0,0,.04)', padding:'16px 20px',
              display:'flex', alignItems:'center', gap:12,
            }}>
              <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:bg,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={16} color={c}/>
              </div>
              <div>
                <p style={{ fontSize:22, fontWeight:800, color:c, margin:'0 0 2px',
                  fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.03em', lineHeight:1 }}>{v}</p>
                <p style={{ fontSize:12, color:'#64748B', margin:0 }}>{l}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Upload zone ── */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files) }}
          onClick={() => !uploading && fileRef.current?.click()}
          style={{
            borderRadius:16, padding:40, textAlign:'center', cursor:'pointer',
            marginBottom:20, transition:'all .2s ease',
            border:`2px dashed ${dragging ? '#6C63FF' : '#E2E8F0'}`,
            background: dragging ? 'rgba(108,99,255,.04)' : 'white',
            boxShadow:'0 1px 3px rgba(0,0,0,.04)',
          }}>
          <input ref={fileRef} type="file" multiple style={{ display:'none' }}
            accept=".pdf,.txt,.docx,.doc,.md,.csv,.xlsx,.xls"
            onChange={e => upload(e.target.files)}/>

          <div style={{
            width:52, height:52, borderRadius:14, margin:'0 auto 16px',
            background: uploading ? 'rgba(108,99,255,.1)' : 'rgba(108,99,255,.07)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {uploading
              ? <Loader2 size={22} color="#6C63FF" style={{ animation:'spin 1s linear infinite' }}/>
              : <Upload  size={22} color="#6C63FF"/>}
          </div>

          {uploading && progress > 0 && (
            <div style={{ marginBottom:12 }}>
              <div style={{ height:5, borderRadius:99, background:'rgba(108,99,255,.15)', maxWidth:220, margin:'0 auto 6px' }}>
                <motion.div
                  style={{ height:'100%', borderRadius:99, background:'linear-gradient(90deg,#6C63FF,#7C3AED)' }}
                  initial={{ width:0 }} animate={{ width:`${progress}%` }} transition={{ duration:.3 }}/>
              </div>
              <p style={{ fontSize:12, color:'#94A3B8' }}>{progress}% uploaded</p>
            </div>
          )}

          <p style={{ fontSize:14, fontWeight:600, color:'#374151', marginBottom:4 }}>
            {uploading ? 'Uploading…' : 'Drop files here or click to upload'}
          </p>
          <p style={{ fontSize:13, color:'#94A3B8' }}>PDF, DOCX, TXT, MD, CSV, XLSX · Max 50 MB</p>
        </motion.div>

        {/* ── Processing notice banner ── */}
        <AnimatePresence>
          {processingCount > 0 && (
            <motion.div
              initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
              style={{
                marginBottom: 16, padding:'12px 18px', borderRadius:12,
                background:'rgba(245,158,11,.07)', border:'1px solid rgba(245,158,11,.2)',
                display:'flex', alignItems:'center', gap:10,
              }}>
              <Loader2 size={15} color="#D97706" style={{ animation:'spin 1s linear infinite', flexShrink:0 }}/>
              <p style={{ fontSize:13, color:'#92400E', margin:0, fontWeight:500 }}>
                {processingCount} document{processingCount > 1 ? 's' : ''} being processed.
                This page updates automatically — no need to refresh.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Document list ── */}
        <div style={{
          borderRadius:16, overflow:'hidden', background:'white',
          border:'1px solid rgba(108,99,255,.09)',
          boxShadow:'0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(108,99,255,.06)',
        }}>
          {/* List header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'14px 18px', borderBottom:'1px solid rgba(108,99,255,.07)' }}>
            <p style={{ fontSize:14, fontWeight:700, color:'#0F172A', margin:0,
              fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              Documents{' '}
              <span style={{ fontWeight:400, color:'#94A3B8' }}>({filtered.length})</span>
            </p>
            <div style={{ position:'relative' }}>
              <Search size={13} color="#94A3B8" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)' }}/>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                style={{
                  paddingLeft:32, paddingRight:28, paddingTop:7, paddingBottom:7,
                  fontSize:13, background:'#F8FAFC', border:'1px solid #E5E7EB',
                  borderRadius:9, outline:'none', width:200, color:'#0F172A',
                  transition:'all .2s', fontFamily:'inherit',
                }}
                onFocus={e => { e.target.style.borderColor='#6C63FF'; e.target.style.boxShadow='0 0 0 3px rgba(108,99,255,.1)' }}
                onBlur={e  => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='none' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{
                  position:'absolute', right:9, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'#94A3B8', display:'flex',
                }}>
                  <X size={12}/>
                </button>
              )}
            </div>
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ padding:20, display:'flex', flexDirection:'column', gap:10 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height:62, borderRadius:12,
                  background:'linear-gradient(90deg,#F1F5F9 25%,#E8EDF5 50%,#F1F5F9 75%)',
                  backgroundSize:'400% 100%', animation:'skeleton-wave 1.6s ease infinite',
                }}/>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:56, textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:14, margin:'0 auto 14px',
                background:'rgba(108,99,255,.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <FileText size={22} color="#6C63FF" style={{ opacity:.4 }}/>
              </div>
              <p style={{ fontSize:14, fontWeight:600, color:'#374151', marginBottom:5 }}>
                {search ? 'No documents match' : 'No documents yet'}
              </p>
              <p style={{ fontSize:13, color:'#94A3B8' }}>
                {search ? 'Try a different term' : 'Upload your first document above'}
              </p>
            </div>
          ) : (
            <div style={{ padding:12, display:'flex', flexDirection:'column', gap:8 }}>
              <AnimatePresence>
                {filtered.map(doc => (
                  <DocRow key={doc.id} doc={doc} onDelete={del} onReindex={reindex}/>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
