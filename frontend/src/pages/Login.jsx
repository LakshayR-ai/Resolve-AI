import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Bot, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    const r = await login(form.email, form.password)
    if (r.success) { toast.success('Welcome back!'); navigate('/dashboard') }
    else toast.error(r.error)
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0F172A' }}>
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6C63FF, transparent)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #7C3AED)' }}>
              <Bot size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg font-display tracking-tight">ResolveAI</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.3)' }}>
            <Sparkles size={13} className="text-violet-400" />
            <span className="text-xs text-violet-300 font-medium">Powered by Gemini 2.5 Flash</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4 font-display">
            Build AI Support<br />
            <span style={{ background: 'linear-gradient(135deg, #6C63FF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Agents in Minutes
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Upload your documents, configure your AI assistant, and deploy it on your website — no coding required.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: '📄', text: 'Upload any document format' },
              { icon: '🤖', text: 'RAG-powered accurate responses' },
              { icon: '📊', text: 'Real-time analytics & insights' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 text-slate-300 text-sm">
                <span className="text-base">{item.icon}</span>
                {item.text}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="text-slate-600 text-xs">
          © 2025 ResolveAI · Built for modern businesses
        </motion.p>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center p-6"
        style={{ background: '#F8FAFC' }}>
        <motion.div className="w-full max-w-md" variants={container} initial="hidden" animate="show">

          {/* Mobile logo */}
          <motion.div variants={fadeUp} className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #7C3AED)' }}>
              <Bot size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 font-display">ResolveAI</span>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 font-display">Sign in</h2>
            <p className="text-gray-500 text-sm mb-8">Welcome back to your workspace</p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="email" type="email" value={form.email} onChange={handle}
                  className="input pl-10" placeholder="you@company.com" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handle}
                  className="input pl-10 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              className="btn-primary w-full h-11 mt-2"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</span>
                : <span className="flex items-center gap-2">Sign In <ArrowRight size={16} /></span>
              }
            </motion.button>
          </motion.form>

          <motion.p variants={fadeUp} className="text-center text-sm text-gray-500 mt-6">
            No account yet?{' '}
            <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              Create workspace →
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
