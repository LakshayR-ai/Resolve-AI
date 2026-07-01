import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import { Upload, Trash2, FileText, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_STYLES = {
  ready: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  processing: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  failed: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
}

const STATUS_ICONS = {
  ready: CheckCircle,
  processing: Loader2,
  failed: AlertCircle,
}

function DocRow({ doc, onDelete }) {
  const Icon = STATUS_ICONS[doc.status] || FileText
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition group">
      <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950 rounded-lg flex items-center justify-center flex-shrink-0">
        <FileText size={18} className="text-violet-600 dark:text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.original_name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {(doc.file_size / 1024).toFixed(1)} KB • {doc.chunk_count} chunks • {new Date(doc.created_at).toLocaleDateString()}
        </p>
      </div>
      <span className={clsx('badge', STATUS_STYLES[doc.status] || 'bg-gray-100 text-gray-600')}>
        <Icon size={11} className={clsx('mr-1', doc.status === 'processing' && 'animate-spin')} />
        {doc.status}
      </span>
      <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-[10px]">
        {doc.file_type}
      </span>
      <button onClick={() => onDelete(doc.id)}
        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition">
        <Trash2 size={16} />
      </button>
    </div>
  )
}

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const load = () => {
    setLoading(true)
    api.get('/documents/').then(r => setDocs(r.data.documents)).catch(() => toast.error('Failed to load documents')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const upload = async (files) => {
    const allowed = ['pdf', 'txt', 'docx', 'doc', 'md']
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!allowed.includes(ext)) { toast.error(`${file.name}: unsupported format`); continue }
      if (file.size > 50 * 1024 * 1024) { toast.error(`${file.name}: max 50MB`); continue }

      setUploading(true)
      const fd = new FormData()
      fd.append('file', file)
      try {
        await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success(`${file.name} uploaded — processing...`)
      } catch (err) {
        toast.error(`Failed to upload ${file.name}: ${err.response?.data?.detail || 'Unknown error'}`)
      } finally {
        setUploading(false)
      }
    }
    load()
  }

  const deleteDoc = async (id) => {
    if (!confirm('Delete this document? This will also remove its embeddings.')) return
    try {
      await api.delete(`/documents/${id}`)
      toast.success('Document deleted')
      setDocs(d => d.filter(doc => doc.id !== id))
    } catch {
      toast.error('Failed to delete document')
    }
  }

  const onDrop = (e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files) }

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Upload documents to train your AI assistant</p>
          </div>
          <button onClick={load} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition mb-8',
            dragging
              ? 'border-violet-400 bg-violet-50 dark:bg-violet-950'
              : 'border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/30'
          )}
        >
          <input ref={fileRef} type="file" multiple className="hidden" accept=".pdf,.txt,.docx,.doc,.md"
            onChange={e => upload(e.target.files)} />
          <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {uploading ? <Loader2 size={24} className="text-violet-600 animate-spin" /> : <Upload size={24} className="text-violet-600" />}
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
            {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">PDF, TXT, DOCX, MD • Max 50MB per file</p>
        </div>

        {/* Documents List */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Documents</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{docs.length} files</span>
          </div>
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 size={24} className="animate-spin text-violet-600" />
            </div>
          ) : docs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No documents yet. Upload your first file.</p>
            </div>
          ) : (
            <div className="p-2">
              {docs.map(doc => <DocRow key={doc.id} doc={doc} onDelete={deleteDoc} />)}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
