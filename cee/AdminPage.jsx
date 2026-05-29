import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { questions, examSessions } from '../lib/supabase'
import { Plus, Edit, Trash2, BookOpen, Search, X, Save, Clock, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const EMPTY_Q = { subject: '', chapter: '', question: '', options: ['', '', '', ''], answer: 0, explanation: '', difficulty: 'medium' }

function QuestionModal({ q, onSave, onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState(q || EMPTY_Q)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setOption = (i, val) => {
    const opts = [...form.options]
    opts[i] = val
    setForm(f => ({ ...f, options: opts }))
  }

  const handleSave = async () => {
    if (!form.subject || !form.chapter || !form.question || form.options.some(o => !o.trim())) {
      setError('Please fill all required fields')
      return
    }
    setLoading(true)
    const payload = { ...form, created_by: user.id }
    const { data, error: err } = q?.id
      ? await questions.update(q.id, payload)
      : await questions.create(payload)
    if (err) setError(err.message)
    else { onSave(data); onClose() }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-surface-800 border border-surface-600 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-white">{q?.id ? 'Edit Question' : 'Add Question'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Subject *</label>
            <input className="input-field text-sm" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Mathematics" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Chapter *</label>
            <input className="input-field text-sm" value={form.chapter} onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))} placeholder="e.g. Algebra" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Question *</label>
          <textarea className="input-field text-sm" rows={3} value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Enter the question..." />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-2">Options * (select correct answer)</label>
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => setForm(f => ({ ...f, answer: i }))}
                  className={clsx(
                    'w-7 h-7 rounded-full border text-xs font-bold shrink-0 transition-colors',
                    form.answer === i ? 'bg-green-500 border-green-400 text-white' : 'border-surface-500 text-gray-500 hover:border-green-500'
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </button>
                <input className="input-field text-sm" value={opt} onChange={e => setOption(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
            <select className="input-field text-sm" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Explanation (optional)</label>
          <textarea className="input-field text-sm" rows={2} value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Explain why the correct answer is right..." />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={14} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { user } = useAuth()
  const [qs, setQs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState({ subject: '', difficulty: '' })
  const [modal, setModal] = useState(null) // null | 'add' | question object
  const [deleteId, setDeleteId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [sessionForm, setSessionForm] = useState({ subject: '', chapter: '', title: '', duration: 15 })
  const [showSessionForm, setShowSessionForm] = useState(false)

  const fetchQuestions = async () => {
    const { data } = await questions.list()
    setQs(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchQuestions() }, [])
  useEffect(() => { examSessions.list().then(({ data }) => setSessions(data || [])) }, [])

  const handleDelete = async (id) => {
    await questions.delete(id)
    setQs(prev => prev.filter(q => q.id !== id))
    setDeleteId(null)
  }

  const handleSave = (saved) => {
    setQs(prev => {
      const idx = prev.findIndex(q => q.id === saved.id)
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n }
      return [saved, ...prev]
    })
  }

  const handleCreateSession = async () => {
    const { data } = await examSessions.create({ ...sessionForm, created_by: user.id })
    if (data) setSessions(prev => [data, ...prev])
    setShowSessionForm(false)
    setSessionForm({ subject: '', chapter: '', title: '', duration: 15 })
  }

  const filtered = qs.filter(q => {
    const matchSearch = !search || q.question.toLowerCase().includes(search.toLowerCase()) || q.subject.toLowerCase().includes(search.toLowerCase())
    const matchSubject = !filter.subject || q.subject === filter.subject
    const matchDiff = !filter.difficulty || q.difficulty === filter.difficulty
    return matchSearch && matchSubject && matchDiff
  })

  const subjects = [...new Set(qs.map(q => q.subject))]

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Question Bank</h1>
          <p className="text-gray-400 mt-1">{qs.length} questions total</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary">
          <Plus size={16} /> Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-field pl-9" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-40" value={filter.subject} onChange={e => setFilter(f => ({ ...f, subject: e.target.value }))}>
          <option value="">All subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input-field w-36" value={filter.difficulty} onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value }))}>
          <option value="">All levels</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Questions list */}
      <div className="card">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-surface-700 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
            <p>No questions found</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-700">
            {filtered.map(q => (
              <div key={q.id} className="py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs bg-primary-600/20 text-primary-400 border border-primary-600/20 px-2 py-0.5 rounded">{q.subject}</span>
                    <span className="text-xs bg-surface-700 text-gray-400 px-2 py-0.5 rounded">{q.chapter}</span>
                    <span className={clsx('text-xs px-2 py-0.5 rounded capitalize',
                      q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                      q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    )}>{q.difficulty}</span>
                  </div>
                  <p className="text-sm text-white line-clamp-1">{q.question}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Correct: {q.options[q.answer]}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setModal(q)} className="p-2 text-gray-500 hover:text-primary-400 hover:bg-primary-600/10 rounded-lg transition-colors">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => setDeleteId(q.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exam Sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-white">Exam Sessions</h2>
          <button onClick={() => setShowSessionForm(!showSessionForm)} className="btn-secondary text-sm py-2">
            <Plus size={14} /> Create Session
          </button>
        </div>

        {showSessionForm && (
          <div className="bg-surface-700 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field text-sm" placeholder="Subject" value={sessionForm.subject} onChange={e => setSessionForm(f => ({ ...f, subject: e.target.value }))} />
              <input className="input-field text-sm" placeholder="Chapter" value={sessionForm.chapter} onChange={e => setSessionForm(f => ({ ...f, chapter: e.target.value }))} />
            </div>
            <input className="input-field text-sm" placeholder="Session title (optional)" value={sessionForm.title} onChange={e => setSessionForm(f => ({ ...f, title: e.target.value }))} />
            <div className="flex items-center gap-3">
              <select className="input-field text-sm" value={sessionForm.duration} onChange={e => setSessionForm(f => ({ ...f, duration: +e.target.value }))}>
                {[5,10,15,20,30,45,60].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
              <button onClick={handleCreateSession} className="btn-primary">Create</button>
              <button onClick={() => setShowSessionForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        {sessions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No sessions created yet</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center gap-4 p-3 bg-surface-700 rounded-lg">
                <Clock size={16} className="text-primary-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{s.title || `${s.subject} — ${s.chapter}`}</p>
                  <p className="text-xs text-gray-500">{s.duration} min · {s.is_active ? '✅ Active' : '⏸ Inactive'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Modal */}
      {modal && (
        <QuestionModal
          q={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-display font-bold text-white mb-2">Delete Question?</h3>
            <p className="text-gray-400 text-sm mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1 justify-center">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
