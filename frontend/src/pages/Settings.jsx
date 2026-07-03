import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../api/axios'
import { User, Building2, Key, Save, Loader2, Copy, Check, Code2, Globe, FileText, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

function Section({ icon: Icon, title, color, children }) {
  return (
    <motion.div variants={item} className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: color + '18' }}>
          <Icon size={15} style={{ color }} />
        </div>
        <h3 className="font-semibold font-display text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [saving,       setSaving]       = useState(false)
  const [savingCo,     setSavingCo]     = useState(false)
  const [savingPwd,    setSavingPwd]    = useState(false)
  const [copied,       setCopied]       = useState(false)
  const [embedConfig,  setEmbedConfig]  = useState(null)
  const [profile,      setProfile]      = useState({ full_name: user?.full_name || '' })
  const [company,      setCompany]      = useState({ name: '', description: '', website: '', logo_url: '' })
  const [passwords,    setPasswords]    = useState({ current: '', newPass: '' })

  useEffect(() => {
    api.get('/company/profile').then(r => setCompany({
      name: r.data.name || '', description: r.data.description || '',
      website: r.data.website || '', logo_url: r.data.logo_url || '',
    })).catch(() => {})
    api.get('/company/embed-config').then(r => setEmbedConfig(r.data)).catch(() => {})
  }, [])

  const saveProfile = async e => {
    e.preventDefault(); setSaving(true)
    try { await api.patch('/auth/me', { full_name: profile.full_name }); toast.success('Profile updated') }
    catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const saveCo = async e => {
    e.preventDefault(); setSavingCo(true)
    try { await api.patch('/company/profile', company); toast.success('Company updated') }
    catch { toast.error('Failed to update') }
    finally { setSavingCo(false) }
  }

  const changePassword = async e => {
    e.preventDefault()
    if (!passwords.current || !passwords.newPass) { toast.error('Fill in both fields'); return }
    setSavingPwd(true)
    try {
      await api.post('/auth/change-password', { current_password: passwords.current, new_password: passwords.newPass })
      toast.success('Password updated'); setPasswords({ current: '', newPass: '' })
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
    finally { setSavingPwd(false) }
  }

  const copyEmbed = text => {
    navigator.clipboard.writeText(text); setCopied(true)
    setTimeout(() => setCopied(false), 2000); toast.success('Copied!')
  }

  return (
    <Layout>
      <div className="p-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account and workspace configuration</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">

          {/* Profile */}
          <Section icon={User} title="Profile" color="#6C63FF">
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6C63FF, #7C3AED)' }}>
                  {user?.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role?.replace('_', ' ')} · {user?.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input className="input" value={profile.full_name}
                  onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input className="input" value={user?.email} disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 h-10">
                {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </Section>

          {/* Company */}
          <Section icon={Building2} title="Company Profile" color="#2563EB">
            <form onSubmit={saveCo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Company Name</label>
                <input className="input" value={company.name}
                  onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea className="input resize-none" rows={3} value={company.description}
                  placeholder="Describe what your company does for customers…"
                  onChange={e => setCompany(c => ({ ...c, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Website</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-9" value={company.website} placeholder="https://yourcompany.com"
                    onChange={e => setCompany(c => ({ ...c, website: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Logo URL</label>
                <input className="input" value={company.logo_url} placeholder="https://yourcompany.com/logo.png"
                  onChange={e => setCompany(c => ({ ...c, logo_url: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.1)' }}>
                <FileText size={13} style={{ color: '#6C63FF' }} />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Workspace URL</p>
                  <p className="text-sm font-mono font-semibold text-gray-800">resolveai.app/{user?.company_slug}</p>
                </div>
              </div>
              <button type="submit" disabled={savingCo} className="btn-primary flex items-center gap-2 h-10">
                {savingCo ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                {savingCo ? 'Saving…' : 'Save Company'}
              </button>
            </form>
          </Section>

          {/* Embed Code */}
          {embedConfig && (
            <Section icon={Code2} title="Chatbot Embed Code" color="#10B981">
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Add this snippet to any website to embed your AI chatbot. No coding required — customers chat without logging in.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Script Tag</p>
                  <div className="relative rounded-xl p-4" style={{ background: '#0F172A' }}>
                    <code className="text-xs text-emerald-400 break-all leading-relaxed">{embedConfig.script_tag}</code>
                    <button onClick={() => copyEmbed(embedConfig.script_tag)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Direct URL</p>
                  <div className="flex gap-2">
                    <input className="input font-mono text-xs flex-1"
                      value={`http://localhost:3000/chat/${embedConfig.slug}`} readOnly
                      style={{ cursor: 'text' }} />
                    <button onClick={() => copyEmbed(`http://localhost:3000/chat/${embedConfig.slug}`)}
                      className="btn-secondary px-3">
                      <Copy size={14} />
                    </button>
                    <a href={`/chat/${embedConfig.slug}`} target="_blank" rel="noreferrer"
                      className="btn-secondary px-3">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* Security */}
          <Section icon={Key} title="Security" color="#F59E0B">
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Current Password</label>
                <input className="input" type="password" value={passwords.current}
                  onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                <input className="input" type="password" value={passwords.newPass}
                  onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                  placeholder="Min 8 characters" />
              </div>
              <button type="submit" disabled={savingPwd} className="btn-primary flex items-center gap-2 h-10">
                {savingPwd ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Key size={15} />}
                {savingPwd ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </Section>

        </motion.div>
      </div>
    </Layout>
  )
}
