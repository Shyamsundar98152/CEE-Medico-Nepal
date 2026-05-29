import { useState, useEffect } from 'react'
import { analytics, attempts } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { TrendingUp, Users, BookOpen, Star, Target } from 'lucide-react'
import { format } from 'date-fns'

const CHART_COLORS = ['#6272f1', '#fb923c', '#34d399', '#a78bfa', '#fb7185']

function StatBanner({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-sm">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [allAttempts, setAllAttempts] = useState([])
  const [userStats, setUserStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: sum }, { data: all }, { data: mine }] = await Promise.all([
        analytics.getSummary(),
        attempts.getAll(200),
        analytics.getUserStats(user.id),
      ])
      setSummary(sum)
      setAllAttempts(all || [])

      // Build chart data from user's attempts
      if (mine) {
        const byDate = {}
        mine.forEach(a => {
          const d = format(new Date(a.created_at), 'MMM d')
          if (!byDate[d]) byDate[d] = { date: d, attempts: 0, total_score: 0, total_q: 0 }
          byDate[d].attempts++
          byDate[d].total_score += a.score
          byDate[d].total_q += a.total
        })
        setUserStats(Object.values(byDate).map(d => ({
          ...d,
          avg_pct: d.total_q > 0 ? Math.round((d.total_score / d.total_q) * 100) : 0,
        })))
      }
      setLoading(false)
    }
    fetchAll()
  }, [user])

  // Subject distribution
  const subjectData = allAttempts.reduce((acc, a) => {
    acc[a.subject] = (acc[a.subject] || 0) + 1
    return acc
  }, {})
  const subjectChart = Object.entries(subjectData).map(([name, value]) => ({ name, value }))

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-surface-700 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface-700 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Platform-wide performance insights</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBanner icon={Users} label="Active Users" value={summary?.active_users || 0} color="bg-primary-600/20 text-primary-400" />
        <StatBanner icon={BookOpen} label="Total Attempts" value={summary?.total_attempts || 0} color="bg-orange-500/20 text-orange-400" />
        <StatBanner icon={TrendingUp} label="Avg Score" value={`${Math.round(summary?.avg_score_pct || 0)}%`} color="bg-green-500/20 text-green-400" />
        <StatBanner icon={Star} label="Highest Score" value={summary?.highest_score || 0} color="bg-purple-500/20 text-purple-400" />
      </div>

      {/* User performance over time */}
      {userStats.length > 0 && (
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-6">Your Performance Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userStats}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6272f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6272f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="avg_pct" name="Avg %" stroke="#6272f1" fill="url(#grad1)" strokeWidth={2} dot={{ fill: '#6272f1', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject distribution */}
      {subjectChart.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-display font-semibold text-white mb-6">Attempts by Subject</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjectChart}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Attempts" radius={[4, 4, 0, 0]}>
                  {subjectChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent activity table */}
          <div className="card">
            <h2 className="font-display font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {allAttempts.slice(0, 10).map((a, i) => {
                const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${pct >= 70 ? 'bg-green-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                    <span className="text-gray-300 flex-1 truncate">{a.profiles?.full_name || 'User'}</span>
                    <span className="text-gray-500 text-xs">{a.subject}</span>
                    <span className={`font-mono font-bold text-xs ${pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
