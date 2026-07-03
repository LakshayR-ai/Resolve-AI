import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, MessageSquare, FileText, BarChart3,
  Settings, LogOut, Sun, Moon, Bot, Shield, History,
  ChevronRight, Sparkles, Zap
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',     icon: LayoutDashboard, desc: 'Overview' },
  { to: '/chat',       label: 'Live Chat',      icon: MessageSquare,   desc: 'AI Assistant' },
  { to: '/history',    label: 'Chat History',   icon: History,          desc: 'Conversations' },
  { to: '/documents',  label: 'Knowledge Base', icon: FileText,         desc: 'Documents' },
  { to: '/analytics',  label: 'Analytics',      icon: BarChart3,        desc: 'Insights' },
  { to: '/settings',   label: 'Settings',       icon: Settings,         desc: 'Configure' },
]

const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  show:   { x: 0,   opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { x: -12, opacity: 0 },
  show:   { x: 0,   opacity: 1 }
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initial = user?.full_name?.[0]?.toUpperCase() || 'U'

  return (
    <motion.aside
      initial="hidden" animate="show" variants={sidebarVariants}
      className="w-[260px] flex-shrink-0 flex flex-col h-screen sticky top-0 z-40"
      style={{
        background: dark ? '#0F172A' : 'white',
        borderRight: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #7C3AED)' }}>
              <Bot size={18} className="text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm tracking-tight font-display">
              Resolve<span className="gradient-text">AI</span>
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[140px]">
              {user?.company_name || 'Workspace'}
            </p>
          </div>
        </motion.div>

        {/* Workspace pill */}
        <motion.div variants={itemVariants}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all"
          style={{ background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(108,99,255,0.06)', border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(108,99,255,0.12)' }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #7C3AED)' }}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.company_name}</p>
            <p className="text-[10px] text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-2">
        <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
          Navigation
        </p>

        {navItems.map(({ to, label, icon: Icon }, i) => (
          <motion.div key={to} variants={itemVariants}>
            <NavLink to={to}>
              {({ isActive }) => (
                <div className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer',
                  isActive
                    ? 'text-violet-700 dark:text-violet-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
                  style={isActive ? {
                    background: dark ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.08)',
                  } : {}}>
                  <div className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                    isActive
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  )}>
                    <Icon size={16} />
                  </div>
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  )}
                </div>
              )}
            </NavLink>
          </motion.div>
        ))}

        {user?.role === 'admin' && (
          <motion.div variants={itemVariants}>
            <NavLink to="/admin">
              {({ isActive }) => (
                <div className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                )}>
                  <Shield size={16} className="flex-shrink-0" />
                  Super Admin
                </div>
              )}
            </NavLink>
          </motion.div>
        )}

        {/* AI badge */}
        <motion.div variants={itemVariants} className="pt-4">
          <div className="mx-1 p-3 rounded-xl"
            style={{ background: dark ? 'rgba(108,99,255,0.08)' : 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-violet-500" />
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-400">AI Powered</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Gemini 2.5 Flash · RAG · ChromaDB
            </p>
          </div>
        </motion.div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4"
        style={{ borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
        {/* User row */}
        <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6C63FF, #7C3AED)' }}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.full_name}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5">
          <button onClick={toggle}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: dark ? '#94A3B8' : '#6B7280' }}>
            {dark ? <Sun size={13} /> : <Moon size={13} />}
            {dark ? 'Light' : 'Dark'}
          </button>
          <button onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
