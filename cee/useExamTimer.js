import { useEffect, useRef, useState, useCallback } from 'react'

export function useExamTimer(durationMinutes, onTimeUp) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)
  const onTimeUpRef = useRef(onTimeUp)

  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const reset = useCallback(() => {
    stop()
    setTimeLeft(durationMinutes * 60)
  }, [durationMinutes, stop])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          onTimeUpRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const percentage = (timeLeft / (durationMinutes * 60)) * 100
  const isWarning = timeLeft <= 60 // last minute
  const isDanger = timeLeft <= 30  // last 30 seconds

  return {
    timeLeft,
    formatted,
    percentage,
    isWarning,
    isDanger,
    isRunning,
    start,
    stop,
    reset,
  }
}
