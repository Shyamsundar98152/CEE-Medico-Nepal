import { useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { questions, attempts, activityLogs, getAIExplanation } from '../lib/supabase'
import { useExamTimer } from '../hooks/useExamTimer'
import { BookOpen, Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Zap, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const SUBJECTS = ['Mathematics', 'Science', 'Computer Science']
const CHAPTERS = {
  Mathematics: ['Algebra', 'Geometry', 'Statistics'],
  Science: ['Physics', 'Chemistry', 'Biology'],
  'Computer Science': ['Programming', 'Networking', 'Algorithms'],
}

// ── SETUP SCREEN ──────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [subject, setSubject] = useState('')
  const [chapter, setChapter] = useState('')
  const [duration, setDuration] = useState(15)
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStart = async () => {
    if (!subject || !chapter) { setError('Please select subject and chapter'); return }
    setLoading(true)
    setError('')
    const { data, error: err } = await questions.getForExam(subject, chapter, count)
    if (err || !data?.length) {
      setError('No questions found for this selection. Try another chapter.')
      setLoading(false)
      return
    }
    onStart({ questions: data, subject, chapter, duration })
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Start Exam</h1>
        <p className="text-gray-400 mt-1">Configure your exam settings</p>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
          <select className="input-field" value={subject} onChange={e => { setSubject(e.target.value); setChapter('') }}>
            <option value="">Select subject...</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Chapter</label>
          <select className="input-field" value={chapter} onChange={e => setChapter(e.target.value)} disabled={!subject}>
            <option value="">Select chapter...</option>
            {subject && CHAPTERS[subject]?.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Questions</label>
            <select className="input-field" value={count} onChange={e => setCount(+e.target.value)}>
              {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Duration</label>
            <select className="input-field" value={duration} onChange={e => setDuration(+e.target.value)}>
              {[5, 10, 15, 20, 30].map(n => <option key={n} value={n}>{n} minutes</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <button onClick={handleStart} disabled={loading} className="btn-primary w-full justify-center py-3">
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><BookOpen size={16} /> Start Exam</>}
        </button>
      </div>
    </div>
  )
}

// ── EXAM SCREEN ───────────────────────────────────────────────
function ExamScreen({ config, onComplete }) {
  const { questions: qs, subject, chapter, duration } = config
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({}) // questionId -> optionIndex
  const [submitted, setSubmitted] = useState(false)

  const handleTimeUp = useCallback(() => {
    if (!submitted) handleSubmit(true)
  }, [submitted])

  const timer = useExamTimer(duration, handleTimeUp)

  useState(() => { timer.start() }, [])

  const handleAnswer = (optionIndex) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [qs[current].id]: optionIndex }))
  }

  const handleSubmit = async (autoSubmit = false) => {
    if (submitted) return
    timer.stop()
    setSubmitted(true)

    let score = 0
    qs.forEach(q => {
      if (answers[q.id] === q.answer) score++
    })

    onComplete({
      questions: qs,
      answers,
      score,
      total: qs.length,
      subject,
      chapter,
      timeTaken: duration * 60 - timer.timeLeft,
      autoSubmit,
    })
  }

  const q = qs[current]
  const answered = Object.keys(answers).length

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-white">{subject} — {chapter}</h1>
          <p className="text-gray-400 text-sm">{answered}/{qs.length} answered</p>
        </div>
        <div className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg',
          timer.isDanger ? 'bg-red-500/20 border-red-500/40 text-red-400 timer-warning' :
          timer.isWarning ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' :
          'bg-surface-700 border-surface-500 text-white'
        )}>
          <Clock size={18} />
          {timer.formatted}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface-700 rounded-full mb-6">
        <div
          className={clsx('h-full rounded-full transition-all duration-1000',
            timer.isDanger ? 'bg-red-500' : timer.isWarning ? 'bg-yellow-500' : 'bg-primary-500'
          )}
          style={{ width: `${timer.percentage}%` }}
        />
      </div>

      {/* Question */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span className="bg-primary-600/20 text-primary-400 border border-primary-600/20 px-2 py-0.5 rounded font-medium">
            Q{current + 1}/{qs.length}
          </span>
          <span className="capitalize">{q.difficulty}</span>
        </div>
        <p className="text-white text-lg font-medium leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            className={clsx(
              'w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 flex items-center gap-3',
              answers[q.id] === idx
                ? 'bg-primary-600/20 border-primary-500/60 text-white'
                : 'bg-surface-700 border-surface-500 text-gray-300 hover:border-primary-600/40 hover:bg-surface-600'
            )}
          >
            <span className={clsx(
              'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
              answers[q.id] === idx ? 'bg-primary-600 text-white' : 'bg-surface-600 text-gray-400'
            )}>
              {String.fromCharCode(65 + idx)}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="btn-secondary">
          <ChevronLeft size={16} /> Previous
        </button>

        <div className="flex gap-1">
          {qs.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={clsx(
                'w-7 h-7 rounded text-xs font-medium transition-colors',
                i === current ? 'bg-primary-600 text-white' :
                answers[qs[i].id] !== undefined ? 'bg-green-500/30 text-green-400' :
                'bg-surface-700 text-gray-500 hover:bg-surface-600'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {current < qs.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} className="btn-secondary">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={() => handleSubmit(false)} className="btn-primary">
            <Zap size={16} /> Submit Exam
          </button>
        )}
      </div>
    </div>
  )
}

// ── RESULTS SCREEN ────────────────────────────────────────────
function ResultsScreen({ result, onRetake, onNew }) {
  const { user } = useAuth()
  const [aiExplanation, setAiExplanation] = useState({})
  const [loadingAI, setLoadingAI] = useState({})
  const [saved, setSaved] = useState(false)

  const pct = Math.round((result.score / result.total) * 100)
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'F'
  const gradeColor = pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'

  useState(() => {
    const save = async () => {
      if (user) {
        await attempts.create({
          user_id: user.id,
          subject: result.subject,
          chapter: result.chapter,
          score: result.score,
          total: result.total,
          answers: result.answers,
          time_taken: result.timeTaken,
        })
        await activityLogs.log(user.id, 'exam_completed', {
          subject: result.subject,
          score: result.score,
          total: result.total,
        })
        setSaved(true)
      }
    }
    save()
  }, [])

  const fetchAI = async (q) => {
    setLoadingAI(prev => ({ ...prev, [q.id]: true }))
    const explanation = await getAIExplanation(q.question, q.options, q.answer, result.answers[q.id])
    setAiExplanation(prev => ({ ...prev, [q.id]: explanation }))
    setLoadingAI(prev => ({ ...prev, [q.id]: false }))
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up space-y-6">
      {/* Score card */}
      <div className="card border-primary-600/20 bg-gradient-to-br from-primary-600/10 to-transparent text-center py-8">
        {result.autoSubmit && (
          <div className="flex items-center gap-2 justify-center text-yellow-400 text-sm mb-4">
            <AlertTriangle size={16} /> Auto-submitted when timer ended
          </div>
        )}
        <div className={`text-7xl font-display font-bold ${gradeColor} mb-2`}>{grade}</div>
        <div className="text-4xl font-display font-bold text-white mb-1">{pct}%</div>
        <p className="text-gray-400">{result.score} out of {result.total} correct</p>
        <p className="text-gray-500 text-sm mt-1">{result.subject} — {result.chapter}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onRetake} className="btn-secondary flex-1 justify-center">Retry Same</button>
        <button onClick={onNew} className="btn-primary flex-1 justify-center">New Exam</button>
      </div>

      {/* Question review */}
      <div className="card">
        <h2 className="font-display font-semibold text-white mb-4">Question Review</h2>
        <div className="space-y-4">
          {result.questions.map((q, i) => {
            const userAns = result.answers[q.id]
            const isCorrect = userAns === q.answer
            return (
              <div key={q.id} className={clsx(
                'p-4 rounded-xl border',
                isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
              )}>
                <div className="flex items-start gap-3">
                  {isCorrect ? <CheckCircle size={18} className="text-green-400 mt-0.5 shrink-0" /> : <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium mb-2">Q{i+1}. {q.question}</p>
                    <div className="space-y-1 mb-3">
                      {q.options.map((opt, idx) => (
                        <div key={idx} className={clsx('text-xs px-2 py-1 rounded', 
                          idx === q.answer ? 'text-green-400 bg-green-500/10' :
                          idx === userAns && !isCorrect ? 'text-red-400 bg-red-500/10' :
                          'text-gray-500'
                        )}>
                          {String.fromCharCode(65+idx)}. {opt}
                          {idx === q.answer && ' ✓ Correct'}
                          {idx === userAns && !isCorrect && ' ✗ Your answer'}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-gray-400 italic bg-surface-700 rounded p-2">{q.explanation}</p>
                    )}
                    {!aiExplanation[q.id] && (
                      <button
                        onClick={() => fetchAI(q)}
                        disabled={loadingAI[q.id]}
                        className="mt-2 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                      >
                        <Zap size={12} />
                        {loadingAI[q.id] ? 'Getting AI explanation...' : 'Get AI explanation'}
                      </button>
                    )}
                    {aiExplanation[q.id] && (
                      <div className="mt-2 p-2 bg-primary-600/10 border border-primary-600/20 rounded text-xs text-primary-300">
                        <Zap size={10} className="inline mr-1" /> {aiExplanation[q.id]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── MAIN EXAM PAGE ─────────────────────────────────────────────
export default function ExamPage() {
  const [phase, setPhase] = useState('setup') // setup | exam | results
  const [config, setConfig] = useState(null)
  const [result, setResult] = useState(null)

  const handleStart = (cfg) => { setConfig(cfg); setPhase('exam') }
  const handleComplete = (res) => { setResult(res); setPhase('results') }
  const handleRetake = () => { setPhase('exam') }
  const handleNew = () => { setConfig(null); setResult(null); setPhase('setup') }

  if (phase === 'setup') return <SetupScreen onStart={handleStart} />
  if (phase === 'exam') return <ExamScreen config={config} onComplete={handleComplete} />
  if (phase === 'results') return <ResultsScreen result={result} onRetake={handleRetake} onNew={handleNew} />
}
