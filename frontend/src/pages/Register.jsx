import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bot, User, Mail, Lock, Building2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', company_name: '', company_slug: ''
  })

  const handle = (e) => {
    const { name, value } = e.target
    setForm(f => {
      const updated = { ...f, [name]: value }
      if (name === 'company_name') {
        updated.company_slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      }
      return updated
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    const result = await register(form)
    if (result.success) {
      toast.success('Workspace created!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-violet-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
            <Bot size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Workspace</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set up your AI support platform</p>
        </div>

        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="full_name" value={form.full_name} onChange={handle} className="input pl-9"
                  placeholder="Jane Smith" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="email" type="email" value={form.email} onChange={handle} className="input pl-9"
                  placeholder="jane@company.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="password" type="password" value={form.password} onChange={handle} className="input pl-9"
                  placeholder="Min 8 characters" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="company_name" value={form.company_name} onChange={handle} className="input pl-9"
                  placeholder="Acme Corp" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Workspace Slug</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">resolveai.app/</span>
                <input name="company_slug" value={form.company_slug} onChange={handle}
                  className="input pl-28" placeholder="acme-corp" required
                  pattern="[a-z0-9-]+" title="Lowercase letters, numbers, hyphens only" />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Lowercase letters, numbers, and hyphens only</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Creating workspace...' : 'Create Workspace'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
