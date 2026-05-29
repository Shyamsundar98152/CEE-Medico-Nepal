import { useState, useEffect } from 'react'
import { profiles } from '../lib/supabase'
import { Shield, User, ChevronDown, Search, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

const ROLES = ['student', 'admin', 'super_admin']
const ROLE_LABELS = { student: 'Student', admin: 'Admin', super_admin: 'Super Admin' }

function RoleSelector({ current, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors',
          current === 'super_admin' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
          current === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
          'bg-blue-500/20 text-blue-400 border-blue-500/30',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {ROLE_LABELS[current]}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-surface-700 border border-surface-500 rounded-xl shadow-xl z-10 min-w-36 overflow-hidden">
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => { onChange(r); setOpen(false) }}
              className={clsx(
                'w-full text-left px-4 py-2.5 text-sm hover:bg-surface-600 transition-colors',
                r === current ? 'text-primary-400' : 'text-gray-300'
              )}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SuperAdminPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [updating, setUpdating] = useState(null)
  const [confirm, setConfirm] = useState(null) // { userId, role }

  useEffect(() => {
    profiles.getAll().then(({ data }) => {
      setUsers(data || [])
      setLoading(false)
    })
  }, [])

  const handleRoleChange = async (userId, role) => {
    setConfirm({ userId, role })
  }

  const confirmRoleChange = async () => {
    if (!confirm) return
    setUpdating(confirm.userId)
    const { data, error } = await profiles.updateRole(confirm.userId, confirm.role)
    if (!error && data) {
      setUsers(prev => prev.map(u => u.id === confirm.userId ? { ...u, role: confirm.role } : u))
    }
    setUpdating(null)
    setConfirm(null)
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    admins: users.filter(u => u.role === 'admin').length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          <Shield size={28} className="text-orange-400" /> User Management
        </h1>
        <p className="text-gray-400 mt-1">Manage roles and permissions for all users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-white' },
          { label: 'Students', value: stats.students, color: 'text-blue-400' },
          { label: 'Admins', value: stats.admins, color: 'text-purple-400' },
          { label: 'Super Admins', value: stats.superAdmins, color: 'text-orange-400' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <User size={18} className={s.color} />
            <div>
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
        <AlertTriangle size={18} className="text-orange-400 mt-0.5 shrink-0" />
        <p className="text-orange-300 text-sm">
          Role changes take effect immediately. Promoting a user to <strong>Super Admin</strong> grants full platform access including user management.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-field pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-600">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Joined</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Last Active</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Streak</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="py-4">
                      <div className="h-8 bg-surface-700 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-surface-700/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                        u.role === 'super_admin' ? 'bg-orange-500/20 text-orange-400' :
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                      )}>
                        {u.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.full_name || 'No name'}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-400">
                    {u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="py-4 text-sm text-gray-400">
                    {u.last_active || '—'}
                  </td>
                  <td className="py-4">
                    <span className="text-sm text-orange-400 font-mono">{u.streak || 0}🔥</span>
                  </td>
                  <td className="py-4 text-right">
                    {updating === u.id ? (
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin ml-auto" />
                    ) : (
                      <RoleSelector current={u.role} onChange={(role) => handleRoleChange(u.id, role)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500">No users found</div>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-display font-bold text-white mb-2">Confirm Role Change</h3>
            <p className="text-gray-400 text-sm mb-4">
              Change this user's role to <strong className="text-white">{ROLE_LABELS[confirm.role]}</strong>?
              {confirm.role === 'super_admin' && ' This grants full admin access.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={confirmRoleChange} className="btn-primary flex-1 justify-center">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
