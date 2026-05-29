import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { profiles, analytics } from '../lib/supabase'
import { User, Flame, Award, Target, Save, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

const BADGE_META = {
  Beginner: { emoji: '🌱', color: 'text-gray-400', next: 'Consistent (3-day streak)' },
  Consistent: { emoji: '⭐', color: 'text-blue-400', next: 'Scholar (7-day streak)' },
  Scholar: { emoji: '📚', color: 'text-purple-400', next: 'Champion (14-day streak)' },
  Champion: { emoji: '🏆', color: 'text-yellow-400', next: 'Legend (30-day streak)' },
  Legend: { emoji: '🔥', color: 'text-orange-400', next: 'You are at the top!' },
}

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ total: 0, avg: 0, best: 0, subjects: [] })

  useEffect(() => {
    setName(profile?.full_name || '')
  }, [profile])

  useEffect(() => {
    if (!user) return
    analytics.getUserStats(user.id).then(({ data }) => {
      if (data?.length) {
        const pcts = data.map(a => a.total > 0 ? (a.score / a.total) * 100 : 0)
        const subjects = [...new Set(data.map(a => a.subject))]
        setStats({
          total: data.length,
          avg: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
          best: Math.round(Math.max(...pcts)),
          subjects,
        })
      }
    })
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    await profiles.update(user.id, { full_name: name })
    await refreshProfile()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  const badge = profile?.badge || 'Beginner'
  const badgeMeta = BADGE_META[badge] || BADGE_META.Beginner

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
      <h1 className="text-3xl font-display font-bold text-white">My Profile</h1>

      {/* Avatar + badge */}
      <div className="card text-center py-10">
        <div className="w-20 h-20 rounded-full bg-primary-600/30 border-2 border-primary-600/40 flex items-center justify-center text-3xl font-display font-bold text-primary-300 mx-auto mb-4">
          {profile?.full_name?.[0]?.toUpperCase() || '?'}
        </div>
        <h2 className="text-xl font-display font-bold text-white">{profile?.full_name || 'Anonymous'}</h2>
        <p className="text-gray-500 text-sm">{profile?.email}</p>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="text-center">
            <div className="text-2xl">{badgeMeta.emoji}</div>
            <p className={`text-sm font-medium ${badgeMeta.color}`}>{badge}</p>
            <p className="text-xs text-gray-600">Rank</p>
          </div>
          <div className="w-px h-12 bg-surface-600" />
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-orange-400">{profile?.streak || 0}</div>
            <p className="text-sm text-orange-400">Streak</p>
            <p className="text-xs text-gray-600">Days</p>
          </div>
          <div className="w-px h-12 bg-surface-600" />
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-green-400">{stats.avg}%</div>
            <p className="text-sm text-green-400">Avg Score</p>
            <p className="text-xs text-gray-600">All time</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-4">{badgeMeta.next}</p>
      </div>

      {/* Edit name */}
      <div className="card space-y-4">
        <h2 className="font-display font-semibold text-white">Edit Profile</h2>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
          <input
            className="input-field"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Email</label>
          <input className="input-field opacity-50" value={profile?.email || ''} disabled />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Role</label>
          <input className="input-field opacity-50 capitalize" value={profile?.role?.replace('_', ' ') || ''} disabled />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}</>}
        </button>
      </div>

      {/* Stats */}
      <div className="card">
        <h2 className="font-display font-semibold text-white mb-4">Statistics</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Total Exams', value: stats.total, icon: Target },
            { label: 'Best Score', value: `${stats.best}%`, icon: Award },
            { label: 'Avg Score', value: `${stats.avg}%`, icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-surface-700 rounded-xl p-4 text-center">
              <Icon size={18} className="text-primary-400 mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {stats.subjects.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Subjects studied</p>
            <div className="flex flex-wrap gap-2">
              {stats.subjects.map(s => (
                <span key={s} className="px-3 py-1 bg-primary-600/20 text-primary-400 border border-primary-600/20 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="card">
        <h2 className="font-display font-semibold text-white mb-4">Account Info</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Member since</span>
            <span className="text-gray-300">{user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Last active</span>
            <span className="text-gray-300">{profile?.last_active || 'Today'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">User ID</span>
            <span className="text-gray-600 font-mono text-xs">{user?.id?.slice(0, 8)}...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
