import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  LayoutDashboard, BookOpen, Trophy, BarChart3,
  Settings, Users, Shield, User, LogOut, Zap
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', role: null },
  { to: '/exam', icon: BookOpen, label: 'Take Exam', role: null },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', role: null },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', role: 'admin' },
  { to: '/admin', icon: Settings, label: 'Manage Questions', role: 'admin' },
  { to: '/super-admin', icon: Shield, label: 'User Management', role: 'super_admin' },
  { to: '/profile', icon: User, label: 'Profile', role: null },
]

export default function Layout() {
  const { profile, signOut, isAdmin, isSuperAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const visibleNav = navItems.filter(item => {
    if (item.role === 'super_admin') return isSuperAdmin
    if (item.role === 'admin') return isAdmin
    return true
  })

  const roleBadgeClass = {
    student: 'badge-student',
    admin: 'badge-admin',
    super_admin: 'badge-super_admin',
  }[profile?.role] || 'badge-student'

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-800 border-r border-surface-600/50 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-surface-600/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">ExamPro</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-surface-700'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + sign out */}
        <div className="p-4 border-t border-surface-600/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-600/30 flex items-center justify-center text-primary-400 font-semibold text-sm">
              {profile?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</p>
              <span className={roleBadgeClass}>{profile?.role?.replace('_', ' ')}</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
