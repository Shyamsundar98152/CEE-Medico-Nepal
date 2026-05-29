import { useEffect, useState, useCallback } from 'react'
import { leaderboard as leaderboardApi } from '../lib/supabase'

export function useLeaderboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeaderboard = useCallback(async () => {
    const { data: rows, error: err } = await leaderboardApi.get(50)
    if (err) setError(err.message)
    else setData(rows || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLeaderboard()

    // Subscribe to realtime updates on attempts table
    const channel = leaderboardApi.subscribeToUpdates(() => {
      // Re-fetch leaderboard when a new attempt is recorded
      fetchLeaderboard()
    })

    return () => {
      channel.unsubscribe()
    }
  }, [fetchLeaderboard])

  return { data, loading, error, refetch: fetchLeaderboard }
}
