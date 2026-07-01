import { useEffect, useState } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import { Building2, Users, MessageSquare, FileText, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').then(r => setStats(r.data)),
      api.get('/admin/companies').then(r => setCompanies(r.data.companies))
    ]).catch(() => toast.error('Failed to load admin data')).finally(() => setLoading(false))
  }, [])

  const toggle = async (id) => {
    try {
      const { data } = await api.patch(`/admin/companies/${id}/toggle`)
      setCompanies(cs => cs.map(c => c.id === id ? { ...c, is_active: data.is_active } : c))
      toast.success(`Company ${data.is_active ? 'activated' : 'deactivated'}`)
    } catch { toast.error('Failed to toggle company') }
  }

  if (loading) return <Layout><div className="flex items-center justify-center h-screen"><Loader2 size={32} className="animate-spin text-violet-600" /></div></Layout>

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Platform-wide overview</p>
        </div>

        {/* Platform stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Companies', value: stats?.total_companies, icon: Building2, color: 'bg-violet-500' },
            { label: 'Users', value: stats?.total_users, icon: Users, color: 'bg-blue-500' },
            { label: 'Documents', value: stats?.total_documents, icon: FileText, color: 'bg-emerald-500' },
            { label: 'Sessions', value: stats?.total_sessions, icon: MessageSquare, color: 'bg-amber-500' },
            { label: 'Messages', value: stats?.total_messages, icon: MessageSquare, color: 'bg-rose-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
                <Icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value ?? 0}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Companies table */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">All Companies</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Company', 'Slug', 'Users', 'Docs', 'Sessions', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {companies.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{c.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{c.user_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{c.document_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{c.chat_count}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${c.is_active ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggle(c.id)} className="text-gray-400 hover:text-violet-600 transition">
                        {c.is_active ? <ToggleRight size={22} className="text-violet-600" /> : <ToggleLeft size={22} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
