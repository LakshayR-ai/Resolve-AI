import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'
import { User, Building2, Key, Save, Loader2, Copy, Check, Code2, Globe, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, login } = useAuth()
  const [saving, setSaving] = useState(false)
  const [savingCompany, setSavingCompany] = useState(false)
  const [copied, setCopied] = useState(false)
  const [embedConfig, setEmbedConfig] = useState(null)
  const [profile, setProfile] = useState({ full_name: user?.full_name || '' })
  const [company, setCompany] = useState({ name: '', description: '', website: '', logo_url: '' })

  useEffect(() => {
    api.get('/company/profile').then(r => {
      setCompany({
        name: r.data.name || '',
        description: r.data.description || '',
        website: r.data.website || '',
        logo_url: r.data.logo_url || '',
      })
    }).catch(() => {})

    api.get('/company/embed-config').then(r => setEmbedConfig(r.data)).catch(() => {})
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/auth/me', { full_name: profile.full_name })
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const saveCompany = async (e) => {
    e.preventDefault()
    setSavingCompany(true)
    try {
      await api.patch('/company/profile', company)
      toast.success('Company profile updated')
    } catch {
      toast.error('Failed to update company')
    } finally {
      setSavingCompany(false)
    }
  }

  const copyEmbed = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and workspace</p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center">
                <User size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
            </div>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <input className="input" value={profile.full_name}
                  onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input className="input" type="email" value={user?.email} disabled />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-lg">
                  {user?.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Company */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Company Profile</h3>
            </div>
            <form onSubmit={saveCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
                <input className="input" value={company.name}
                  onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea className="input resize-none" rows={3} value={company.description}
                  placeholder="Tell customers what your company does..."
                  onChange={e => setCompany(c => ({ ...c, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-8" value={company.website} placeholder="https://yourcompany.com"
                    onChange={e => setCompany(c => ({ ...c, website: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Logo URL</label>
                <input className="input" value={company.logo_url} placeholder="https://yourcompany.com/logo.png"
                  onChange={e => setCompany(c => ({ ...c, logo_url: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <FileText size={14} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Workspace Slug</p>
                  <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{user?.company_slug}</p>
                </div>
              </div>
              <button type="submit" disabled={savingCompany} className="btn-primary flex items-center gap-2">
                {savingCompany ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {savingCompany ? 'Saving...' : 'Save Company'}
              </button>
            </form>
          </div>

          {/* Embed Code */}
          {embedConfig && (
            <div className="card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                  <Code2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Chatbot Embed Code</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Add this snippet to any website to embed your AI chatbot. Customers can chat without creating an account.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Script Tag</p>
                  <div className="relative bg-gray-900 rounded-xl p-4">
                    <code className="text-xs text-emerald-400 break-all">{embedConfig.script_tag}</code>
                    <button onClick={() => copyEmbed(embedConfig.script_tag)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition">
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Direct Chat URL</p>
                  <div className="flex items-center gap-2">
                    <input className="input font-mono text-sm flex-1" value={`http://localhost:3000/chat/${embedConfig.slug}`} readOnly />
                    <button onClick={() => copyEmbed(`http://localhost:3000/chat/${embedConfig.slug}`)}
                      className="btn-secondary px-3">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                <Key size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Security</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <input className="input" type="password" placeholder="Min 8 characters" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                <input className="input" type="password" placeholder="Repeat password" />
              </div>
              <button className="btn-primary flex items-center gap-2">
                <Key size={16} /> Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
