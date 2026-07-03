import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import Layout from '../components/Layout'
import {
  Upload, Trash2, FileText, CheckCircle, AlertCircle,
  Loader2, RefreshCw, RotateCcw, Search, X,
  Database
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const FILE_CONFIG = {
  pdf:  { bg: 'rgba(239,68,68,0.08)',  color: '#EF4444', label: 'PDF' },
  docx: { bg: 'rgba(37,99,235,0.08)',  color: '#2563EB', label: 'DOCX' },
  doc:  { bg: 'rgba(37,99,235,0.08)',  color: '#2563EB', label: 'DOC' },
  txt:  { bg: 'rgba(107,114,128,0.08)',color: '#6B7280', label: 'TXT' },
  md:   { bg: 'rgba(124,58,237,0.08)', color: '#7C3AED', label: 'MD' },
  csv:  { bg: 'rgba(16,185,129,0.08)', color: '#10B981', label: 'CSV' },
  xlsx: { bg: 'rgba(5,150,105,0.08)',  color: '#059669', label: 'XLSX' },
  xls:  { bg: 'rgba(5,150,105,0.08)',  color: '#059669', label: 'XLS' },
}

const STATUS_CONFIG = {
  ready:      { bg: 'rgba(16,185,129,0.08)',  color: '#10B981', label: 'Ready' },
  processing: { bg: 'rgba(245,158,11,0.08)',  color: '#F59E0B', label: 'Processing' },
  failed:     { bg: 'rgba(239,68,68,0.08)',   color: '#EF4444', label: 'Failed' },
}

function DocCard({ doc, onDelete, onReindex }) {
  const ft = FILE_CONFIG[doc.file_type] || FILE_CONFIG.txt
  const st = STATUS_CONFIG[doc.status] || STATUS_CONFIG.processing

  return (
    <motion.div variants={item}
      className="group p-4 rounded-2xl flex items-center gap-4 transition-all hover:shadow-sm"
      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}
      whileHover={{ y: -1, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>

      {/* File icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: ft.bg }}>
        <FileText size={18} style={{ color: ft.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{doc.original_name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {(doc.file_size / 1024).toFixed(1)} KB
          {doc.chunk_count > 0 && ` · ${doc.chunk_count} chunks`}
          {' · '}{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Status badge */}
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
        style={{ background: st.bg, color: st.color }}>
        {doc.status === 'processing' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
        {doc.status === 'ready'      && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        {doc.status === 'failed'     && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
        {st.label}
      </span>

      {/* File type badge */}
      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase flex-shrink-0"
        style={{ background: ft.bg, color: ft.color }}>
        {ft.label}
      </span>

      {/* Actions — show on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button onClick={() => onReindex(doc.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          title="Rebuild embeddings"
          className="p-2 rounded-lg transition-colors text-gray-400 hover:text-violet-600"
          style={{ background: 'rgba(108,99,255,0)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(108,99,255,0)'}>
          <RotateCcw size={14} />
        </motion.button>
        <motion.button onClick={() => onDelete(doc.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          title="Delete"
          className="p-2 rounded-lg transition-colors text-gray-400 hover:text-red-500"
          style={{ background: 'rgba(239,68,68,0)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0)'}>
          <Trash2 size={14} />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function Documents() {
  const [docs,      setDocs]      = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging,  setDragging]  = useState(false)
  const [search,    setSearch]    = useState('')
  const [progress,  setProgress]  = useState(0)
  const fileRef = useRef()

  const load = () => {
    setLoading(true)
    api.get('/documents/')
      .then(r => { setDocs(r.data.documents); setFiltered(r.data.documents) })
      .catch(() => toast.error('Failed to load documents'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    if (!search.trim()) { setFiltered(docs); return }
    const q = search.toLowerCase()
    setFiltered(docs.filter(d => d.original_name.toLowerCase().includes(q) || d.file_type.includes(q)))
  }, [search, docs])

  const upload = async (files) => {
    const allowed = ['pdf', 'txt', 'docx', 'doc', 'md', 'csv', 'xlsx', 'xls']
    const valid = Array.from(files).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase()
      if (!allowed.includes(ext)) { toast.error(`${f.name}: unsupported format`); return false }
      if (f.size > 50 * 1024 * 1024) { toast.error(`${f.name}: exceeds 50MB`); return false }
      return true
    })
    if (!valid.length) return

    setUploading(true)
    let done = 0
    for (const file of valid) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        done++
        setProgress(Math.round(done / valid.length * 100))
        toast.success(`${file.name} uploaded`)
      } catch (err) {
        toast.error(err.response?.data?.detail || `Failed: ${file.name}`)
      }
    }
    setUploading(false)
    setProgress(0)
    load()
  }

  const deleteDoc = async (id) => {
    if (!window.confirm('Delete document? This removes its embeddings from the knowledge base.')) return
    try {
      await api.delete(`/documents/${id}`)
      toast.success('Document deleted')
      setDocs(d => d.filter(doc => doc.id !== id))
    } catch { toast.error('Delete failed') }
  }

  const reindexDoc = async (id) => {
    try {
      await api.post(`/documents/${id}/reindex`)
      toast.success('Re-indexing started')
      setDocs(d => d.map(doc => doc.id === id ? { ...doc, status: 'processing', chunk_count: 0 } : doc))
    } catch { toast.error('Re-index failed') }
  }

  const onDrop = e => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files) }

  const readyCount = docs.filter(d => d.status === 'ready').length
  const totalChunks = docs.reduce((s, d) => s + (d.chunk_count || 0), 0)

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Knowledge Base</h1>
            <p className="text-sm text-gray-500 mt-0.5">Your AI learns from these documents</p>
          </div>
          <button onClick={load} className="btn-ghost text-sm flex items-center gap-1.5">
            <RefreshCw size={14} /> Refresh
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Documents', value: docs.length,  icon: FileText,  color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
            { label: 'Ready',           value: readyCount,   icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Total Chunks',    value: totalChunks,  icon: Database,  color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card py-4 px-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}><Icon size={16} style={{ color }} /></div>
              <div>
                <p className="text-xl font-bold font-display" style={{ color }}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Upload zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className="relative mb-6 rounded-2xl p-10 text-center cursor-pointer transition-all duration-200"
          style={{
            border: dragging ? '2px solid #6C63FF' : '2px dashed #E5E7EB',
            background: dragging ? 'rgba(108,99,255,0.04)' : 'white',
          }}>
          <input ref={fileRef} type="file" multiple className="hidden"
            accept=".pdf,.txt,.docx,.doc,.md,.csv,.xlsx,.xls"
            onChange={e => upload(e.target.files)} />

          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: uploading ? 'rgba(108,99,255,0.1)' : 'rgba(108,99,255,0.08)' }}>
            {uploading
              ? <Loader2 size={24} style={{ color: '#6C63FF' }} className="animate-spin" />
              : <Upload size={24} style={{ color: '#6C63FF' }} />
            }
          </div>

          {uploading && progress > 0 && (
            <div className="mb-3">
              <div className="h-1.5 rounded-full overflow-hidden mx-auto max-w-xs"
                style={{ background: 'rgba(108,99,255,0.15)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6C63FF, #7C3AED)' }}
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{progress}% uploaded</p>
            </div>
          )}

          <p className="font-semibold text-gray-700">
            {uploading ? 'Processing documents…' : 'Drop files here or click to upload'}
          </p>
          <p className="text-sm text-gray-400 mt-1">PDF, DOCX, TXT, MD, CSV, XLSX · Max 50MB per file</p>
        </motion.div>

        {/* List */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(0,0,0,0.06)', background: 'white' }}>

          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="text-sm font-semibold text-gray-900 font-display">
              Documents{' '}
              <span className="text-gray-400 font-normal">({filtered.length})</span>
            </p>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-8 py-2 text-xs rounded-xl outline-none transition-all"
                style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', width: '200px', color: '#111827' }}
                placeholder="Search…" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-16 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(108,99,255,0.06)' }}>
                  <FileText size={24} style={{ color: '#6C63FF', opacity: 0.5 }} />
                </div>
                <p className="font-semibold text-gray-600 mb-1">
                  {search ? 'No documents match' : 'No documents yet'}
                </p>
                <p className="text-sm text-gray-400">
                  {search ? 'Try a different search term' : 'Upload your first document to get started'}
                </p>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show"
              className="p-3 space-y-2">
              {filtered.map(doc => (
                <DocCard key={doc.id} doc={doc} onDelete={deleteDoc} onReindex={reindexDoc} />
              ))}
            </motion.div>
          )}
        </div>

      </div>
    </Layout>
  )
}
