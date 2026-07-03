import { useEffect, useState } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import {
  Building2, Users, MessageSquare, FileText,
  ToggleLeft, ToggleRight, Loader2, TrendingUp,
  RefreshCw, Search, ExternalLink, Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value ?? 0}</p>
      </div>
    </div>
  )
}

export default function Admin() {
  const [stats,     setStats]     = useState(null)
  const [companies, setCompanies] = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/stats').then(r => setStats(r.data)),
      api.get('/admin/companies').then(r => { setCompanies(r.data.companies); setFiltered(r.data.companies) })
    ]).catch(() => toast.error('Failed to load admin data')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(companies); return }
    const q = search.toLowerCase()
    setFiltered(companies.filter(c => c.name.toLowerCase().includes(q) || c.slug.includes(q)))
  }, [search, companies])

  const toggle = async (id) => {
    try {
      const { data } = await api.patch(`/admin/companies/${id}/toggle`)
      setCompanies(cs => cs.map(c => c.id === id ? { ...c, is_active: data.is_active } : c))
      toast.success(`Company ${data.is_active ? 'activated' : 'deactivated'}`)
    } catch { toast.error('Failed to toggle company') }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={32} className="animate-spin text-violet-600" />
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={20} className="text-violet-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Platform-wide management and oversight</p>
          </div>
          <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Platform stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Building2}    label="Companies"  value={stats?.total_companies} color="bg-violet-500" />
          <StatCard icon={Users}        label="Users"       value={stats?.total_users}     color="bg-blue-500" />
          <StatCard icon={FileText}     label="Documents"  value={stats?.total_documents} color="bg-emerald-500" />
          <StatCard icon={MessageSquare} label="Sessions"  value={stats?.total_sessions}  color="bg-amber-500" />
          <StatCard icon={TrendingUp}   label="Messages"   value={stats?.total_messages}  color="bg-rose-500" />
        </div>

        {/* Companies table */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 gap-4">
            <h3 className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              All Companies
              <span className="text-gray-400 font-normal text-sm ml-2">({filtered.length})</span>
            </h3>
            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input pl-8 py-1.5 text-sm" placeholder="Search companies…" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No companies found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {['Company', 'Slug', 'Users', 'Docs', 'Chats', 'Status', 'Chatbot', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {c.name[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 font-mono">{c.slug}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{c.user_count}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{c.document_count}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{c.chat_count}</td>
                      <td className="px-5 py-4">
                        <span className={clsx('badge text-xs',
                          c.is_active
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400')}>
                          <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5 inline-block',
                            c.is_active ? 'bg-emerald-500' : 'bg-red-500')} />
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <a href={`/chat/${c.slug}`} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline">
                          View <ExternalLink size={11} />
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => toggle(c.id)}
                          title={c.is_active ? 'Deactivate company' : 'Activate company'}
                          className="text-gray-400 hover:text-violet-600 transition">
                          {c.is_active
                            ? <ToggleRight size={24} className="text-violet-600" />
                            : <ToggleLeft size={24} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Platform health note */}
        <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-100 dark:border-violet-900">
          <div className="flex items-start gap-3">
            <Shield size={16} className="text-violet-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-violet-900 dark:text-violet-100">Platform Security</p>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
                Each company has fully isolated vector stores and document storage.
                Deactivating a company immediately blocks access to their chatbot and API endpoints.
              </p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}
