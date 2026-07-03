import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import {
  Upload, Trash2, FileText, CheckCircle, AlertCircle,
  Loader2, RefreshCw, RotateCcw, Search, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_STYLES = {
  ready:      'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  processing: 'bg-amber-50  dark:bg-amber-950  text-amber-600  dark:text-amber-400',
  failed:     'bg-red-50    dark:bg-red-950    text-red-600    dark:text-red-400',
}

const TYPE_COLORS = {
  pdf:  'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
  docx: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
  doc:  'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
  txt:  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
  md:   'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
  csv:  'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
  xlsx: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300',
  xls:  'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300',
}

function DocRow({ doc, onDelete, onReindex }) {
  const StatusIcon = doc.status === 'ready' ? CheckCircle : doc.status === 'processing' ? Loader2 : AlertCircle
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition group">
      <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950 rounded-lg flex items-center justify-center flex-shrink-0">
        <FileText size={18} className="text-violet-600 dark:text-violet-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.original_name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {(doc.file_size / 1024).toFixed(1)} KB
          {doc.chunk_count > 0 && ` · ${doc.chunk_count} chunks`}
          {' · '}{new Date(doc.created_at).toLocaleDateString()}
        </p>
      </div>

      <span className={clsx('badge', STATUS_STYLES[doc.status] || 'bg-gray-100 text-gray-600')}>
        <StatusIcon size={11} className={clsx('mr-1', doc.status === 'processing' && 'animate-spin')} />
        {doc.status}
      </span>

      <span className={clsx('badge uppercase text-[10px] font-bold', TYPE_COLORS[doc.file_type] || 'bg-gray-100 text-gray-600')}>
        {doc.file_type}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button onClick={() => onReindex(doc.id)}
          title="Rebuild embeddings"
          className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950 transition">
          <RotateCcw size={15} />
        </button>
        <button onClick={() => onDelete(doc.id)}
          title="Delete document"
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

export default function Documents() {
  const [docs,      setDocs]      = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging,  setDragging]  = useState(false)
  const [search,    setSearch]    = useState('')
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
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!allowed.includes(ext)) { toast.error(`${file.name}: unsupported format`); continue }
      if (file.size > 50 * 1024 * 1024) { toast.error(`${file.name}: exceeds 50MB limit`); continue }

      setUploading(true)
      const fd = new FormData()
      fd.append('file', file)
      try {
        await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success(`${file.name} uploaded — generating embeddings...`)
      } catch (err) {
        toast.error(err.response?.data?.detail || `Failed to upload ${file.name}`)
      } finally {
        setUploading(false)
      }
    }
    load()
  }

  const deleteDoc = async (id) => {
    if (!window.confirm('Delete this document? This also removes its embeddings from the knowledge base.')) return
    try {
      await api.delete(`/documents/${id}`)
      toast.success('Document deleted')
      setDocs(d => d.filter(doc => doc.id !== id))
    } catch { toast.error('Failed to delete document') }
  }

  const reindexDoc = async (id) => {
    try {
      await api.post(`/documents/${id}/reindex`)
      toast.success('Re-indexing started — embeddings will be rebuilt shortly')
      setDocs(d => d.map(doc => doc.id === id ? { ...doc, status: 'processing', chunk_count: 0 } : doc))
    } catch { toast.error('Failed to start re-indexing') }
  }

  const onDrop = (e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files) }

  const readyCount = docs.filter(d => d.status === 'ready').length
  const totalChunks = docs.reduce((s, d) => s + (d.chunk_count || 0), 0)

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Upload documents to power your AI assistant
            </p>
          </div>
          <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Documents', value: docs.length,  color: 'text-violet-600' },
            { label: 'Ready',           value: readyCount,   color: 'text-emerald-600' },
            { label: 'Total Chunks',    value: totalChunks,  color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card py-3 px-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition mb-6',
            dragging
              ? 'border-violet-400 bg-violet-50 dark:bg-violet-950'
              : 'border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:bg-violet-50/30 dark:hover:bg-violet-950/20'
          )}
        >
          <input ref={fileRef} type="file" multiple className="hidden"
            accept=".pdf,.txt,.docx,.doc,.md,.csv,.xlsx,.xls"
            onChange={e => upload(e.target.files)} />
          <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {uploading
              ? <Loader2 size={24} className="text-violet-600 animate-spin" />
              : <Upload size={24} className="text-violet-600" />
            }
          </div>
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
            {uploading ? 'Uploading and processing...' : 'Drop files here or click to upload'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            PDF, DOCX, TXT, MD, CSV, XLSX · Max 50MB per file
          </p>
        </div>

        {/* Search + list */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 gap-4">
            <h3 className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              Documents <span className="text-gray-400 font-normal text-sm">({filtered.length})</span>
            </h3>
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input pl-8 py-1.5 text-sm" placeholder="Search documents..." />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-10 flex justify-center">
              <Loader2 size={24} className="animate-spin text-violet-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-14 text-center">
              <FileText size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {search ? 'No documents match your search.' : 'No documents yet. Upload your first file above.'}
              </p>
            </div>
          ) : (
            <div className="p-2 divide-y divide-gray-50 dark:divide-gray-800/50">
              {filtered.map(doc => (
                <DocRow key={doc.id} doc={doc} onDelete={deleteDoc} onReindex={reindexDoc} />
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}
