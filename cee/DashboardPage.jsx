import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { analytics, attempts } from '../lib/supabase'
import { BookOpen, Trophy, Flame, Star, TrendingUp, Clock, ChevronRight, Award } from 'lucide-react'
import { format } from 'date-fns'

function StatCard({ icon: Icon, label, value, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-600/20 text-primary-400 border-primary-600/20',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
    green: 'bg-green-500/20 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
  }
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-display font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [recentAttempts, setRecentAttempts] = useState([])
  const [stats, setStats] = useState({ total: 0, avg: 0, best: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const { data: myAttempts } = await analytics.getUserStats(user.id)
      if (myAttempts && myAttempts.length > 0) {
        const percentages = myAttempts.map(a => a.total > 0 ? (a.score / a.total) * 100 : 0)
        setStats({
          total: myAttempts.length,
          avg: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
          best: Math.round(Math.max(...percentages)),
        })
        setRecentAttempts(myAttempts.slice(-5).reverse())
      }
      setLoading(false)
    }
    fetchData()
  }, [user])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const badgeColors = {
    'Beginner': 'text-gray-400',
    'Consistent': 'text-blue-400',
    'Scholar': 'text-purple-400',
    'Champion': 'text-yellow-400',
    'Legend': 'text-orange-400',
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            {greeting()}, {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-gray-400 mt-1">Ready to sharpen your skills today?</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-700 border border-surface-500 rounded-xl px-4 py-2">
          <Flame size={18} className="text-orange-400" />
          <span className="font-display font-bold text-white">{profile?.streak || 0}</span>
          <span className="text-gray-400 text-sm">day streak</span>
        </div>
      </div>

      {/* Badge */}
      <div className="card border-primary-600/20 bg-gradient-to-r from-primary-600/10 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-600/20 border border-primary-600/30 flex items-center justify-center">
            <Award size={28} className={badgeColors[profile?.badge] || 'text-gray-400'} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Your rank</p>
            <p className={`text-2xl font-display font-bold ${badgeColors[profile?.badge] || 'text-white'}`}>
              {profile?.badge || 'Beginner'}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {profile?.streak >= 7 ? 'Keep it up!' : `${7 - (profile?.streak || 0)} more days to reach Scholar`}
            </p>
          </div>
          <div className="ml-auto">
            <Link to="/exam" className="btn-primary">
              <BookOpen size={16} />
              Take Exam
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Exams" value={stats.total} color="primary" />
        <StatCard icon={TrendingUp} label="Avg Score" value={`${stats.avg}%`} color="green" />
        <StatCard icon={Star} label="Best Score" value={`${stats.best}%`} color="orange" />
        <StatCard icon={Flame} label="Day Streak" value={profile?.streak || 0} color="purple" />
      </div>

      {/* Recent Attempts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Attempts */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">Recent Attempts</h2>
            <Link to="/exam" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
              Start new <ChevronRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-14 bg-surface-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentAttempts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
              <p>No attempts yet. Take your first exam!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAttempts.map((attempt, i) => {
                const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0
                return (
                  <div key={i} className="flex items-center gap-4 p-3 bg-surface-700 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
                      ${pct >= 80 ? 'bg-green-500/20 text-green-400' : pct >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                      {pct}%
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{attempt.subject} — {attempt.chapter || ''}</p>
                      <p className="text-xs text-gray-500">{attempt.score}/{attempt.total} correct</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} />
                      {format(new Date(attempt.created_at), 'MMM d')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { to: '/exam', icon: BookOpen, label: 'Start Exam', desc: 'Take a timed quiz', color: 'text-primary-400' },
              { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', desc: 'See top performers', color: 'text-yellow-400' },
              { to: '/profile', icon: Star, label: 'My Profile', desc: 'View your progress', color: 'text-purple-400' },
            ].map(({ to, icon: Icon, label, desc, color }) => (
              <Link key={to} to={to} className="flex items-center gap-3 p-3 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors group">
                <Icon size={18} className={color} />
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <ChevronRight size={14} className="ml-auto text-gray-600 group-hover:text-gray-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
