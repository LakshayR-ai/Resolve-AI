import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard, MessageSquare, FileText, BarChart3,
  Settings, LogOut, Sun, Moon, Bot, Shield
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/documents', label: 'Knowledge Base', icon: FileText },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">Resolve AI</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[130px]">
              {user?.company_name || 'Workspace'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )
            }
          >
            <Shield size={18} />
            Admin Panel
          </NavLink>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 text-xs font-bold">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggle} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Light' : 'Dark'}
          </button>
          <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
