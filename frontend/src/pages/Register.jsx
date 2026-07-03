import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Bot, User, Mail, Lock, Building2, ArrowRight, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

const perks = [
  'Free 14-day trial, no credit card',
  'Deploy your AI chatbot in under 5 minutes',
  'Upload PDF, DOCX, TXT, CSV and more',
]

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', company_name: '', company_slug: '' })

  const handle = e => {
    const { name, value } = e.target
    setForm(f => {
      const u = { ...f, [name]: value }
      if (name === 'company_name')
        u.company_slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return u
    })
  }

  const submit = async e => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    const r = await register(form)
    if (r.success) { toast.success('Workspace created!'); navigate('/dashboard') }
    else toast.error(r.error)
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0F172A' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(108,99,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(124,58,237,0.12) 0%, transparent 60%)' }} />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #7C3AED)' }}>
              <Bot size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg font-display">ResolveAI</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-3xl font-bold text-white mb-4 font-display leading-tight">
            Your AI Support Team<br />starts here.
          </h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Join companies using ResolveAI to automate customer support and reduce response time by 80%.
          </p>
          <div className="space-y-3">
            {perks.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                {p}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="text-slate-600 text-xs">
          © 2025 ResolveAI
        </motion.p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto"
        style={{ background: '#F8FAFC' }}>
        <motion.div className="w-full max-w-md py-8" variants={container} initial="hidden" animate="show">

          <motion.div variants={fadeUp}>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 font-display">Create your workspace</h2>
            <p className="text-gray-500 text-sm mb-7">Set up your AI customer support platform</p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={submit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="full_name" value={form.full_name} onChange={handle}
                  className="input pl-10" placeholder="Jane Smith" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Work Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="email" type="email" value={form.email} onChange={handle}
                  className="input pl-10" placeholder="jane@company.com" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="password" type="password" value={form.password} onChange={handle}
                  className="input pl-10" placeholder="Min 8 characters" required />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Company Name</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="company_name" value={form.company_name} onChange={handle}
                  className="input pl-10" placeholder="Acme Corp" required />
              </div>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Workspace URL</label>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all bg-white">
                <span className="px-3 flex items-center text-sm text-gray-400 bg-gray-50 border-r border-gray-200 whitespace-nowrap">
                  resolveai.app/
                </span>
                <input name="company_slug" value={form.company_slug} onChange={handle}
                  className="flex-1 px-3 py-2.5 text-sm outline-none bg-white text-gray-900"
                  placeholder="acme-corp" required pattern="[a-z0-9-]+" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">Lowercase letters, numbers, and hyphens only</p>
            </div>

            <motion.button type="submit" disabled={loading}
              className="btn-primary w-full h-11 mt-1"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating…</span>
                : <span className="flex items-center gap-2">Create Workspace <ArrowRight size={16} /></span>
              }
            </motion.button>
          </motion.form>

          <motion.p variants={fadeUp} className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">Sign in →</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
