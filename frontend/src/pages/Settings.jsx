import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { User, Building2, Key, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success('Settings saved')
  }

  return (
    <Layout>
      <div className="p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and workspace</p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <User size={18} className="text-violet-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <input className="input" defaultValue={user?.full_name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input className="input" type="email" defaultValue={user?.email} disabled />
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Company */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <Building2 size={18} className="text-violet-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Workspace</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
                <input className="input" defaultValue={user?.company_name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Workspace Slug</label>
                <input className="input" defaultValue={user?.company_slug} disabled />
                <p className="text-xs text-gray-400 mt-1">Slug cannot be changed after creation</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <Key size={18} className="text-violet-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Security</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
                <input className="input" type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <input className="input" type="password" placeholder="Min 8 characters" />
              </div>
              <button className="btn-primary flex items-center gap-2">
                <Key size={16} /> Update Password
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="card bg-violet-50 dark:bg-violet-950 border-violet-100 dark:border-violet-900">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-violet-900 dark:text-violet-100">Account Info</p>
                <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                  Role: <strong>{user?.role}</strong> · Company ID: <strong>{user?.company_id}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
