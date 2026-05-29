import { useLeaderboard } from '../hooks/useLeaderboard'
import { useAuth } from '../hooks/useAuth'
import { Trophy, Flame, Target, TrendingUp, RefreshCw, Wifi } from 'lucide-react'
import clsx from 'clsx'

const BADGE_EMOJI = {
  Legend: '🔥',
  Champion: '🏆',
  Scholar: '📚',
  Consistent: '⭐',
  Beginner: '🌱',
}

const RANK_STYLE = {
  0: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  1: 'text-gray-300 bg-gray-300/10 border-gray-300/30',
  2: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
}

export default function LeaderboardPage() {
  const { data, loading, error, refetch } = useLeaderboard()
  const { user } = useAuth()

  const myRank = data.findIndex(r => r.user_id === user?.id)

  return (
    <div className="max-w-3xl mx-auto animate-slide-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Trophy size={28} className="text-yellow-400" /> Leaderboard
          </h1>
          <p className="text-gray-400 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
            Live updates via Supabase Realtime
          </p>
        </div>
        <button onClick={refetch} className="btn-secondary">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* My rank banner */}
      {myRank >= 0 && (
        <div className="card bg-primary-600/10 border-primary-600/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-600/30 flex items-center justify-center font-display font-bold text-primary-400">
              #{myRank + 1}
            </div>
            <div>
              <p className="text-white font-medium">Your Position</p>
              <p className="text-gray-400 text-sm">
                Score: {data[myRank]?.total_score || 0} · Avg: {Math.round(data[myRank]?.avg_percentage || 0)}%
              </p>
            </div>
            {myRank === 0 && <span className="ml-auto text-2xl">🏆</span>}
          </div>
        </div>
      )}

      {/* Top 3 podium */}
      {!loading && data.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[data[1], data[0], data[2]].map((entry, i) => {
            const actualRank = i === 0 ? 1 : i === 1 ? 0 : 2
            const heights = ['h-24', 'h-32', 'h-20']
            return (
              <div key={entry?.user_id} className={clsx('card text-center flex flex-col items-center justify-end pb-4', heights[i])}>
                <div className="text-2xl mb-1">{BADGE_EMOJI[entry?.badge] || '🌱'}</div>
                <p className="text-xs font-medium text-white truncate w-full px-2">{entry?.full_name?.split(' ')[0]}</p>
                <p className="text-xs text-gray-500">{entry?.total_score} pts</p>
                <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border mt-2', RANK_STYLE[actualRank])}>
                  {actualRank + 1}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full list */}
      <div className="card">
        <div className="space-y-1">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-14 bg-surface-700 rounded-lg animate-pulse" />
            ))
          ) : error ? (
            <p className="text-red-400 text-center py-6">{error}</p>
          ) : data.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Trophy size={32} className="mx-auto mb-2 opacity-30" />
              <p>No data yet. Be the first to complete an exam!</p>
            </div>
          ) : (
            data.map((entry, idx) => {
              const isMe = entry.user_id === user?.id
              const pct = Math.round(entry.avg_percentage || 0)
              return (
                <div key={entry.user_id} className={clsx(
                  'flex items-center gap-4 px-4 py-3 rounded-xl transition-colors',
                  isMe ? 'bg-primary-600/10 border border-primary-600/20' : 'hover:bg-surface-700'
                )}>
                  {/* Rank */}
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border shrink-0',
                    RANK_STYLE[idx] || 'text-gray-500 bg-surface-700 border-surface-500'
                  )}>
                    {idx + 1}
                  </div>

                  {/* Avatar */}
                  <div className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    isMe ? 'bg-primary-600/40 text-primary-300' : 'bg-surface-600 text-gray-400'
                  )}>
                    {entry.full_name?.[0]?.toUpperCase() || '?'}
                  </div>

                  {/* Name + badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={clsx('font-medium text-sm truncate', isMe ? 'text-primary-300' : 'text-white')}>
                        {entry.full_name || 'Anonymous'} {isMe && '(You)'}
                      </p>
                      <span className="text-xs">{BADGE_EMOJI[entry.badge]}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Target size={10} /> {entry.total_attempts} exams</span>
                      <span className="flex items-center gap-1"><Flame size={10} className="text-orange-400" /> {entry.streak}d</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-white">{entry.total_score}</p>
                    <p className={clsx('text-xs', pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400')}>
                      {pct}% avg
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
